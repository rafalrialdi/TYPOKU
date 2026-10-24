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

## Dokumentasi API

Bagian ini menjelaskan kontrak *request* dan contoh respons API dari backend FastAPI yang terintegrasi dengan Gemini AI.

### 1. Cek Typo dan Ejaan

Mendeteksi kata yang salah ketik atau tidak baku dalam teks berdasarkan kaidah bahasa Indonesia.

- **Endpoint:** `POST /api/cek-typo`
- **Content-Type:** `application/json`

**Contoh Request Body:**

```json
{
  "text": "saya beli apotik dan jadual di pasar"
}
```

**Contoh Respons Berhasil:**

```json
{
  "status": "success",
  "original_text": "saya beli apotik dan jadual di pasar",
  "typo_list": [
    {
      "kata_salah": "apotik",
      "saran_perbaikan": "apotek",
      "keterangan": "Tidak baku"
    },
    {
      "kata_salah": "jadual",
      "saran_perbaikan": "jadwal",
      "keterangan": "Tidak baku"
    }
  ]
}
```

### 2. Parafrase Cerdas

Menyusun ulang kalimat agar lebih jelas dan sesuai dengan gaya bahasa formal atau akademik tanpa mengubah inti maknanya.

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

### 3. Penerjemah Akademik

Menerjemahkan teks akademik dari bahasa Indonesia ke bahasa Inggris maupun sebaliknya.

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

### Catatan Integrasi API

- Seluruh endpoint menerima *request* dalam format JSON (`application/json`).
- Frontend perlu mengirimkan header `Content-Type: application/json` saat melakukan request.
- Endpoint `/api/cek-typo` mengembalikan `typo_list` yang berisi kata yang perlu diperbaiki, saran perbaikan, dan keterangannya.
- Respons API di atas merupakan contoh format keluaran. Pastikan nama properti dan struktur respons sesuai dengan implementasi backend aktual.

---

## Catatan Pengembangan

TypoKu dikembangkan sebagai aplikasi pendukung penulisan akademik. Hasil koreksi, parafrase, dan terjemahan sebaiknya tetap ditinjau oleh pengguna sebelum digunakan dalam dokumen resmi atau publikasi ilmiah.

AI berfungsi sebagai alat bantu, bukan pengganti proses penyuntingan dan verifikasi sumber.

---

## Pengembang

Proyek ini dikembangkan sebagai bagian dari tugas kelompok Digital Enterpreneurship.

---

*TypoKu : Cek ejaan, pahami perbaikannya.*