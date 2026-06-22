# SOBAT BADUY

SOBAT BADUY adalah prototype HTML responsif untuk aplikasi skrining dini TBC berbasis komunitas di Desa Kanekes, Leuwidamar, Lebak, Banten. Aplikasi ini merupakan bagian dari Program SI-KASEP: Sistem Informasi Kenali, Amati, Skrining, Edukasi, Pengobatan.

Prototype ini dibuat untuk dua peran utama: kader kesehatan dan admin atau petugas Puskesmas. Antarmuka kader dibuat mobile-first, sedangkan antarmuka admin menyediakan monitoring, grafik, peta ilustratif, data skrining, dan placeholder laporan.

## Layar Utama

- Splash screen
- Login kader
- Dashboard kader
- Alur skrining 5 tahap
- Hasil dan rekomendasi tindak lanjut
- Rujukan Puskesmas
- Riwayat skrining
- Edukasi TBC
- Dashboard admin
- Data skrining admin
- Modal Keamanan dan Etika Data

## Teknologi

- Vite Vanilla JavaScript
- Semantic HTML5
- Bootstrap 5
- Bootstrap Icons
- Alpine.js
- Chart.js
- Leaflet
- LocalStorage
- Service worker dan web manifest

## Instalasi

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Deployment Vercel

Cara utama:

1. Simpan project di repository Git.
2. Hubungkan repository ke Vercel.
3. Gunakan pengaturan default Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.

Alternatif Vercel CLI:

```bash
npm install -g vercel
vercel
vercel --prod
```

## Login Demo

- ID Kader: `kader01`
- Password: `demo123`

## Batasan Prototype

- Tidak ada backend.
- Tidak ada database server.
- Tidak ada sinkronisasi cloud nyata.
- Data hanya disimpan lokal melalui LocalStorage.
- Tombol cetak, bagikan, PDF, audio, video, dan kamera masih berupa placeholder.
- Peta admin hanya menggunakan titik ilustratif wilayah, bukan lokasi rumah warga.
- Autentikasi hanya disimulasikan di browser.

## Mode Offline

Aplikasi mendeteksi status `navigator.onLine`. Saat offline, draft dan hasil skrining disimpan sementara di perangkat. Saat online, tombol sinkronisasi hanya menandai data prototype sebagai tersinkron. Tidak ada upload ke server.

## Privasi Data

Gunakan inisial pada tampilan daftar. Jangan membagikan data kesehatan melalui kanal tidak resmi. Prototype ini tidak mengklaim enkripsi lokal atau keamanan server karena fitur tersebut belum diimplementasikan.

## Keselamatan Medis

Hasil skrining bukan diagnosis medis. Pemeriksaan lebih lanjut perlu dilakukan oleh tenaga kesehatan.

Nilai dan aturan klasifikasi pada prototipe hanya digunakan untuk mendemonstrasikan alur UI. Aturan skrining final wajib divalidasi dan disetujui oleh tim medis atau Puskesmas sebelum digunakan dalam layanan masyarakat.

## Integrasi Lanjutan

Pengembangan berikutnya dapat menambahkan backend aman, autentikasi berbasis peran, database terenkripsi, audit trail, sinkronisasi offline-first yang benar, dashboard operasional lengkap, validasi aturan oleh tenaga kesehatan, dan proses persetujuan data yang sesuai etika kesehatan serta adat setempat.
# sikasep
