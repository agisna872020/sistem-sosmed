# Arsip konten

Gunakan `YYYY-MM-DD/NN-slug/`: tanggal rencana publikasi, nomor urut, dan nama singkat konten. Satu post atau carousel mempunyai satu folder. Tanggal belum berarti jadwal otomatis.

Buat folder memakai `npm run content:new -- --date YYYY-MM-DD --slug nama-konten`.

- `brief.md`: tujuan, audiens, pesan, produk, referensi, dan catatan revisi.
- `metadata.json`: tanggal rencana, sumber gambar, ukuran kanvas, status kerja, dan urutan media.
- `build/`: seluruh kode, bahan, prompt, skrip, dan preview.
- `ready/`: caption serta media terpilih yang siap diunggah.
- `publishing/`: attempt dan receipt pengiriman.

Status kerja: `draft` atau `ready`. Status publikasi dari Zernio disimpan terpisah di receipt agar penerimaan API tidak disalahartikan sebagai keberhasilan publikasi.

Jangan gunakan `_templates/` sebagai konten sungguhan. Simpan sumber kerja dan hasil final bersama agar konten dapat direvisi atau direproduksi.
