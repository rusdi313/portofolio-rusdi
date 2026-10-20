# Mengelola portofolio melalui Supabase

Frontend baru mengambil profil, skill, pendidikan, proyek, pengalaman, dan sertifikasi langsung dari Supabase. Perubahan konten tidak memerlukan push GitHub atau deploy ulang setelah migrasi dan deploy awal selesai.

## Setup satu kali

1. Buka project Supabase yang sesuai dengan `VITE_SUPABASE_URL` aplikasi. Simpan backup/export tabel lama sebelum migrasi.
2. Jalankan **`portfolio-schema.sql`** di SQL Editor. Script mempertahankan baris lama, menambah kolom, menyiapkan akses baca konten terpublikasi, Realtime, dan bucket `portfolio-assets`.
3. Jalankan **`seed-experiences.sql`** jika ingin melengkapi lima pengalaman dari data awal. ID yang sudah ada tidak ditimpa.
4. Jalankan **`portfolio-seed.sql`**. Isinya profil CV, 37 skill, dua pendidikan, tiga studi kasus, serta penyesuaian nama posisi/periode pengalaman lama yang masih cocok dengan nilai bawaan.
5. Di **Storage → portfolio-assets**, unggah `uploads/cv-rusdi-aulia-romadhon.pdf` yang sudah disiapkan. Salin public URL ke **Table Editor → profile → cv_url**. Tombol CV muncul setelah URL diisi. Folder uploads diabaikan Git.
6. Lengkapi dokumentasi proyek. Sertifikat tetap menggunakan koleksi lama; perubahan sertifikat dilakukan sendiri melalui dashboard nanti. Preview website, lalu deploy frontend baru satu kali.

Jangan menjalankan `experiences.sql` lama setelah migrasi baru: policy lama membolehkan seluruh baris pengalaman terbaca, termasuk draft. Jika terlanjur, jalankan ulang `portfolio-schema.sql`.

Script schema dan seed dapat dijalankan ulang. Seed tidak menimpa profil/skill/pendidikan yang sudah ada, atau proyek dengan judul sama. Seed tidak menambah atau mengubah sertifikat. Mengganti judul lalu menjalankan seed lagi dapat menambah entri CV semula; untuk perubahan rutin cukup gunakan Table Editor.

Migrasi mengganti policy SELECT/ALL keenam tabel dan mencabut akses tulis peran `anon`/`authenticated`. Ini sesuai alur edit melalui dashboard; editor publik lama yang menulis langsung dari browser tidak lagi bisa menulis. Tabel lain seperti komentar tidak diubah.

## Kolom umum

| Kolom | Fungsi |
| --- | --- |
| `id` | Identitas otomatis; jangan diubah untuk konten yang sudah memiliki tautan. Profil hanya menggunakan ID `main`. |
| `is_published` | `true` untuk tampil, `false` untuk draft. Draft dibatasi oleh RLS, bukan sekadar disembunyikan di UI. |
| `sort_order` | Angka kecil tampil lebih dahulu. Untuk skill, atur rentang per kategori, misalnya 100–199 dan 200–299. |
| `featured` | Khusus projects/certificates: ditampilkan lebih dahulu, lalu mengikuti `sort_order`. |

## Profil: `profile`

Edit satu baris `main`: `name`, `headline`, `status`, `hero_description`, `about`, `approach`, `location`, `email`, `linkedin_url`, `github_url`, `photo_url`, `cv_url`, `contact_title`, dan `contact_description`.

Home, About, kontak, dan metadata halaman membaca profil yang sama. Email membuka aplikasi email melalui `mailto:`. Tidak ada formulir yang mengirim pesan ke alamat lama. Isi lokasi umum seperti Depok; alamat rumah lengkap tidak diperlukan.

## Skill: `skills`

`name` = nama kemampuan/tool; `category` = nama kelompok. Kelompok baru otomatis muncul tanpa perubahan kode. Seed mencakup Cybersecurity, Security Tools, Networking & Infrastructure, IT Support, Programming, serta Tools. Tidak memakai persentase kemampuan yang tidak memiliki dasar pengukuran.

## Pendidikan: `education`

`institution`, `degree`, `period`, `gpa` (opsional), `highlights` (array teks). Contoh: `["Mata kuliah relevan: Keamanan Siber, Kriptografi", "Asisten laboratorium"]`.

## Proyek: `projects`

Kolom lama tetap dipakai dengan kapitalisasi yang sama: `Title`, `Description`, `Img`, `Link`, `Github`, `TechStack`, `Features`.

