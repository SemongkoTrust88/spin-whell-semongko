# BIGSLOTO Lucky Wheel — GitHub Editable

## Struktur
- `index.html` — struktur halaman
- `style.css` — semua CSS/desain
- `script.js` — logika Lucky Wheel
- `assets/` — gambar, audio, font, Winwheel, Font Awesome

## GitHub
Upload seluruh folder ini ke repository GitHub. Setelah itu file HTML/CSS/JS bisa diedit langsung dari GitHub.

## Penting: backend
Kode asli menggunakan endpoint server `/wheel/start/{kode}` untuk menentukan hasil spin. GitHub Pages hanya hosting file statis, jadi endpoint tersebut **tidak bisa dijalankan oleh GitHub Pages**.

Di `script.js` terdapat:
```js
const API_BASE = "";
```

Jika backend/API Anda berada di server lain, isi menjadi contoh:
```js
const API_BASE = "https://domain-api-anda.com";
```

Backend harus menyediakan:
`GET /wheel/start/{kode}`

dan mengembalikan format respons yang kompatibel dengan kode asli.

## Assets
File aset asli seperti `bg.jpg`, `confetti.gif`, audio, `congrats.png`, `Winwheel.min.js`, dan font perlu ditempatkan sesuai struktur `assets/`.
