# Pengawalan Kuliah

Platform pengawalan mahasiswa dari pendaftaran sampai wisuda, untuk beberapa kampus sekaligus.

## Fitur

- **Sisi Calon Mahasiswa / Mahasiswa** — daftar mandiri, isi biodata, lihat status & posisi tahap secara real-time (timeline dari Berkas Masuk sampai Wisuda), lihat IPK & riwayat nilai per semester.
- **Sisi Admin** — dashboard ringkasan per kampus/status, papan status (kanban) untuk melihat posisi semua mahasiswa di pipeline, data mahasiswa lengkap dengan pencarian & filter, kelola perpindahan tahap dan input nilai semester.
- Pipeline tetap terdiri dari 12 tahap: Berkas Masuk → Verifikasi Berkas → Tes Masuk → Pengumuman → Daftar Ulang → OSPEK → Aktif Kuliah → Pengajuan Judul TA → Bimbingan TA → Sidang → Yudisium → Wisuda.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Prisma 7 + SQLite (lokal, via driver adapter `@prisma/adapter-better-sqlite3`) — tinggal ganti provider ke PostgreSQL/MySQL saat deploy ke server produksi
- Auth sendiri (bukan NextAuth): password di-hash dengan bcrypt, sesi berbasis JWT (jose) di cookie httpOnly

## Menjalankan secara lokal

```bash
npm install
npm run db:push    # membuat skema database SQLite
npm run db:seed    # isi data contoh (3 kampus, 12 mahasiswa, 1 admin)
npm run dev
```

Buka http://localhost:3000

### Akun demo (setelah `npm run db:seed`)

| Peran | Email | Password |
| --- | --- | --- |
| Admin | admin@pengawalankuliah.id | admin1234 |
| Mahasiswa (contoh) | putri.ramadhani@student.demo | mahasiswa123 |

Semua mahasiswa contoh lain pakai password yang sama: `mahasiswa123`. Lihat `prisma/seed.ts` untuk daftar email lengkapnya.

## Struktur penting

- `prisma/schema.prisma` — skema database
- `prisma/seed.ts` — data contoh
- `src/lib/stages.ts` — definisi 12 tahap pipeline (ubah di sini kalau mau menambah/mengubah tahap)
- `src/lib/auth.ts` — hashing password & sesi JWT
- `src/proxy.ts` — pelindung rute `/admin/*` dan `/portal/*` (pengganti `middleware.ts` di Next 16)
- `src/app/admin/*` — halaman admin
- `src/app/portal/*` — halaman mahasiswa

## Menuju produksi

Sebelum deploy ke server sendiri:

1. Ganti `datasource` di `prisma/schema.prisma` dan `prisma.config.ts` dari SQLite ke PostgreSQL/MySQL (SQLite dipakai supaya development lokal tidak butuh server database terpisah).
2. Set `JWT_SECRET` di `.env` ke string acak yang panjang dan rahasia (jangan pakai nilai contoh).
3. Pertimbangkan menambah: verifikasi email, upload berkas pendaftaran (KTP/ijazah/dsb), halaman admin untuk kelola kampus & jurusan, dan notifikasi (email/WhatsApp) saat status berubah.

## Keterbatasan versi ini

- Daftar kampus & jurusan masih di-seed manual (belum ada halaman admin untuk CRUD kampus).
- Belum ada upload berkas — status "Berkas Masuk" baru berupa checkpoint administratif.
- Data tersimpan lokal (SQLite) untuk keperluan pengembangan, sesuai permintaan awal.
