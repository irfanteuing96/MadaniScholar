# Deploy Madani Scholar ke VPS (Ubuntu)

Panduan ini untuk deploy pertama kali. SQLite dipakai apa adanya (tidak perlu migrasi
database) karena VPS punya disk yang persisten — beda dengan platform serverless
seperti Netlify/Vercel.

Semua perintah di bawah dijalankan lewat SSH ke VPS kamu.

## 1. Siapkan VPS (sekali saja)

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# PM2 (penjaga proses, auto-restart)
sudo npm install -g pm2

# Certbot untuk HTTPS gratis
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Upload/clone project

Kalau project ada di GitHub:

```bash
cd /var/www
sudo git clone <url-repo-kamu> madani-scholar
sudo chown -R $USER:$USER madani-scholar
cd madani-scholar
```

Kalau belum ada di GitHub, upload folder project dari komputer kamu ke VPS pakai
`scp` atau SFTP (FileZilla) ke `/var/www/madani-scholar`.

## 3. Install & konfigurasi

```bash
cd /var/www/madani-scholar
npm install

# Buat .env dari template
cp deploy/.env.production.example .env
# Generate secret acak, lalu tempel hasilnya ke JWT_SECRET di .env
openssl rand -base64 48
nano .env   # edit JWT_SECRET

# Generate Prisma Client dulu (wajib, sebelum push/seed/build)
npx prisma generate

# Buat skema database & (opsional) isi data contoh
npm run db:push
npm run db:seed     # lewati baris ini kalau tidak mau data contoh

npm run build
```

## 4. Jalankan dengan PM2

```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup   # ikuti instruksi yang muncul (jalankan 1 baris perintah yang diberikan)
```

Cek status: `pm2 status` — aplikasi harus jalan di port 3000 (`pm2 logs madani-scholar` untuk lihat log).

## 5. Konfigurasi Nginx + domain

**Belum punya domain sendiri?** Tetap bisa dapat HTTPS gratis pakai
**[sslip.io](https://sslip.io)** — tanpa daftar apa pun. Layanan ini otomatis
mengarahkan `<ip-pakai-strip>.sslip.io` ke IP itu sendiri. Misalnya IP VPS kamu
`123.45.67.89`, domainnya jadi `123-45-67-89.sslip.io`. Karena itu nama domain
"asli" (bukan cuma angka IP), Let's Encrypt (Certbot) mau menerbitkan sertifikat
untuknya. Pakai domain itu di semua langkah bawah ini (ganti `domain-kamu.com`
dengannya) — tidak perlu atur DNS A record sama sekali karena sudah otomatis.

Kalau sudah punya domain sendiri, arahkan dulu domain itu (A record) ke IP VPS
ini lewat pengaturan DNS domain kamu, lalu lanjut seperti biasa.

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/madani-scholar
sudo nano /etc/nginx/sites-available/madani-scholar   # ganti "domain-kamu.com"
sudo ln -s /etc/nginx/sites-available/madani-scholar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Aktifkan HTTPS

```bash
sudo certbot --nginx -d domain-kamu.com -d www.domain-kamu.com
```

(Kalau pakai sslip.io, cukup `-d 123-45-67-89.sslip.io` saja, tanpa `www.`.)

Certbot otomatis atur perpanjangan sertifikat. Sekarang aplikasi bisa diakses via
`https://domain-kamu.com`.

Setelah HTTPS aktif, pastikan `.env` punya `USE_HTTPS="true"` (nilai default di
template), lalu `pm2 restart madani-scholar` supaya cookie sesi kembali aman.

## Update aplikasi di kemudian hari

```bash
cd /var/www/madani-scholar
git pull                 # atau upload ulang file yang berubah
npm install               # kalau ada dependency baru
npx prisma generate
npx prisma db push        # kalau ada perubahan schema.prisma
npm run build
pm2 restart madani-scholar
```

## Backup database

Database ada di `prisma/dev.db` — cukup salin file ini secara berkala:

```bash
cp prisma/dev.db ~/backup-madani-scholar-$(date +%Y%m%d).db
```

Pertimbangkan menjadwalkan ini dengan cron kalau data sudah penting/banyak.

## Catatan keamanan

- Jangan pernah commit file `.env` ke git (sudah di-`.gitignore`).
- Ganti password akun demo (`admin1234`, `mahasiswa123`) — buat akun admin baru lewat `npm run db:seed` yang sudah diedit, atau tambah fitur ganti password nanti.
- Aktifkan firewall dasar: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`
