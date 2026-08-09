# BIGSLOTO Lucky Wheel — GitHub + Netlify Ready

Project sudah dipisahkan menjadi HTML, CSS, dan JavaScript agar mudah diedit langsung dari GitHub.

## Struktur

```text
.
├── index.html
├── style.css
├── script.js
├── netlify.toml
├── .gitignore
└── README.md
```

## Edit dari GitHub

- `index.html` → teks/tampilan halaman.
- `style.css` → warna, ukuran, responsive, modal, dan desain.
- `script.js` → hadiah, endpoint API, WhatsApp, dan sosial media.

## Konfigurasi utama

Buka `script.js` lalu ubah bagian `CONFIG`:

```js
const CONFIG = {
  API_BASE: "",
  API_PATH: "/wheel/start/",
  social: {
    instagram: "https://www.instagram.com/bigsloto/",
    facebook: "https://facebook.com/bigsloto",
    twitter: "https://twitter.com/bigsloto"
  }
};
```

Jika backend berada di domain berbeda, isi `API_BASE`, misalnya:

```js
API_BASE: "https://api.domain-anda.com"
```

Frontend kemudian memanggil:

```text
GET https://api.domain-anda.com/wheel/start/{kode}
```

## Format respons backend

Frontend ini mempertahankan format kompatibel dengan source lama: respons berupa Base64 yang setelah decode berisi:

```text
segmentNumber-wincode-website-whatsapp
```

Contoh:

```text
3-ABC123-https://domain.com-628123456789
```

## Netlify

Repository dapat dihubungkan ke Netlify. Build command tidak diperlukan; publish directory adalah root repository (`.`).

**Catatan:** Netlify/GitHub Pages hanya menyediakan frontend statis. Endpoint `/wheel/start/{kode}` tetap membutuhkan backend/API terpisah.

## Library

Winwheel dan GSAP dimuat melalui CDN pada `index.html`. Dokumentasi Winwheel menjelaskan penggunaan `Winwheel` dengan HTML5 Canvas dan animasi `spinToStop`. 
