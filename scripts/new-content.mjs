import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTENT_ROOT } from './lib/content.mjs';

export async function createContent(date, slug, base = CONTENT_ROOT) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')
      || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error('Gunakan tanggal kalender valid dengan format YYYY-MM-DD.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '')) throw new Error('Slug harus huruf kecil, angka, dan tanda hubung.');
  const day = path.join(base, date);
  await mkdir(day, { recursive: true });
  const entries = await readdir(day);
  if (entries.some(name => /^\d+-/.test(name) && name.replace(/^\d+-/, '') === slug)) {
    throw new Error('Konten dengan tanggal dan slug ini sudah ada.');
  }
  const sequence = Math.max(0, ...entries.map(name => Number(/^(\d+)-/.exec(name)?.[1] ?? 0))) + 1;
  const destination = path.join(day, String(sequence).padStart(2, '0') + '-' + slug);
  await mkdir(destination);
  const template = path.join(base, '_templates/post');
  for (const entry of await readdir(template)) {
    await cp(path.join(template, entry), path.join(destination, entry), { recursive: true, errorOnExist: true, force: false });
  }
  const metaPath = path.join(destination, 'metadata.json');
  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  Object.assign(meta, { plannedDate: date, slug, status: 'draft' });
  await writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n');
  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
      console.log('npm run content:new -- --date YYYY-MM-DD --slug nama-konten');
    } else {
      if (args.length !== 4 || args[0] !== '--date' || args[2] !== '--slug') throw new Error('Gunakan --date YYYY-MM-DD --slug nama-konten.');
      console.log(await createContent(args[1], args[3]));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
