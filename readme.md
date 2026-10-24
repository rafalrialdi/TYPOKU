# TypoKu : Asisten Penulisan Akademik AI

**TypoKu** adalah platform asisten penulisan berbasis kecerdasan buatan (*Artificial Intelligence/AI*) yang dirancang untuk membantu mahasiswa, dosen, dan akademisi Indonesia dalam menyempurnakan kualitas tulisan. TypoKu menyediakan fitur koreksi ejaan dan salah ketik (*typo*), parafrase kalimat, serta penerjemahan naskah akademik.

---

## Fitur Utama

### 1. Koreksi Typo dan Ejaan
Membantu mendeteksi kesalahan penulisan, ejaan, penggunaan imbuhan, dan kata yang kurang efektif berdasarkan kaidah bahasa Indonesia.

- Mendukung input teks langsung dan dokumen.
- Mendukung format dokumen DOCX dan PDF sesuai implementasi backend.
- Menampilkan hasil koreksi dan jumlah perbaikan.
- Menyediakan hasil dokumen yang dapat diunduh.

### 2. Parafrase Cerdas
Membantu menyusun ulang kalimat agar lebih jelas, lugas, formal, atau akademik tanpa mengubah inti makna.

- Mendukung input teks dan dokumen.
- Menyediakan pilihan gaya penulisan.
- Menampilkan hasil parafrase.
- Menyediakan hasil dokumen untuk diunduh.

### 3. Penerjemah Akademik
Membantu menerjemahkan teks akademik dari bahasa Indonesia ke bahasa Inggris maupun sebaliknya.

- Mendukung penerjemahan dua arah (Indonesia–Inggris).
- Mempertahankan konteks dan terminologi akademik sebisa mungkin.
- Menampilkan hasil terjemahan yang dapat ditinjau kembali.

### 4. Manajemen Dokumen dan Riwayat
Menyediakan antarmuka untuk membantu pengguna mengelola dokumen dan memantau hasil pemrosesan sesuai fitur yang tersedia pada aplikasi.

### 5. Pilihan Paket Layanan
Menyediakan rancangan tingkatan layanan Gratis, Pro, dan Premium untuk menyesuaikan kebutuhan pengguna.

---

## Teknologi yang Digunakan

### Frontend
- **React.js** — membangun antarmuka aplikasi.
- **Vite** — development server dan build tool.
- **React Router DOM** — mengatur navigasi ant halaman.
- **React Icons** — menyediakan ikon antarmuka.
- **CSS** — mengatur tampilan dan responsivitas aplikasi.

### Backend
- **Python** — bahasa pemrograman backend.
- **FastAPI** — membangun REST API.
- **Scikit-learn / Joblib** — mendukung pemrosesan model machine learning, jika digunakan pada implementasi.
- **Pandas / NumPy** — mendukung pengolahan data teks dan dataset.

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
│   ├── data/               # Dataset dan data pendukung
│   ├── models/             # Model machine learning
│   ├── notebooks/          # Notebook eksperimen dan pelatihan
│   ├── main.py             # Entry point FastAPI
│   └── requirements.txt    # Dependensi Python
│
└── README.md
```

> Struktur di atas merupakan gambaran direktori yang diharapkan. Sesuaikan dengan struktur aktual repositori jika terdapat perbedaan.

---

## Instalasi dan Menjalankan Proyek

### Prasyarat

Pastikan perangkat telah memiliki:
- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/)
- Git

### 1. Clone Repositori

```bash
git clone https://github.com/intannz/typoku.git
cd typoku
```

### 2. Menjalankan Frontend

Buka terminal pada direktori proyek, lalu jalankan:

```bash
cd frontend
npm install
npm run dev
```

Secara default, aplikasi Vite dapat diakses melalui:

`http://localhost:5173`

### 3. Menjalankan Backend

Buka terminal baru, lalu masuk ke direktori backend:

```bash
cd backend
```

