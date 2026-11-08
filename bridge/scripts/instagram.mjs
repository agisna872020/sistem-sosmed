import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, contentDirectory, readPost } from '../../scripts/lib/content.mjs';

const API = 'https://zernio.com/api/v1';

export function makePayload(post, accountId, urls) {
  return {
    content: post.caption,
    platforms: [{ platform: 'instagram', accountId }],
    mediaItems: urls.map(url => ({ type: 'image', url })),
    publishNow: true,
  };
}

export function requireReady(post) {
  if (post.metadata.status !== 'ready') throw new Error('Konten belum ready. Periksa hasil final dan metadata sebelum publikasi.');
}

function credentials() {
  try { process.loadEnvFile(path.join(ROOT, 'bridge/.env')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const key = process.env.ZERNIO_API_KEY?.trim();
  const accountId = process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID?.trim();
  if (!key) throw new Error('Isi ZERNIO_API_KEY di bridge/.env atau environment proses.');
  return { key, accountId };
}

async function request(key, endpoint, body) {
  let response;
  try {
    response = await fetch(API + endpoint, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: 'Bearer ' + key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new Error('Koneksi ke Zernio gagal atau timeout. Untuk pengiriman, periksa dashboard sebelum mencoba ulang.');
  }
  if (!response.ok) throw new Error('Zernio menjawab HTTP ' + response.status + '. Periksa akun/konfigurasi dan dashboard.');
  try { return await response.json(); }
  catch { throw new Error('Respons Zernio bukan JSON yang valid. Periksa dashboard sebelum mengulang pengiriman.'); }
}

async function accountsFor(key) {
  const result = await request(key, '/accounts');
  if (!Array.isArray(result.accounts)) throw new Error('Struktur respons daftar akun Zernio tidak dikenali.');
  return result.accounts;
}

async function exists(file) {
  try { await access(file); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function preview(directory) {
  const post = await readPost(directory);
  return {
    mode: 'dry-run',
    status: post.metadata.status,
    note: 'Simulasi lokal; tidak ada upload atau posting. local: bukan URL API.',
    payload: makePayload(post, '<ZERNIO_INSTAGRAM_ACCOUNT_ID>', post.media.map(media => 'local:ready/media/' + media.filename)),
  };
}

async function send(directory) {
  const post = await readPost(directory);
  requireReady(post);
  const { key, accountId } = credentials();
  if (!accountId) throw new Error('Isi ZERNIO_INSTAGRAM_ACCOUNT_ID di bridge/.env.');
  const accounts = await accountsFor(key);
  const target = accounts.find(account => account._id === accountId && account.platform === 'instagram');
  if (!target) throw new Error('ID tujuan tidak ditemukan sebagai akun Instagram yang dapat diakses API key ini.');
  const publishing = path.join(directory, 'publishing');
  await mkdir(publishing, { recursive: true });
  if (await exists(path.join(publishing, 'receipt.json')) || await exists(path.join(publishing, 'attempt.json'))) {
    throw new Error('Konten sudah pernah dicoba dikirim. Periksa publishing/ dan dashboard Zernio sebelum mengulang.');
  }
  const fingerprint = createHash('sha256').update(accountId).update(post.caption);
  for (const media of post.media) fingerprint.update(media.filename).update(media.bytes);
  await writeFile(path.join(publishing, 'attempt.json'), JSON.stringify({
    startedAt: new Date().toISOString(), accountId, username: target.username ?? null,
    fingerprint: fingerprint.digest('hex'), media: post.media.map(media => media.filename),
  }, null, 2) + '\n', { flag: 'wx' });
  const urls = [];
  for (const media of post.media) {
    const presigned = await request(key, '/media/presign', {
      filename: media.filename, contentType: media.contentType, size: media.bytes.length,
    });
    const uploadUrl = new URL(presigned.uploadUrl);
    const publicUrl = new URL(presigned.publicUrl);
    if (uploadUrl.protocol !== 'https:' || publicUrl.protocol !== 'https:') throw new Error('URL media Zernio harus HTTPS.');
    // Presigned storage upload deliberately carries no API Authorization header.
    let upload;
    try {
      upload = await fetch(uploadUrl, {
        method: 'PUT', headers: { 'Content-Type': media.contentType }, body: media.bytes,
        redirect: 'error', signal: AbortSignal.timeout(120000),
      });
    } catch { throw new Error('Upload media gagal atau timeout. Periksa attempt dan dashboard sebelum mencoba ulang.'); }
    if (!upload.ok) throw new Error('Upload media menjawab HTTP ' + upload.status + '.');
    urls.push(publicUrl.href);
  }
  const response = await request(key, '/posts', makePayload(post, accountId, urls));
  if (!response.post?._id) throw new Error('Respons tidak memiliki post ID. Periksa dashboard sebelum mengulang.');
  const receipt = {
    receivedAt: new Date().toISOString(), accountId, postId: response.post._id,
    status: response.post.status ?? 'unknown',
    platforms: (response.post.platforms ?? []).map(platform => ({
      platform: platform.platform, status: platform.status ?? null,
      platformPostUrl: platform.platformPostUrl ?? null,
    })),
  };
  await writeFile(path.join(publishing, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(receipt, null, 2));
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help') {
    console.log('accounts | post content/YYYY-MM-DD/NN-slug [--execute]\nTanpa --execute, post hanya simulasi lokal.');
    return;
  }
  if (command === 'accounts' && args.length === 0) {
    const { key } = credentials();
    const accounts = await accountsFor(key);
    console.log(JSON.stringify(accounts.map(account => ({
      id: account._id, platform: account.platform, username: account.username ?? null,
    })), null, 2));
    return;
  }
  if (command !== 'post' || args.length < 1 || args.length > 2
      || (args.length === 2 && args[1] !== '--execute')) throw new Error('Gunakan post PATH [--execute] atau accounts.');
  const directory = await contentDirectory(args[0]);
  if (args[1] === '--execute') await send(directory);
  else console.log(JSON.stringify(await preview(directory), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
