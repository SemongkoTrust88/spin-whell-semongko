# Semongko Lucky Wheel — Full Admin Panel

Versi ini memisahkan website publik dan Admin Panel, dengan backend Netlify Functions + Netlify Blobs. Netlify Functions dapat membaca environment variables untuk secret runtime, sedangkan Netlify Blobs menyediakan penyimpanan key/value yang tetap tersedia lintas deploy.

## Struktur
- `/index.html` — website publik
- `/admin/index.html` — Admin Panel
- `/netlify/functions/admin-auth.mjs` — login/logout admin
- `/netlify/functions/admin-api.mjs` — konfigurasi, tiket, audit log
- `/netlify/functions/public-config.mjs` — konfigurasi publik tanpa data tiket
- `/netlify/functions/spin.mjs` — validasi dan pemakaian kode tiket
- `/netlify/functions/_lib.mjs` — storage, auth session, konfigurasi default
- `/netlify.toml` — konfigurasi Netlify

## SETUP WAJIB DI NETLIFY
Buka **Project configuration → Environment variables** lalu buat:

`ADMIN_USERNAME` = username admin yang kamu inginkan

`ADMIN_PASSWORD` = password admin yang kuat

`ADMIN_SESSION_SECRET` = string rahasia acak yang panjang

Jangan menaruh password atau session secret di GitHub. Netlify mendukung environment variables untuk secret yang dipakai oleh Functions.

## URL
- Website: `/`
- Admin: `/admin/`

## Fitur Admin
- Identitas website
- Logo/background URL
- Warna
- Popup welcome
- Pengaturan durasi dan putaran wheel
- Tambah/edit/hapus hadiah
- Weight/bobot hadiah
- Aktif/nonaktif hadiah
- Generate kode tiket massal
- Tetapkan hadiah ke tiket atau gunakan pemilihan otomatis
- Hapus tiket
- WhatsApp dan template klaim
- Instagram/Facebook/Twitter
- Semua pesan kemenangan/error
- Audit log
- Reset konfigurasi default

## Data
Konfigurasi dan tiket disimpan di Netlify Blobs sehingga tidak hilang ketika ada deploy baru.

## Catatan keamanan
- Login menggunakan HttpOnly + Secure + SameSite cookie.
- Endpoint admin tidak dapat diakses tanpa session admin.
- Endpoint publik tidak mengirim daftar tiket.
- Kode tiket divalidasi server-side dan ditandai `used` setelah berhasil diproses.

## Deploy
Push semua file ke GitHub branch `main`. Netlify akan mendeteksi `netlify.toml`, menginstall dependency dari `package.json`, dan deploy Functions.
