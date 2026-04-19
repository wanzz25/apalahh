# 🚀 Panduan Deploy VPS Master Pro di Pterodactyl

## ═══════════════════════════════════════════
## LANGKAH 1 — Import Egg ke Pterodactyl
## ═══════════════════════════════════════════

1. Login ke **Pterodactyl Admin Panel**
2. Klik menu **Nests** (kiri atas)
3. Klik **Import Egg**
4. Upload file `egg-vps-master-pro.json`
5. Pilih Nest yang sesuai → **Import**

---

## ═══════════════════════════════════════════
## LANGKAH 2 — Buat Server Baru
## ═══════════════════════════════════════════

1. Buka **Servers** → **Create New**
2. Isi nama server: `VPS Master Pro`
3. **Nest**: pilih nest yang berisi egg tadi
4. **Egg**: pilih `VPS Master Pro`
5. **Docker Image**: `ghcr.io/parkervcp/yolks:nodejs_20`
6. **Startup Command** (isi manual jika tidak otomatis):
   ```
   npm run setup && npm start
   ```
7. **Environment Variables**:
   - `PORT` = (nomor port dari allocation, contoh: `3000`)
   - `NODE_ENV` = `production`
8. **Resource Limits** (minimal):
   - CPU: `50%`
   - RAM: `512 MB`
   - Disk: `2048 MB`
9. **Allocations**: tambahkan 1 port (misal `3000`)
10. Klik **Create Server**

---

## ═══════════════════════════════════════════
## LANGKAH 3 — Upload & Jalankan
## ═══════════════════════════════════════════

### Cara A — via File Manager (GUI)
1. Buka server → **File Manager**
2. Upload semua file dari ZIP ini (kecuali `egg-*.json` dan file panduan)
3. Pastikan struktur file seperti ini di root server:
   ```
   /home/container/
   ├── package.json
   ├── server.js
   ├── vite.config.js
   ├── index.html
   ├── public/
   └── src/
   ```
4. Klik **Start** di panel → tunggu proses build (±2-3 menit)
5. Lihat console, tunggu muncul:
   ```
   ╔════════════════════════════════════════╗
   ║       VPS Master Pro  ⚡ Running       ║
   ```

### Cara B — via SFTP
1. Buka **Settings** → **SFTP Details**
2. Connect pakai FileZilla / WinSCP
3. Upload semua file ke `/home/container/`
4. Start server dari panel

### Cara C — via Console (Git)
Jika server sudah punya akses git:
```bash
git clone https://github.com/USERMU/vps-master-pro.git .
npm run setup && npm start
```

---

## ═══════════════════════════════════════════
## LANGKAH 4 — Custom Domain via Cloudflare
## ═══════════════════════════════════════════

### 4a. Tambah Domain ke Cloudflare
1. Login [cloudflare.com](https://cloudflare.com)
2. **Add a Site** → masukkan domain Anda
3. Ikuti instruksi ganti nameserver di registrar

### 4b. Tambah DNS Record
1. Buka **DNS** → **Records** → **Add Record**
2. Isi seperti ini:

   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | A    | `vps` | `IP_VPS_ANDA` | ✅ Proxied |

   Contoh: `vps.domainku.com` → `103.45.67.12`

   > **IP_VPS_ANDA** = IP server tempat Pterodactyl berjalan

### 4c. Buat Tunnel atau Reverse Proxy
Karena Pterodactyl pakai port custom (misal 3000), Cloudflare perlu diarahkan ke port itu.

**Pilihan 1 — Cloudflare Tunnel (GRATIS, TERBAIK)**
```bash
# Di server Pterodactyl (via SSH/console):
# Install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared-linux-amd64.deb

# Login
cloudflared tunnel login

# Buat tunnel
cloudflared tunnel create vps-master

# Buat config
cat > ~/.cloudflared/config.yml << EOF
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: vps.domainku.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Tambah DNS otomatis
cloudflared tunnel route dns vps-master vps.domainku.com

# Jalankan (atau install sebagai service)
cloudflared tunnel run vps-master
```

**Pilihan 2 — Nginx Reverse Proxy**
```nginx
# /etc/nginx/sites-available/vps-master
server {
    listen 80;
    server_name vps.domainku.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/vps-master /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL dengan Certbot:
certbot --nginx -d vps.domainku.com
```

### 4d. Atur SSL di Cloudflare
1. Buka **SSL/TLS** → mode: **Full (Strict)** jika pakai Certbot
2. Atau **Flexible** jika tidak pakai SSL di server
3. Aktifkan **Always Use HTTPS**

---

## ═══════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════

### ❌ Error: dist/ tidak ditemukan
```bash
# Di console Pterodactyl:
npm run build
```

### ❌ Error: Cannot find module 'express'
```bash
npm install
```

### ❌ Port sudah dipakai
- Ganti environment variable `PORT` di panel Pterodactyl
- Pastikan allocation port sama dengan PORT yang diset

### ❌ App jalan tapi tidak bisa dibuka
- Cek firewall server (buka port yang dipakai)
- Cek Cloudflare DNS sudah propagate (bisa butuh 5-30 menit)

### ✅ Cek apakah running:
```bash
curl http://localhost:3000
# Harus muncul HTML response
```

---

## ═══════════════════════════════════════════
## INFO AKUN DEFAULT
## ═══════════════════════════════════════════

| Username | Password   | Role  |
|----------|------------|-------|
| wanzz    | wanzz3369  | Admin |

> Admin dapat membuat akun baru dari dalam dashboard (Admin Panel)

---

## ═══════════════════════════════════════════
## STRUKTUR FILE
## ═══════════════════════════════════════════

```
/home/container/          ← root server Pterodactyl
├── server.js             ← Express server (entry point)
├── package.json          ← dependencies + scripts
├── vite.config.js        ← build config
├── index.html            ← React app entry
├── public/               ← static assets
├── src/                  ← source code React
│   ├── App.jsx
│   ├── auth/authStore.js
│   ├── store/useStore.js
│   ├── components/
│   └── utils/
└── dist/                 ← hasil build (dibuat otomatis)
```

---

Dibuat dengan ❤️ | VPS Master Pro v1.0
