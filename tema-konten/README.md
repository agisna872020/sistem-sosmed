# Tema konten Luevora

Simpan setiap tema postingan dalam folder sendiri. Pemilik bisnis dapat memilih tema dengan nama atau slug, misalnya: "Buat postingan dengan tema <nama-tema>."

Belum ada tema aktif yang ditentukan. Folder `_template/` adalah kerangka untuk menambahkan tema, bukan tema postingan yang siap dipakai.

## Struktur per tema

```text
tema-konten/
  README.md
  _template/
    README.md
    instruksi/
      README.md
    detail/
      README.md
    assets/
    referensi/
```

Salin `_template/` menjadi `tema-konten/nama-tema/` saat pemilik bisnis memberikan tema baru. Gunakan slug huruf kecil dan tanda hubung, misalnya `nama-tema`.

- `README.md`: nama tema, slug, ringkasan, dan status.
- `instruksi/README.md`: aturan praktis untuk membuat postingan dengan tema tersebut.
- `detail/README.md`: penjelasan konsep, tujuan, audiens, arah visual, dan alasan penggunaannya.
- `assets/`: aset khusus tema yang dapat dipakai ulang.
- `referensi/`: contoh visual, tautan referensi, dan catatan penerapannya.

## Daftar tema

Belum ada tema aktif. Tambahkan nama, slug, dan tautan foldernya di sini ketika tema sudah diisi.

## Cara agent memakai tema

1. Temukan folder berdasarkan nama atau slug yang dipilih pemilik bisnis.
2. Baca instruksi dan detail tema versi terbaru sebelum membuat atau merevisi konten.
3. Baca knowledge produk jika tugas membutuhkan informasi Luevora; tema menentukan cara penyajian, sedangkan knowledge produk menentukan fakta.
4. Simpan pilihan tema dalam brief dan field `theme` di metadata konten.
5. Simpan hasil kerja setiap postingan di `content/YYYY-MM-DD/NN-slug/`. Folder tema menyimpan panduan dan aset bersama.
