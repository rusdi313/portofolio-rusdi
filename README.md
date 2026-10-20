# Portofolio Rusdi Aulia Romadhon

Portofolio dengan fokus Cybersecurity, Network Security, dan IT Infrastructure. Profil, skill, proyek, pengalaman, sertifikasi, serta pendidikan dikelola melalui Supabase.

## Menjalankan aplikasi

```sh
npm install
npm run dev
```

Buat `.env` lokal dengan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`. Jangan gunakan service-role key. Di PowerShell yang membatasi file `.ps1`, gunakan `npm.cmd`.

**Sebelum deploy frontend baru, jalankan migrasi dan seed sesuai [panduan Supabase](supabase/README.md).** Database lama belum memiliki tabel/kolom konten baru. File CV siap upload berada di folder lokal `supabase/uploads/`, yang tidak dimasukkan ke Git.

## Pembaruan konten

Gunakan Table Editor untuk mengubah isi, kategori, urutan, status unggulan, dan draft. Gunakan Storage untuk CV, gambar, dan dokumen. Setelah setup awal, pembaruan konten tidak memerlukan deploy. Penambahan fitur/layout tetap melalui kode.

## Verifikasi

```sh
npm run lint
npm run build
python tests/portfolio_browser.py
```

Uji browser memerlukan Python Playwright dan Chromium (`pip install playwright`, lalu `python -m playwright install chromium`). Tes menggunakan build `dist` dan respons Supabase simulasi; tidak menulis ke database. Screenshot desktop/mobile tersimpan di `.verification/`.

Uji mencakup filter, detail proyek dari URL langsung, draft, data kosong, retry, perubahan data, navigasi mobile, dan metadata. Periksa Realtime serta RLS pada Supabase sesudah menjalankan migrasi.

Untuk menguji SQL tanpa database produksi:

```sh
npm install --prefix .verification --no-save --package-lock=false @electric-sql/pglite
node tests/portfolio_sql.mjs
```

Tes PostgreSQL lokal memeriksa pengulangan migrasi/seed, pelestarian data lama, kompatibilitas array/JSONB, serta penolakan akses draft dan tulis publik.

## Struktur

- `src/Pages/PortfolioSite.jsx`: halaman utama dan bagian konten.
- `src/data/usePortfolioTable.js`: pengambilan data, Realtime, retry, dan polling.
- `src/components/ProjectDetail.jsx`: studi kasus dengan pengambilan data langsung.
- `src/components/PortfolioUI.jsx`: elemen UI bersama.
- `src/portfolio.css`: tampilan dan aturan responsif.
- `supabase/`: schema, seed CV, dan dokumentasi pengelolaan.

Dibangun dengan React, Vite, Supabase, React Router, Lucide, dan React Helmet Async. Proyek awal berasal dari template Portfolio V5 oleh Eki Zulfar Rachman; tampilan dan alur kontennya telah dirombak untuk portofolio Rusdi.
