# 🚀 VPS Master Pro — Panduan Deploy Lengkap

## ARSITEKTUR SISTEM
```
                    ┌─────────────────────────────────┐
                    │         SUPABASE CLOUD          │
                    │   (Database utama — PostgreSQL)  │
                    │   ✓ Accounts Table               │
                    │   ✓ Servers Table (per-user)     │
                    └──────────┬──────────────────────┘
                               │ REST API
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌──────▼──────┐  ┌─────▼──────────┐
    │  PTERODACTYL   │  │   VERCEL    │  │  Browser Local │
    │  (Node.js egg) │  │ (Serverless)│  │  (Fallback)    │
    │  Express serve │  │ React + API │  │  localStorage  │
    └────────────────┘  └─────────────┘  └────────────────┘
              │                │
    ┌─────────▼──────┐  ┌──────▼──────────────────┐
    │   CLOUDFLARE   │  │      CLOUDFLARE          │
    │  Tunnel/Proxy  │  │  Custom Domain + CDN     │
    └────────────────┘  └──────────────────────────┘
```

**Cara kerja:** Data tersimpan di Supabase. Jika Pterodactyl mati,
bisa langsung pakai Vercel — data tetap ada karena di cloud.

---

## ══════════════════════════════════════
## BAGIAN 1 — SETUP SUPABASE (DATABASE)
## ══════════════════════════════════════

### 1.1 Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) → **Start your project** (gratis)
2. Login dengan GitHub
3. **New Project** → isi:
   - Name: `vps-master-pro`
   - Password: buat password kuat (simpan!)
   - Region: **Southeast Asia (Singapore)**
4. Tunggu ±2 menit hingga project siap

### 1.2 Buat Database Schema
1. Di dashboard Supabase → klik **SQL Editor** (sidebar kiri)
2. Klik **New Query**
3. Copy-paste isi file `supabase-schema.sql` → klik **Run**
4. Pastikan muncul:
   ```
   accounts | 1
   servers  | 0
   ```
   (1 akun admin sudah otomatis dibuat)

### 1.3 Ambil API Keys
1. Sidebar → **Settings** → **API**
2. Catat dua nilai ini:
   ```
   Project URL  : https://xxxxxxxxxxxx.supabase.co
   anon (public): eyJhbGci...
   ```
   *(anon key aman untuk frontend)*

---

## ══════════════════════════════════════
## BAGIAN 2 — DEPLOY KE VERCEL
## ══════════════════════════════════════

### 2.1 Push ke GitHub
```bash
# Di folder project:
git init
git add .
git commit -m "VPS Master Pro initial commit"
git remote add origin https://github.com/USERNAME/vps-master-pro.git
git push -u origin main
```

### 2.2 Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo GitHub yang baru dibuat
3. Framework: **Vite** (otomatis terdeteksi)
4. **Environment Variables** — tambahkan:
   ```
   VITE_SUPABASE_URL  = https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON = eyJhbGci...
   ```
5. Klik **Deploy** → tunggu ±1 menit
6. App langsung online di `https://vps-master-pro.vercel.app`

### 2.3 Custom Domain di Vercel
1. Project → **Settings** → **Domains**
2. Add domain: `vps.domainmu.com`
3. Vercel akan tampilkan DNS record yang harus ditambah

---

## ══════════════════════════════════════
## BAGIAN 3 — DEPLOY KE PTERODACTYL
## ══════════════════════════════════════

### 3.1 Import Egg
1. Pterodactyl Admin → **Nests** → **Import Egg**
2. Upload file `egg-vps-master-pro.json`

### 3.2 Buat Server
- **Egg**: VPS Master Pro
- **Docker Image**: `ghcr.io/parkervcp/yolks:nodejs_20`
- **Startup**: `npm run setup && npm start`
- **Environment Variables**:
  ```
  PORT                = 3000          (sesuai allocation)
  NODE_ENV            = production
  VITE_SUPABASE_URL   = https://xxxxxxxxxxxx.supabase.co
  VITE_SUPABASE_ANON  = eyJhbGci...
  ```
  > ⚠️ Di Pterodactyl, variabel VITE_* harus diset SEBELUM build
  > karena Vite embed env vars saat build time.

- **RAM**: 512 MB minimum, **Disk**: 2 GB

### 3.3 Upload File & Start
**Via SFTP / File Manager:**
Upload semua file (kecuali `node_modules/`, `dist/`) ke `/home/container/`

**Struktur yang benar:**
```
/home/container/
├── server.js
├── package.json
├── vite.config.js
├── index.html
├── .env              ← buat file ini!
├── public/
├── src/
└── api/
```

