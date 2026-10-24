# TypoKu : Asisten Penulisan Akademik AI

**TypoKu** adalah platform asisten penulisan berbasis kecerdasan buatan (*Artificial Intelligence/AI*) yang dirancang untuk membantu mahasiswa, dosen, dan akademisi Indonesia dalam menyempurnakan kualitas tulisan. TypoKu menyediakan fitur koreksi ejaan dan salah ketik (*typo*), parafrase kalimat, penerjemahan naskah akademik, serta ekstraksi teks dari dokumen PDF dan DOCX.

---

## Fitur Utama

### 1. Koreksi Typo dan Ejaan
Membantu mendeteksi kesalahan penulisan, ejaan, penggunaan imbuhan, dan kata yang kurang efektif berdasarkan kaidah bahasa Indonesia.

- Mendukung input teks langsung maupun dari ekstraksi dokumen.
- Mengembalikan daftar kata salah, saran perbaikan, dan keterangannya dalam format terstruktur (JSON).

### 2. Parafrase Cerdas
Membantu menyusun ulang kalimat agar lebih jelas, lugas, formal, atau akademik tanpa mengubah inti makna.

- Mendukung penyesuaian gaya penulisan (misal: gaya akademik).

### 3. Penerjemah Akademik
Membantu menerjemahkan teks akademik dari bahasa Indonesia ke bahasa Inggris maupun sebaliknya.

- Mendukung penerjemahan dua arah (Indonesia–Inggris).
- Mempertahankan konteks dan terminologi akademik.

### 4. Ekstraksi Dokumen (PDF & DOCX)
Membaca dan mengekstrak teks dari file dokumen yang diunggah pengguna untuk dimasukkan ke dalam editor aplikasi secara otomatis.

---

## Teknologi yang Digunakan

### Frontend
- **React.js** : membangun antarmuka aplikasi.
- **Vite** : development server dan build tool.
- **React Router DOM** : mengatur navigasi antar halaman.
- **React Icons** : menyediakan ikon antarmuka.
- **CSS** : mengatur tampilan dan responsivitas aplikasi.

### Backend
- **Python** : bahasa pemrograman utama.
- **FastAPI & Uvicorn** : framework REST API yang cepat dan berbasis asynchronous.
- **Google GenAI SDK** : integrasi dengan model AI Gemini (`gemini-3.8-flash`).
- **PyPDF2 & python-docx** : pustaka ekstraksi teks dari file PDF dan Word (DOCX).
- **python-multipart** : penanganan unggahan file (*file upload*).
- **Scikit-learn & Joblib** : mendukung pemrosesan model machine learning lokal.

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
│   ├── models/             # Model machine learning (.joblib)
│   ├── notebooks/          # Notebook eksperimen dan pelatihan
│   ├── main.py             # Entry point FastAPI
│   └── requirements.txt    # Dependensi Python
│
├── .gitignore              # Pengecualian file sensitif & virtualenv
└── README.md
```

---

## Instalasi dan Menjalankan Proyek

### Prasyarat

Pastikan perangkat telah memiliki lingkungan berikut dengan versi yang didukung (disarankan menggunakan patch versi terbaru untuk alasan keamanan):

- **Node.js**: v18.x atau lebih baru
- **Python**: v3.10.x – v3.13.x (Disarankan menggunakan patch rilis terbaru)
- **Git**: v2.x atau lebih baru
- **Pip**: Disarankan memperbarui pip ke versi terbaru (`python -m pip install --upgrade pip`)

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
```

Buat dan aktifkan *virtual environment*:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Instal seluruh dependensi Python:
```bash
pip install -r requirements.txt
```

Konfigurasi file `.env` di folder `backend`:
```env
GEMINI_API_KEY=AIzaSy_GantiDenganApiKeyGeminiKamu
```

Jalankan server FastAPI:
```bash
uvicorn main:app --reload
```

Backend dapat diakses di `http://localhost:8000` dan dokumentasi Swagger API di `http://localhost:8000/docs`.

---

## Dokumentasi API

Seluruh endpoint backend mengembalikan respons JSON.

### 1. Ekstraksi Teks Dokumen (PDF/DOCX)
Mengekstrak teks dari file yang diunggah pengguna.

- **Endpoint:** `POST /api/ekstrak-teks`
- **Content-Type:** `multipart/form-data`

| Parameter | Tipe | Keterangan |
|---|---|---|
| `file` | File | File dokumen (.pdf atau .docx) |

**Contoh Respons Berhasil:**
```json
{
  "status": "success",
  "filename": "draft_artikel.docx",
  "extracted_text": "Ini adalah teks hasil ekstraksi dari file..."
}
```

---

### 2. Cek Typo dan Ejaan
Mendeteksi kata yang salah ketik atau tidak baku dalam teks.

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

---

### 3. Parafrase Cerdas
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

### 4. Penerjemah Akademik
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
3. **Alur UI Load Document:**
   - User mengunggah file => Frontend memanggil `/api/ekstrak-teks`.
   - Teks hasil ekstraksi ditampilkan pada textarea/editor *frontend*.
   - User menekan tombol tindakan (Cek Typo / Parafrase / Terjemah) => Frontend memanggil endpoint yang sesuai.

---

## Pengembang

Proyek ini dikembangkan sebagai bagian dari tugas Digital Entrepreneurship.

---

*TypoKu : Cek ejaan, pahami perbaikannya.*