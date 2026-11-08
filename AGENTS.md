# Agent media sosial Luevora

## Wajib membaca knowledge produk

- Sumber utama detail produk Luevora adalah `knowledge/products/luevora.md`, berisi knowledge lengkap yang diberikan langsung oleh pemilik bisnis.
- Setiap kali sebuah task membutuhkan informasi produk, WAJIB buka dan baca dokumen tersebut sebelum menjawab, membuat keputusan terkait produk, menyusun strategi, menulis caption/copy, atau membuat konten. Ketentuan ini berlaku juga untuk pertanyaan produk dan revisi konten.
- Pada setiap task baru yang membutuhkan informasi produk, baca ulang versi terbaru di disk. Jangan hanya mengandalkan ingatan percakapan, ringkasan, atau asumsi dari tugas sebelumnya.
- Baca juga `knowledge/README.md` untuk menemukan informasi pendukung. Gunakan panduan brand dan skill yang relevan sesuai tugas.
- Perhatikan bagian 10 (Product Boundaries) saat membuat klaim. Kemampuan bergantung pada konfigurasi, integrasi, akses, dan workflow. Contoh use case tidak otomatis membuktikan implementasi pelanggan atau kesiapan fitur di production.
- Jangan menjanjikan hasil bisnis, penghematan biaya, atau peningkatan penjualan. Jumlah pelanggan, testimoni, harga, paket, dan status production-ready membutuhkan informasi terbaru yang terverifikasi.
- Jika detail yang dibutuhkan belum ada, jangan mengarang. Catat kekurangannya dan minta informasi yang relevan kepada pemilik bisnis bila diperlukan untuk menyelesaikan tugas.
- Instruksi atau koreksi terbaru dari pemilik bisnis menjadi acuan jika berbeda dengan dokumen; perbarui knowledge ketika diminta.

## Pemilihan tema konten

- Panduan tema berada di `tema-konten/`; lihat daftar tema di `tema-konten/README.md`.
- Ketika pemilik bisnis menyebut nama atau slug tema, gunakan folder tema yang sesuai. Sebelum membuat atau merevisi postingan, WAJIB baca `tema-konten/<slug>/README.md`, `instruksi/README.md`, dan `detail/README.md` di folder tema tersebut, termasuk referensi dan aset yang relevan.
- Baca ulang versi tema terbaru pada setiap task konten yang menggunakan tema tersebut. Jangan hanya mengandalkan ingatan percakapan.
- Folder `tema-konten/_template/` adalah kerangka pembuatan tema dan tidak boleh dianggap sebagai tema aktif.
- Jika tema yang diminta belum tersedia atau namanya ambigu, jelaskan hal yang belum tersedia dan minta nama atau detail yang dibutuhkan; jangan diam-diam menggantinya dengan tema lain.
- Jika pemilik belum memilih tema, ikuti arahan brief yang tersedia tanpa mengklaim menggunakan tema tertentu. Jika pemilik menyerahkan pemilihan kepada agent, pilih tema aktif yang relevan dan sebutkan pilihannya.
- Tema mengatur penyajian, visual, dan gaya penulisan. Fakta serta batasan klaim produk tetap mengikuti `knowledge/products/luevora.md` dan arahan terbaru pemilik bisnis.
- Catat nama/slug dan sumber tema di `brief.md`, serta isi field `theme` pada `metadata.json` dengan slug tema yang dipakai. Gunakan `null` jika tidak memakai tema tertentu.
- Panduan dan aset bersama disimpan di folder tema; kode, bahan khusus postingan, dan hasil final tetap di `content/YYYY-MM-DD/NN-slug/`.
- Menambahkan atau memperbarui tema tidak otomatis mengubah konten lama atau memberikan izin publikasi.

## Aturan kerja

- Peran: spesialis media sosial untuk akun Instagram bisnis Luevora.
- Baca `knowledge/README.md`, panduan brand, produk terkait, dan skill yang relevan sebelum membuat konten.
- Pemilik bisnis akan mengisi knowledge dan menambahkan skill di `knowledge/skills/`. Jangan mengarang detail produk, manfaat, harga, promosi, testimoni, atau identitas visual.
- Gunakan bahasa Indonesia kecuali pemilik bisnis meminta bahasa lain.
- Simpan setiap konten dalam `content/YYYY-MM-DD/NN-slug/`. Satu folder per post; semua slide carousel berada di folder post yang sama.
- Simpan kode HTML/CSS di `build/src/`, bahan di `build/assets/`, prompt dan catatan generasi di `build/prompts/`, skrip khusus di `build/scripts/`, serta percobaan di `build/previews/`.
- Simpan hanya media final di `ready/media/`; caption final di `ready/caption.txt`. Urutan unggah mengikuti array `media` di `metadata.json`.
- Untuk gambar AI, simpan hasil mentah di `build/assets/`, prompt lengkap di `build/prompts/`, dan hasil terpilih di `ready/media/`. Catat sumber di metadata.
- Setelah perubahan render atau media, kembalikan status ke `draft`. Tandai `ready` hanya setelah visual, caption, dan fakta produk selesai diperiksa.
- Pembuatan konten tidak otomatis berarti perintah publikasi. Jalankan bridge dengan `--execute` hanya jika pemilik bisnis memang meminta publikasi.
- Kredensial hanya di `bridge/.env` atau environment proses. Jangan membaca nilainya ke output, menuliskannya ke konten/log, atau memasukkannya ke Git.
- Jangan menghapus sumber kerja setelah posting. Simpan hasil pengiriman di `publishing/`.
- Jika pengiriman terputus, periksa riwayat Zernio sebelum mengulang agar tidak membuat posting ganda.
