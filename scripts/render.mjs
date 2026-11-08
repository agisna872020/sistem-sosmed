import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { contentDirectory, metadataFor } from './lib/content.mjs';

async function main() {
  if (process.argv.length !== 3 || process.argv[2] === '--help') {
    console.log('npm run content:render -- content/YYYY-MM-DD/NN-slug');
    process.exitCode = process.argv[2] === '--help' ? 0 : 1;
    return;
  }
  const directory = await contentDirectory(process.argv[2]);
  const meta = await metadataFor(directory);
  const { width, height } = meta.canvas ?? {};
  if (![width, height].every(n => Number.isInteger(n) && n >= 320 && n <= 4096)) {
    throw new Error('canvas.width dan canvas.height harus bilangan bulat 320–4096.');
  }
  const source = path.join(directory, 'build/src');
  const slides = (await readdir(source)).filter(name => /^\d{2}\.html$/.test(name)).sort();
  if (slides.length < 1 || slides.length > 10) throw new Error('Siapkan 1–10 slide HTML bernama 01.html, 02.html, dst.');
  // Invalidate readiness before touching any output, including a failed partial render.
  meta.status = 'draft';
  await writeFile(path.join(directory, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n');
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('Jalankan npm install dan npx playwright install chromium --no-shell terlebih dahulu.'); }
  const output = path.join(directory, 'ready/media');
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    for (const slide of slides) {
      await page.goto(pathToFileURL(path.join(source, slide)).href, { waitUntil: 'load' });
      await page.evaluate(async ({ width, height }) => {
        document.documentElement.style.setProperty('--canvas-width', width + 'px');
        document.documentElement.style.setProperty('--canvas-height', height + 'px');
        await document.fonts.ready;
        await Promise.all([...document.images].map(img => img.decode()));
      }, { width, height });
      const artboard = page.locator('[data-artboard]');
      if (await artboard.count() !== 1) throw new Error(slide + ': harus ada satu elemen data-artboard.');
      const bounds = await artboard.boundingBox();
      if (!bounds || Math.round(bounds.width) !== width || Math.round(bounds.height) !== height) {
        throw new Error(slide + ': ukuran data-artboard tidak sesuai metadata.canvas.');
      }
      const filename = slide.replace('.html', '.png');
      await artboard.screenshot({ path: path.join(output, filename), type: 'png', animations: 'disabled' });
      console.log('Rendered: ' + filename);
    }
  } finally { await browser.close(); }
  meta.source = 'html';
  meta.media = slides.map(slide => slide.replace('.html', '.png'));
  await writeFile(path.join(directory, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('Selesai. Periksa gambar dan caption sebelum menandai status ready.');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