**Buat file `.env` di server:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON=eyJhbGci...
PORT=3000
NODE_ENV=production
```

**Start server** → muncul di console:
```
╔════════════════════════════════════════╗
║       VPS Master Pro  ⚡ Running       ║
```

---

## ══════════════════════════════════════
## BAGIAN 4 — CUSTOM DOMAIN (CLOUDFLARE)
## ══════════════════════════════════════

### 4.1 Untuk Vercel (Termudah)
1. Cloudflare DNS → tambah record:
   ```
   Type  : CNAME
   Name  : vps
   Target: cname.vercel-dns.com
   Proxy : OFF (DNS only) ← penting!
   ```
2. Di Vercel → Settings → Domains → tambah `vps.domainmu.com`
3. Vercel otomatis urus SSL ✅

### 4.2 Untuk Pterodactyl — Cloudflare Tunnel (GRATIS, DIREKOMENDASIKAN)
Tidak perlu buka port! Tunnel langsung dari server ke Cloudflare.

```bash
# SSH ke VPS tempat Pterodactyl berjalan
# Install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login ke Cloudflare
cloudflared tunnel login

# Buat tunnel
cloudflared tunnel create vps-master

# Lihat tunnel ID
cloudflared tunnel list
# Catat: TUNNEL_ID

# Buat config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << CONF
tunnel: TUNNEL_ID_DISINI
credentials-file: /root/.cloudflared/TUNNEL_ID_DISINI.json

ingress:
  - hostname: vps.domainmu.com
    service: http://localhost:3000
  - service: http_status:404
CONF

# Daftarkan DNS otomatis ke Cloudflare
cloudflared tunnel route dns vps-master vps.domainmu.com

# Jalankan tunnel sebagai service (auto-start)
cloudflared service install
systemctl start cloudflared
systemctl enable cloudflared

# Cek status
systemctl status cloudflared
```

**Hasilnya:** `https://vps.domainmu.com` → Pterodactyl server (port 3000)
SSL otomatis dari Cloudflare ✅

### 4.3 Untuk Pterodactyl — Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/vps-master
server {
    listen 80;
    server_name vps.domainmu.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/vps-master /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# SSL:
sudo certbot --nginx -d vps.domainmu.com
```

### 4.4 SSL Cloudflare Settings
1. Cloudflare → domain → **SSL/TLS** → set ke **Full**
2. Aktifkan **Always Use HTTPS**
3. Aktifkan **Automatic HTTPS Rewrites**

---

## ══════════════════════════════════════
## BAGIAN 5 — MODE DATABASE
## ══════════════════════════════════════

App menampilkan badge di header:

| Badge | Warna | Artinya |
|-------|-------|---------|
| ☁ CLOUD DB | Hijau | Supabase aktif, data aman |
| 💾 LOCAL DB | Kuning | Supabase tidak dikonfigurasi, data di browser |
| ↻ CONNECTING | Abu | Sedang konek ke Supabase |

**Skenario failover:**
```
Pterodactyl mati → user buka Vercel URL → login → data tetap ada (dari Supabase)
Vercel down     → user buka Pterodactyl URL → login → data tetap ada (dari Supabase)
Supabase down   → app tetap jalan dengan localStorage cache
```

---

## ══════════════════════════════════════
## BAGIAN 6 — AKUN & KEAMANAN
## ══════════════════════════════════════

### Akun Default
| Username | Password   | Role  |
|----------|------------|-------|
| `wanzz`  | `wanzz3369`| Admin |

### Ganti Password Admin (SANGAT DISARANKAN)
1. Login sebagai `wanzz`
2. Dashboard → **Admin Panel**
3. Klik ikon kunci di baris akun sendiri
4. Masukkan password baru → Simpan

### Tambah User Baru
1. Login admin → **Admin Panel** → **Buat Akun Baru**
2. Isi username, password, nama, role
3. Setiap user punya database server terpisah

---

## ══════════════════════════════════════
## TROUBLESHOOTING
## ══════════════════════════════════════

### ❌ Badge "LOCAL DB" padahal sudah set Supabase
- Pastikan nama variabel: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON`
- Di Pterodactyl: env var harus ada SEBELUM `npm run build`
- Cek: buka F12 console browser → cari pesan `[DB]`

### ❌ Supabase error "relation does not exist"
- Jalankan ulang `supabase-schema.sql` di SQL Editor

### ❌ Error 401/403 dari Supabase
- Pastikan pakai **anon key** (bukan service_role key)
- Cek RLS sudah disabled di schema

### ❌ Pterodactyl: dist/ tidak ada
```bash
# Di console pterodactyl:
npm install && npm run build
```

### ✅ Test koneksi Supabase
```bash
curl "https://SUPABASE_URL/rest/v1/accounts?select=username" \
  -H "apikey: SUPABASE_ANON" \
  -H "Authorization: Bearer SUPABASE_ANON"
# Harus muncul: [{"username":"wanzz"}]
```

---

VPS Master Pro v1.0 | Supabase + Vercel + Pterodactyl + Cloudflare
