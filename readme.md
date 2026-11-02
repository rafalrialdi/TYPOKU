# TypoKu : Asisten Penulisan Akademik AI

**TypoKu** adalah platform asisten penulisan berbasis kecerdasan buatan (*Artificial Intelligence/AI*) yang dirancang untuk membantu mahasiswa, dosen, dan akademisi Indonesia dalam menyempurnakan kualitas tulisan. TypoKu menyediakan fitur koreksi ejaan dan salah ketik (*typo*), parafrase kalimat, penerjemahan naskah akademik, serta ekstraksi teks dari dokumen PDF dan DOCX.

---

## Fitur Utama

### 1. Koreksi Typo dan Ejaan
Membantu mendeteksi dan memperbaiki kesalahan penulisan, ejaan, serta kata tidak baku berdasarkan kaidah bahasa Indonesia.

- Menerima unggahan file `.pdf` atau `.docx`, lalu mengekstrak teksnya secara otomatis.
- Mengembalikan isi teks yang sudah diperbaiki dengan sorotan kuning pada setiap kata yang diperbaiki.

### 2. Parafrase Cerdas
Membantu menyusun ulang kalimat agar lebih jelas, lugas, formal, atau akademik tanpa mengubah inti makna.

- Mendukung penyesuaian gaya penulisan (misal: gaya akademik).

### 3. Penerjemah Akademik
Membantu menerjemahkan teks akademik dari bahasa Indonesia ke bahasa Inggris maupun sebaliknya.

- Mendukung penerjemahan dua arah (Indonesia–Inggris).
- Mempertahankan konteks dan terminologi akademik.

---

## Teknologi yang Digunakan

### Frontend
- **React.js** : membangun antarmuka aplikasi.
- **Vite** : development server dan build tool.
- **React Router DOM** : mengatur navigasi antar halaman.
- **React Icons** : menyediakan ikon antarmuka.
- **CSS** : mengatur tampilan dan responsivitas aplikasi.

### Backend
- **Node.js & Express** : bahasa pemrograman dan framework REST API.
- **Google GenAI SDK** : integrasi dengan model AI Gemini (`gemini-3.8-flash`).
- **pdf-parse & mammoth** : pustaka ekstraksi teks dari file PDF dan Word (DOCX).
- **Multer** : penanganan unggahan file (*file upload*).
- **Helmet, CORS & Morgan** : keamanan HTTP, akses lintas origin, dan logging request.
- **dotenv** : pengelolaan variabel lingkungan.
- **Nodemon** : auto-reload saat pengembangan.

---

## Struktur Direktori

```text
typoku/
├── frontend/
│   ├── public/             # Aset statis dan favicon
│   ├── src/
│   │   ├── assets/         # Gambar dan logo
│   │   ├── components/     # Komponen UI yang dapat digunakan ulang
│   │   ├── layouts/        # Layout halaman aplikasi
│   │   ├── pages/          # Halaman aplikasi
│   │   └── services/       # Konfigurasi dan layanan API
│   └── package.json
│
├── backend/
│   ├── controllers/        # Logika pemrosesan endpoint
│   ├── middleware/         # Middleware kustom (masih kosong)
│   ├── routes/             # Definisi rute API
│   ├── .env                # Variabel lingkungan (tidak di-commit)
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js           # Entry point Express
│
├── .gitignore              # Pengecualian file sensitif
└── README.md
```

---

## Instalasi dan Menjalankan Proyek

### Prasyarat

Pastikan perangkat telah memiliki lingkungan berikut dengan versi yang didukung (disarankan menggunakan patch versi terbaru untuk alasan keamanan):

- **Node.js**: v20.x atau lebih baru (disarankan LTS terbaru)
- **npm**: v10.x atau lebih baru
- **Git**: v2.x atau lebih baru

### 1. Clone Repositori

```bash
git clone https://github.com/intannz/typoku.git
cd typoku
```

### 2. Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi Vite dapat diakses melalui: `http://localhost:5173`

### 3. Menjalankan Backend

Buka terminal baru pada direktori `backend`:

```bash
cd backend
npm install
```

Konfigurasi file `.env` di folder `backend`:
```env
PORT=8000
GEMINI_API_KEY=AIzaSy_GantiDenganApiKeyGeminiKamu
```

Jalankan server Express:

```bash
npm run dev
```

Untuk mode produksi:
```bash
npm start
```

Backend dapat diakses di `http://localhost:8000`.

---

## Dokumentasi API

Seluruh endpoint backend mengembalikan respons JSON.

### 1. Cek Typo dan Ejaan
Menerima file dokumen (.pdf / .docx) atau teks mentah. Mengembalikan teks asli dengan sorotan merah coret garis pada kata salah/typo, teks hasil perbaikan dengan sorotan kuning pada kata yang dibetulkan, serta link unduhan dokumen.