Buat virtual environment:

```bash
python -m venv venv
```

Aktifkan virtual environment sesuai sistem operasi.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

Instal dependensi:

```bash
pip install -r requirements.txt
```

Jalankan server FastAPI:

```bash
uvicorn main:app --reload
```

Secara default, backend dapat diakses melalui:

`http://localhost:8000`

Dokumentasi interaktif API FastAPI dapat dibuka melalui:

`http://localhost:8000/docs`

**Catatan:** Pastikan file `requirements.txt` tersedia dan konfigurasi API frontend mengarah ke alamat backend yang sesuai.

---

## 🔌 Dokumentasi API

Bagian ini menjelaskan kontrak request dan contoh respons API untuk fitur utama TypoKu. Contoh berikut merupakan format yang diharapkan dan perlu disesuaikan dengan implementasi backend aktual.

### 1. Koreksi Typo

**Endpoint:** `POST /api/koreksi`

**Request:** `multipart/form-data`

| Properti | Tipe | Keterangan |
|---|---|---|
| `file` | File | Dokumen DOCX atau PDF |
| `text` | String | Teks yang ingin dikoreksi |

Gunakan `file` atau `text` sesuai metode input yang didukung backend.

**Contoh respons:**

```json
{
  "status": "success",
  "message": "Koreksi berhasil dilakukan",
  "original_filename": "Makalah_Machine_Learning.docx",
  "result_text": "Teks hasil perbaikan ejaan dan typo...",
  "corrections_count": 4,
  "download_url": "https://api-typoku.up.railway.app/download/result_makalah.docx"
}
```

### 2. Parafrase Cerdas

**Endpoint:** `POST /api/parafrase`

**Request:** `multipart/form-data`

| Properti | Tipe | Keterangan |
|---|---|---|
| `text` | String | Teks yang ingin diparafrase |
| `file` | File | Dokumen yang ingin diproses |
| `style` | String | Gaya parafrase, misalnya `akademik` atau `formal` |

**Contoh respons:**

```json
{
  "status": "success",
  "result_text": "Hasil kalimat yang sudah diparafrase...",
  "download_url": "https://api-typoku.up.railway.app/download/result_parafrase.docx"
}
```

### 3. Penerjemah Akademik

**Endpoint:** `POST /api/terjemah`

**Request:** `multipart/form-data`

| Properti | Tipe | Keterangan |
|---|---|---|
| `text` | String | Teks yang ingin diterjemahkan |
| `file` | File | Dokumen yang ingin diterjemahkan |
| `target_lang` | String | Bahasa tujuan: `en` atau `id` |

**Contoh respons:**

```json
{
  "status": "success",
  "source_language": "id",
  "target_language": "en",
  "translated_text": "Translated academic text result...",
  "download_url": "https://api-typoku.up.railway.app/download/result_translate.docx"
}
```

### Catatan Integrasi API

- Request berbasis file menggunakan `multipart/form-data`.
- Properti respons di atas adalah contoh kontrak API, bukan jaminan bahwa seluruh properti sudah tersedia pada backend.
- Frontend perlu menangani respons berhasil, kegagalan request, dan validasi input.
- Tautan unduhan harus berasal dari respons backend yang valid.
- URL backend pada contoh perlu disesuaikan dengan alamat deployment aktual.

---

## 📌 Catatan Pengembangan

TypoKu dikembangkan sebagai aplikasi pendukung penulisan akademik. Hasil koreksi, parafrase, dan terjemahan sebaiknya tetap ditinjau oleh pengguna sebelum digunakan dalam dokumen resmi atau publikasi ilmiah.

AI berfungsi sebagai alat bantu, bukan pengganti proses penyuntingan dan verifikasi sumber.

---

## 👩‍💻 Pengembang

**Intan Maharani**

- GitHub: [@intannz](https://github.com/intannz)

---

*TypoKu : Cek ejaan, pahami perbaikannya.*