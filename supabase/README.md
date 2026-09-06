# Data pengalaman kerja

1. Buka project Supabase yang digunakan oleh `VITE_SUPABASE_URL` aplikasi.
2. Buka **SQL Editor**, salin isi `supabase/experiences.sql`, lalu klik **Run**. Script membuat tabel, akses baca publik, dan mengaktifkan Realtime.
3. Opsional: jalankan `supabase/seed-experiences.sql` untuk memasukkan lima pengalaman yang sudah diberikan. Menjalankannya kembali tidak menimpa data yang sudah Anda edit.
4. Buka **Table Editor → experiences** untuk menambah, mengedit, atau menghapus baris. Perubahan yang disimpan akan tampil di website tanpa deploy ulang.

| Kolom | Isi |
| --- | --- |
| `id` | Otomatis; tidak perlu diisi untuk baris baru |
| `role` | Nama posisi (wajib) |
| `company` | Perusahaan atau organisasi (wajib) |
| `period` | Teks periode, misalnya `Jan 2026 – Jul 2026 · 7 mos` (wajib) |
| `location` | Lokasi dan mode kerja |
| `type` | `Internship`, `Apprenticeship`, `Organization`, atau jenis lainnya |
| `current` | `true` jika masih bekerja di posisi ini |
| `summary` | Ringkasan opsional |
| `highlights` | Array teks tanggung jawab/pencapaian, misalnya `["Mengelola jaringan", "Membuat otomatisasi dokumen"]` |
| `technologies` | Array teks keterampilan, misalnya `["Python", "Microsoft Excel"]` |
| `sort_order` | Angka urutan; paling kecil ditampilkan paling atas (1, 2, 3, ...) |

Website menggunakan tabel ini sebagai sumber data; tidak ada fallback data statis. Tabel kosong menampilkan pesan kosong, sedangkan kegagalan mengambil data menampilkan tombol coba lagi dan mempertahankan data terakhir jika tersedia.

Realtime mengambil ulang daftar saat ada penambahan, perubahan, atau penghapusan. Aplikasi juga mengambil ulang data setiap 30 detik sebagai cadangan saat koneksi Realtime terganggu.

Verifikasi setelah setup: buka website, edit satu posisi di Table Editor dan simpan, lalu pastikan kartu berubah tanpa refresh. Coba juga tambah/hapus baris dan ubah `sort_order`.

Konfigurasi ini memakai client Supabase yang sudah ada. Pengunjung hanya memiliki akses baca; perubahan data dilakukan melalui dashboard. Jangan gunakan service-role key di frontend.

Referensi: https://supabase.com/docs/guides/realtime/postgres-changes
