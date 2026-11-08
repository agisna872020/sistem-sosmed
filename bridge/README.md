# Bridge Instagram melalui Zernio

Bridge memakai API resmi Zernio dengan Node.js 22+, tanpa SDK tambahan. Versi awal ini menangani gambar feed dan carousel PNG/JPG; dukungan video, Story, Reel, serta penjadwalan belum disediakan.

## Konfigurasi

Isi `bridge/.env` secara lokal:

```dotenv
ZERNIO_API_KEY=
ZERNIO_INSTAGRAM_ACCOUNT_ID=
```

Berkas ini sudah dibuat kosong dengan izin akses hanya untuk pemilik dan diabaikan Git. Environment proses memiliki prioritas atas nilai dalam berkas. Jangan menaruh API key di script, metadata, atau caption.

Hubungkan akun Instagram bisnis/creator Luevora di Zernio terlebih dahulu. Untuk melihat akun yang terhubung:

```bash
npm run bridge:accounts
```

Pilih ID akun Instagram Luevora, lalu isi `ZERNIO_INSTAGRAM_ACCOUNT_ID`. Perintah daftar akun memerlukan API key dan akses jaringan.

## Simulasi lokal

```bash
npm run bridge:post -- content/2026-11-07/01-perkenalan-produk
```

Tanpa `--execute`, bridge hanya memeriksa caption, metadata, dan gambar lokal, lalu menampilkan rencana payload. URL berawalan `local:` dalam output simulasi adalah penanda lokal, bukan URL yang bisa dikirim ke API. Simulasi tidak membaca kredensial dan tidak melakukan upload atau posting.

## Publikasi sungguhan

Setelah pemilik bisnis meminta posting, konten sudah final, dan metadata berstatus `ready`:

```bash
npm run bridge:post -- content/2026-11-07/01-perkenalan-produk --execute
```

Bridge memverifikasi akun tujuan melalui daftar akun, meminta presigned URL untuk setiap gambar, mengunggah gambar, lalu membuat post dengan `publishNow: true`. Urutan gambar mengikuti `metadata.media`.

Sebelum panggilan upload/post pertama, bridge membuat `publishing/attempt.json`. Sesudah API menerima post, ringkasan hasil disimpan di `publishing/receipt.json`. Status dari API dicatat apa adanya; respons diterima belum selalu berarti Instagram selesai mempublikasikan.

Bridge menolak pengiriman berikutnya jika attempt/receipt sudah ada. Jika koneksi putus atau proses gagal, periksa dashboard Zernio terlebih dahulu. Setelah dipastikan tidak ada post yang dibuat, arsipkan attempt lama secara manual sebelum mencoba kembali. Tidak ada retry otomatis.

## Batas versi awal

- 1–10 gambar PNG/JPG, maksimal 8 MB per gambar.
- Caption wajib diisi, maksimal 2.200 karakter.
- Hanya berkas di `ready/media/` sesuai daftar metadata yang diunggah.
- Renderer HTML mengembalikan status ke `draft` setelah render.
- Integrasi sungguhan baru dapat diuji setelah kredensial diisi. Jangan menganggap simulasi sebagai pengujian koneksi.

## Referensi API

- https://docs.zernio.com/platforms/instagram
- https://docs.zernio.com/guides/media-uploads
- https://docs.zernio.com/media/get-media-presigned-url
- https://docs.zernio.com/posts/create-post
