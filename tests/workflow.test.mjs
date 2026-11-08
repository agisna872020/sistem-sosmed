import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ROOT, readPost, imageType, contentDirectory } from '../scripts/lib/content.mjs';
import { createContent } from '../scripts/new-content.mjs';
import { preview, makePayload, requireReady } from '../bridge/scripts/instagram.mjs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jKZkAAAAASUVORK5CYII=', 'base64');

async function fixture(t) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'luevora-test-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  await mkdir(path.join(base, '_templates'), { recursive: true });
  await cp(path.join(ROOT, 'content/_templates/post'), path.join(base, '_templates/post'), { recursive: true });
  return base;
}

async function completePost(t) {
  const base = await fixture(t);
  const directory = await createContent('2026-11-07', 'contoh', base);
  const metadataPath = path.join(directory, 'metadata.json');
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  metadata.media = ['01.png'];
  await writeFile(metadataPath, JSON.stringify(metadata));
  await writeFile(path.join(directory, 'ready/caption.txt'), 'Caption contoh untuk tes lokal.');
  await writeFile(path.join(directory, 'ready/media/01.png'), png);
  return directory;
}

test('folder per tanggal bernomor, menolak tanggal tidak valid dan duplikat', async t => {
  const base = await fixture(t);
  assert.equal(path.basename(await createContent('2026-11-07', 'produk-satu', base)), '01-produk-satu');
  assert.equal(path.basename(await createContent('2026-11-07', 'produk-dua', base)), '02-produk-dua');
  await assert.rejects(createContent('2026-11-07', 'produk-satu', base), /sudah ada/);
  await assert.rejects(createContent('2026-02-30', 'produk', base), /tanggal/);
  await assert.rejects(createContent('2026-11-07', '../escape', base), /Slug/);
});

test('simulasi tetap offline dan menolak eksekusi konten draft', async t => {
  const directory = await completePost(t);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Tes gagal: tidak boleh ada jaringan saat simulasi.'); };
  try {
    const result = await preview(directory);
    assert.equal(result.mode, 'dry-run');
    assert.equal(result.payload.mediaItems[0].url, 'local:ready/media/01.png');
    assert.equal(result.payload.platforms[0].accountId, '<ZERNIO_INSTAGRAM_ACCOUNT_ID>');
    const post = await readPost(directory);
    assert.throws(() => requireReady(post), /belum ready/);
    post.metadata.status = 'ready';
    assert.doesNotThrow(() => requireReady(post));
  } finally { globalThis.fetch = originalFetch; }
});

test('caption kosong, traversal media, duplikat slide dan format palsu ditolak', async t => {
  const directory = await completePost(t);
  const metadataPath = path.join(directory, 'metadata.json');
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  await writeFile(path.join(directory, 'ready/caption.txt'), '');
  await assert.rejects(readPost(directory), /caption/);
  await writeFile(path.join(directory, 'ready/caption.txt'), 'Caption valid');
  metadata.media = ['../../bridge/.env'];
  await writeFile(metadataPath, JSON.stringify(metadata));
  await assert.rejects(readPost(directory), /Nama media/);
  metadata.media = ['01.png', '01.png'];
  await writeFile(metadataPath, JSON.stringify(metadata));
  await assert.rejects(readPost(directory), /unik/);
  assert.throws(() => imageType('01.jpg', png), /format/);
  assert.throws(() => imageType('01.png', Buffer.from('bukan gambar')), /format/);
});

test('urutan carousel dipertahankan dalam payload', () => {
  const payload = makePayload({ caption: 'Caption' }, 'akun-luevora', ['https://example.com/02.png', 'https://example.com/01.png']);
  assert.deepEqual(payload.mediaItems.map(media => media.url), ['https://example.com/02.png', 'https://example.com/01.png']);
  assert.equal(payload.publishNow, true);
  assert.deepEqual(payload.platforms, [{ platform: 'instagram', accountId: 'akun-luevora' }]);
});

test('template dan path di luar arsip ditolak sebagai folder post', async () => {
  await assert.rejects(contentDirectory(path.join(ROOT, 'content/_templates/post')), /template/);
  await assert.rejects(contentDirectory(ROOT), /folder post/);
});
