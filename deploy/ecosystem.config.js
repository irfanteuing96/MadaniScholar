// Konfigurasi PM2 — menjaga aplikasi tetap nyala & auto-restart kalau crash/reboot.
// Jalankan dari root project: pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "madani-scholar",
      script: "npm",
      args: "start",
      cwd: __dirname + "/..",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
