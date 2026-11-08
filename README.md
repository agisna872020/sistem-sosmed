# Luevora — workspace media sosial

Workspace untuk menyimpan pengetahuan bisnis, membuat konten Instagram, dan mengirim hasil final melalui API Zernio. Informasi produk dan kredensial belum diisi.

## Struktur

```text
knowledge/
  brand/                 Identitas, audiens, gaya bahasa, visual
  products/              Informasi produk beserta sumbernya
  assets/                Logo, foto produk, font
  references/            Inspirasi dan insight
  skills/                Skill dan SOP dari pemilik bisnis
tema-konten/             Panduan tema postingan yang dapat dipilih
  _template/
    instruksi/           Instruksi pembuatan konten per tema
    detail/              Penjelasan konsep dan arah tema
    assets/              Aset khusus tema
    referensi/           Referensi tema
bridge/
  scripts/               Bridge API Zernio
  logs/                  Catatan operasional lokal
  .env                   Kredensial lokal, diabaikan Git
  .env.example           Contoh konfigurasi
content/
  _templates/post/       Template post baru
  YYYY-MM-DD/NN-slug/
    brief.md
    metadata.json
    build/
      src/               HTML dan CSS
      assets/            Bahan dan hasil generasi mentah
      prompts/           Prompt gambar dan riwayat generasi
      scripts/           Skrip khusus konten
      previews/          Percobaan dan revisi
    ready/
      media/             PNG/JPG final, sesuai urutan slide
      caption.txt
    publishing/          Catatan pengiriman dan hasil API
scripts/                 Alat produksi bersama
```

Contoh teknis tersimpan di `content/2026-11-07/01-contoh-workflow/`, berstatus `draft`. Gambar dan caption contoh dipakai untuk memverifikasi alat produksi.

## Mulai

Butuh Node.js 22+ dan npm. Jalankan dari root proyek:

```bash
npm install
npx playwright install chromium --no-shell
npm run content:new -- --date 2026-11-07 --slug perkenalan-produk
```

Perintah terakhir membuat `content/2026-11-07/01-perkenalan-produk/`. Jika tanggal dan slug yang sama sudah ada, perintah menolak membuat duplikat. Nomor berikutnya dipilih otomatis untuk konten lain pada tanggal tersebut.

1. Isi knowledge brand dan produk.
2. Lengkapi brief, edit `build/src/01.html` dan `styles.css`. Untuk carousel, tambahkan `02.html`, `03.html`, dan seterusnya.
3. Render gambar:

```bash
npm run content:render -- content/2026-11-07/01-perkenalan-produk
```

Renderer menghasilkan PNG 1080 × 1350 secara default dan memperbarui daftar media. Hasil render tetap berstatus `draft`. Template visual hanyalah placeholder untuk memulai produksi.

4. Isi `ready/caption.txt`, periksa visual dan fakta, lalu ubah `status` di `metadata.json` menjadi `ready`.
5. Jalankan simulasi pengiriman lokal:

```bash
npm run bridge:post -- content/2026-11-07/01-perkenalan-produk
```

Simulasi tidak menggunakan jaringan dan tidak memerlukan API key. Untuk konfigurasi akun dan pengiriman sungguhan, baca `bridge/README.md`.

## Konten dengan generate image

Gunakan folder post yang sama. Simpan prompt di `build/prompts/`, gambar mentah di `build/assets/`, lalu salin hasil final PNG/JPG ke `ready/media/`. Set `source` menjadi `imagegen` atau `mixed` dan isi array `media` di metadata dengan nama berkas final. Rendering HTML tidak wajib.

## Pemeriksaan

`npm test` memeriksa pembuatan folder, validasi media, dan perilaku bridge secara offline. Tes tidak memposting ke Instagram.

## Tema postingan

Lihat `tema-konten/README.md`. Setiap tema mempunyai folder instruksi dan detail tersendiri. Belum ada tema aktif; kerangka `_template/` sudah disiapkan untuk diisi sesuai arahan pemilik bisnis.