| Kolom tambahan | Isi |
| --- | --- |
| `category` | Cybersecurity, Networking, Automation, Web Development, atau kategori baru. Filter dibuat otomatis. |
| `role`, `period` | Peran dan waktu pengerjaan |
| `context` | Latar belakang, tujuan, dan ruang lingkup |
| `methods` | Pendekatan dan metode |
| `outcomes` | Hasil dan pembelajaran yang bisa dipertanggungjawabkan |
| `report_url` | Tautan laporan atau write-up |

`TechStack` dan `Features` berupa array. Kolom narasi mendukung baris baru sebagai teks biasa. Tautan kosong atau nilai `Private` tidak menghasilkan tombol eksternal. Proyek tanpa gambar mendapat ilustrasi generik. Halaman `/project/:id` mengambil data langsung sehingga bisa dibuka tanpa pernah mengunjungi homepage.

## Sertifikasi: `certificates`

Kartu menampilkan thumbnail kecil dari `Img`, tahun dari `issued_on`, nama dari `name`, dan penyelenggara dari `issuer`. Klik gambar untuk membuka versi lengkap.

Isi `name`, `issuer`, `issued_on`, `category`, `credential_url`, `Img`, `featured`, dan `sort_order`. Contoh `issued_on`: `2026-08-01`; kartu hanya menampilkan `2026`. Informasi yang belum diisi akan ditandai, tanpa menebak nama atau penyelenggara dari gambar.

Koleksi sertifikat yang sudah ada tetap digunakan dari kolom `Img`. Seed CV tidak memasukkan sembilan sertifikasi dari CV dan tidak mengubah data sertifikat lama. Kolom metadata tambahan bersifat opsional dan dapat diisi sendiri nanti lewat Table Editor.

Jika seed versi sebelumnya sudah sempat dijalankan, mengubah file seed tidak menghapus baris yang telanjur masuk. Kelola baris tersebut secara manual melalui dashboard sesuai koleksi yang ingin ditampilkan.

## Pengalaman: `experiences`

`role`, `company`, `period`, `location`, `type`, `current`, `summary`, `highlights` (array), `technologies` (array), `sort_order`, `is_published`.

Gunakan `type=Organization` untuk organisasi. Jenis lain masuk filter kerja. Seed menyesuaikan Stukka menjadi November 2025–Februari 2026 dan posisi CV Multimedia menjadi Network Technician Intern. Perubahan hanya diterapkan jika nilainya masih sama dengan data lama yang dikenali.

## File dan pembaruan

Bucket `portfolio-assets` bersifat publik: gunakan untuk aset yang memang akan tampil di portofolio. Format yang disiapkan: PDF, JPEG, PNG, WebP, maksimal 10 MB. Upload dilakukan dari dashboard; frontend tidak memiliki hak upload. Untuk mengganti file gunakan nama baru, lalu ubah URL di tabel agar tidak tertahan cache.

Semua bagian mengambil ulang data ketika menerima event Realtime, koneksi tersambung kembali, browser kembali online, serta setiap 30 detik. Perubahan ke draft atau penghapusan juga tercermin paling lambat pada pengambilan ulang berkala bila event tidak diterima. Data terakhir selama sesi tetap terlihat saat request gagal; ada pesan dan tombol coba lagi. Tidak ada cache localStorage atau fallback koleksi statis yang bisa menampilkan konten yang sudah dihapus.

## Verifikasi setelah migrasi

- Edit headline, skill, dan urutan pengalaman; pastikan berubah tanpa deploy.
- Tambah kategori proyek baru dan coba filternya.
- Ubah proyek menjadi draft; pastikan hilang dari daftar dan URL detail setelah data diperbarui.
- Coba tautan detail di tab baru, CV, kredensial, dan email.
- Periksa tampilan mobile, kondisi tabel kosong, serta coba lagi setelah gangguan koneksi.

Kunci frontend harus anon/publishable key. Jangan memasukkan service-role key ke variabel `VITE_*`.

## Jika seed gagal dengan `projects_pkey` / ID sudah ada

Penghitung ID otomatis bisa tertinggal setelah data proyek diimpor atau ID diisi manual. `portfolio-seed.sql` sekarang menyelaraskan sequence dengan ID terbesar sebelum menambah proyek, tanpa mengubah ID/data proyek lama atau memundurkan sequence yang sudah lebih tinggi.

Salin ulang **seluruh file `portfolio-seed.sql` terbaru** ke SQL Editor dan jalankan kembali. Tidak perlu menghapus proyek atau menjalankan ulang schema. Jika editor melaporkan transaksi masih gagal (`25P02`), jalankan `ROLLBACK;` terlebih dahulu. Sertifikat tetap tidak disentuh seed.