- **Endpoint:** `POST /api/cek-typo`
- **Content-Type:** `multipart/form-data` atau `application/json`

| Parameter | Tipe | Keterangan |
|---|---|---|
| `file` | File | File dokumen (.pdf atau .docx) — opsional jika menggunakan `text` |
| `text` | String | Teks langsung yang ingin diperiksa — opsional jika menggunakan `file` |

**Contoh Respons Berhasil:**
```json
{
  "status": "success",
  "filename": "draft_artikel.docx",
  "total_errors": 2,
  "original_text": "saya beli <mark style=\"background-color: #fee2e2; color: #dc2626; text-decoration: line-through; padding: 2px 4px; border-radius: 4px; font-weight: 500;\">apotik</mark> dan <mark style=\"background-color: #fee2e2; color: #dc2626; text-decoration: line-through; padding: 2px 4px; border-radius: 4px; font-weight: 500;\">jadual</mark> di pasar",
  "result_text": "saya beli <mark style=\"background-color: #fef08a; color: #854d0e; padding: 2px 4px; border-radius: 4px; font-weight: 500;\">apotek</mark> dan <mark style=\"background-color: #fef08a; color: #854d0e; padding: 2px 4px; border-radius: 4px; font-weight: 500;\">jadwal</mark> di pasar",
  "clean_result_text": "saya beli apotek dan jadwal di pasar",
  "download_url": "/api/cek-typo/download/8ee017d5-4aec-4413-9d58-f0bb102f563c?format=pdf",
  "download_link": "http://localhost:8000/api/cek-typo/download/8ee017d5-4aec-4413-9d58-f0bb102f563c?format=pdf"
}
```

---

### 2. Parafrase Dokumen / Teks (Blok Kuning)
Memparafrase dokumen atau teks dengan sorotan kuning pada bagian yang diubah dan menyediakan tautan unduh.

- **Endpoint:** `POST /api/cek-typo/parafrase`
- **Content-Type:** `multipart/form-data` atau `application/json`

| Parameter | Tipe | Keterangan |
|---|---|---|
| `file` | File | File dokumen (.pdf atau .docx) — opsional |
| `text` | String | Teks naskah yang ingin diparafrase |
| `style` | String | Gaya bahasa (default: `akademik`) |

---

### 3. Unduh Hasil Pemeriksaan / Parafrase
Mengunduh hasil perbaikan teks dalam format PDF, TXT, atau HTML.

- **Endpoint:** `GET /api/cek-typo/download/:id?format=pdf` (atau `format=txt`)
- **Content-Type:** `application/pdf` / `text/plain`

---

### 2. Parafrase Cerdas
Menyusun ulang kalimat agar lebih sesuai dengan gaya bahasa akademik.

- **Endpoint:** `POST /api/parafrase`
- **Content-Type:** `application/json`

**Contoh Request Body:**
```json
{
  "text": "kiyoung suka makan salmon dari danau cermin",
  "style": "akademik"
}
```

**Contoh Respons Berhasil:**
```json
{
  "status": "success",
  "result_text": "Kiyoung memiliki preferensi konsumsi ikan salmon yang berasal dari kawasan Danau Cermin."
}
```

---

### 3. Penerjemah Akademik
Menerjemahkan teks akademik dua arah (Indonesia–Inggris).

- **Endpoint:** `POST /api/terjemah`
- **Content-Type:** `application/json`

**Contoh Request Body:**
```json
{
  "text": "mie adalah makanan favoritku",
  "target_lang": "en"
}
```

**Contoh Respons Berhasil:**
```json
{
  "status": "success",
  "source_language": "id",
  "target_language": "en",
  "result_text": "Noodles are my favorite food."
}
```

---

### Batasan Penggunaan & Catatan Integrasi
1. **Batasan Kata (Word Limit):** Disarankan agar *frontend* membatasi input maksimal **1.000 – 2.000 kata** per pengiriman API demi menjaga waktu respons AI tetap di bawah 10 detik.
2. **Ukuran File Dokumen:** Maksimal **5 MB** untuk format `.pdf` dan `.docx`.
3. **Alur UI:**
   - User mengunggah file => Frontend memanggil `/api/cek-typo` (file dikirim langsung).
   - Backend mengekstrak teks, memperbaiki typo, dan mengembalikan `result_text` berisi HTML dengan sorotan kuning.
   - Untuk Parafrase / Terjemah, frontend mengirim teks JSON ke endpoint yang sesuai.

---

## Pengembang

Proyek ini dikembangkan sebagai bagian dari tugas Digital Entrepreneurship.

---

*TypoKu : Cek ejaan, pahami perbaikannya.*