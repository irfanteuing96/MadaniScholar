# Madani Scholar

Platform pemantauan mahasiswa dari pendaftaran sampai wisuda, untuk beberapa kampus sekaligus.

**Model peran:** Admin di sini adalah **pihak eksternal** (mis. pemberi beasiswa/sponsor) yang tidak
punya akses ke sistem kampus dan tidak tahu kondisi mahasiswa secara langsung. Karena itu, **semua
data operasional — progres tahap, nilai semester, dan status keuangan — diisi & diperbarui sendiri
oleh mahasiswa** lewat portalnya. Admin hanya memantau (read-only): dashboard, papan status, dan
daftar mahasiswa, tanpa bisa mengubah data apa pun.

## Fitur

- **Sisi Calon Mahasiswa / Mahasiswa** — daftar mandiri, isi biodata, update sendiri posisi tahap
  (timeline dari Berkas Masuk sampai Wisuda), input nilai semester sendiri (IPK terhitung otomatis),
  dan catat sendiri status keuangan (tagihan, nominal dibayar, sisa tunggakan).
- **Sisi Admin (pemantau eksternal, read-only)** — dashboard ringkasan terpisah untuk Calon Mahasiswa
  vs Mahasiswa Aktif, papan status (kanban) untuk melihat posisi semua anggota di pipeline, data
  mahasiswa lengkap dengan pencarian/filter dan kolom status keuangan, semuanya tanpa kemampuan edit.
- Pipeline tetap terdiri dari 12 tahap: Berkas Masuk → Verifikasi Berkas → Tes Masuk → Pengumuman → Daftar Ulang → OSPEK → Aktif Kuliah → Pengajuan Judul TA → Bimbingan TA → Sidang → Yudisium → Wisuda.
- Status keuangan murni catatan administratif (bukan payment gateway) — tidak ada transaksi uang sungguhan lewat aplikasi ini.

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
| Admin | admin@madanischolar.id | admin1234 |
| Mahasiswa (contoh) | putri.ramadhani@student.demo | mahasiswa123 |

Semua mahasiswa contoh lain pakai password yang sama: `mahasiswa123`. Lihat `prisma/seed.ts` untuk daftar email lengkapnya.

## Struktur penting

- `prisma/schema.prisma` — skema database
- `prisma/seed.ts` — data contoh
- `src/lib/stages.ts` — definisi 12 tahap pipeline (ubah di sini kalau mau menambah/mengubah tahap)
- `src/lib/finance.ts` — perhitungan status keuangan (lunas/tunggakan) dari nominal tagihan vs dibayar
- `src/lib/scope.ts` — pembagian "Calon Mahasiswa" vs "Mahasiswa Aktif" untuk filter di sisi admin
- `src/lib/auth.ts` — hashing password & sesi JWT
- `src/lib/actions/portal.ts` — **semua** aksi tulis (advance tahap, nilai, keuangan) — dijalankan atas nama mahasiswa yang login, admin tidak punya aksi tulis sama sekali
- `src/proxy.ts` — pelindung rute `/admin/*` dan `/portal/*` (pengganti `middleware.ts` di Next 16)
- `src/app/admin/*` — halaman admin (read-only)
- `src/app/portal/*` — halaman mahasiswa (di sinilah semua form input berada)

## Menuju produksi

**Deploy ke VPS sendiri (direkomendasikan)** — lihat [DEPLOY.md](DEPLOY.md) untuk panduan lengkap.
SQLite dipakai apa adanya (tidak perlu ganti database) karena VPS punya disk persisten. File
konfigurasi (Nginx, PM2) ada di folder `deploy/`.

**Deploy ke platform serverless (Netlify/Vercel)** — SQLite **tidak bisa dipakai** karena
filesystem-nya tidak persisten antar request, jadi data mahasiswa bisa hilang/reset. Kalau
memang mau ke platform ini:

1. Ganti `datasource` di `prisma/schema.prisma` dan `prisma.config.ts` dari SQLite ke PostgreSQL (mis. pakai [Neon](https://neon.tech) atau [Supabase](https://supabase.com), gratis untuk mulai), dan sesuaikan `src/lib/db.ts` untuk pakai driver adapter Postgres alih-alih `@prisma/adapter-better-sqlite3`.
2. Set `DATABASE_URL` dan `JWT_SECRET` di Environment Variables platform tersebut (bukan `.env` lokal).

Untuk **kedua jalur**, sebelum go-live:

- Set `JWT_SECRET` ke string acak yang panjang dan rahasia (`openssl rand -base64 48`) — jangan pakai nilai contoh.
- Ganti password akun demo, atau buat akun admin baru dan hapus data contoh.
- Pertimbangkan menambah: verifikasi email, upload berkas pendaftaran (KTP/ijazah/dsb), halaman admin untuk kelola kampus & jurusan, dan notifikasi (email/WhatsApp) saat status berubah.

## Keterbatasan versi ini

- Daftar kampus & jurusan masih di-seed manual (belum ada halaman admin untuk CRUD kampus).
- Belum ada upload berkas — status "Berkas Masuk" baru berupa checkpoint administratif.
- Data tersimpan lokal (SQLite) untuk keperluan pengembangan, sesuai permintaan awal.
