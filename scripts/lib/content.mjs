import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT_ROOT = path.join(ROOT, 'content');

export async function contentDirectory(input) {
  if (!input) throw new Error('Berikan path folder konten.');
  const directory = await realpath(path.resolve(input));
  const base = await realpath(CONTENT_ROOT);
  const relative = path.relative(base, directory);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)
      || relative.split(path.sep).includes('_templates')) {
    throw new Error('Pilih folder post di content/YYYY-MM-DD/NN-slug/, bukan template.');
  }
  const parts = relative.split(path.sep);
  if (parts.length !== 2 || !/^\d{4}-\d{2}-\d{2}$/.test(parts[0])
      || !/^\d{2,}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1])) {
    throw new Error('Format folder harus content/YYYY-MM-DD/NN-slug/.');
  }
  if (!(await stat(directory)).isDirectory()) throw new Error('Path konten bukan folder.');
  return directory;
}

export async function metadataFor(directory) {
  return JSON.parse(await readFile(path.join(directory, 'metadata.json'), 'utf8'));
}

export async function mediaFile(directory, filename) {
  if (typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g)$/i.test(filename)) {
    throw new Error('Nama media harus nama file PNG/JPG tanpa subfolder.');
  }
  const base = await realpath(path.join(directory, 'ready/media'));
  const resolved = await realpath(path.join(base, filename));
  if (path.dirname(resolved) !== base) throw new Error('Media harus berada di ready/media/.');
  return resolved;
}

export function imageType(filename, bytes) {
  if (/\.png$/i.test(filename)
      && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (/\.jpe?g$/i.test(filename) && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  throw new Error('Isi berkas tidak sesuai format PNG/JPG: ' + filename);
}

export async function readPost(directory) {
  const metadata = await metadataFor(directory);
  if (metadata.brand !== 'Luevora' || metadata.platform !== 'instagram') {
    throw new Error('Metadata harus menggunakan brand Luevora dan platform instagram.');
  }
  const caption = (await readFile(path.join(directory, 'ready/caption.txt'), 'utf8')).trim();
  if (!caption || [...caption].length > 2200) throw new Error('Isi caption final, maksimal 2.200 karakter.');
  if (!Array.isArray(metadata.media) || metadata.media.length < 1 || metadata.media.length > 10
      || new Set(metadata.media).size !== metadata.media.length) {
    throw new Error('Daftarkan 1–10 nama gambar unik dalam metadata.media, sesuai urutan slide.');
  }
  const media = [];
  for (const filename of metadata.media) {
    const filenamePath = await mediaFile(directory, filename);
    const info = await stat(filenamePath);
    if (!info.isFile() || info.size > 8 * 1024 * 1024) throw new Error('Media harus file maksimal 8 MB: ' + filename);
    const bytes = await readFile(filenamePath);
    media.push({ filename, bytes, contentType: imageType(filename, bytes) });
  }
  return { metadata, caption, media };
}
