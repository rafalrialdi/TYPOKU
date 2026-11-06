# TypoKu — Frontend Design System & UI/UX Specification

Dokumen ini mendefinisikan arsitektur antarmuka, sistem desain (*design system*), panduan komponen, dan alur pengalaman pengguna (*user experience*) untuk aplikasi frontend **TypoKu** berbasis **React 19** dan **Vite**.

---

## 1. Filosofi & Arah Desain

- **Karakter Visual:** *Modern Academic Workspace*, bersih, fokus, dan profesional tanpa terasa kaku.
- **Target Pengguna:** Mahasiswa, dosen, peneliti, dan akademisi Indonesia.
- **Fokus Pengalaman:** Efisiensi membaca, kejelasan perbaikan teks (*clarity*), dan navigasi tanpa hambatan (*low friction*).
- **Hirarki Visual:** Konten naskah dan hasil perbaikan selalu menjadi fokus utama (rasio kontras tajam, ornamen visual minimalis).

---

## 2. Fondasi Desain (*Design Tokens*)

### 2.1 Palet Warna (*Color Palette*)

| Token / Variabel | Nilai HEX | Penggunaan |
| :--- | :--- | :--- |
| `--primary-color` | `#4F46E5` (Indigo 600) | Warna brand utama, tombol primer, link aktif, ikon sorotan |
| `--primary-hover` | `#4338CA` (Indigo 700) | State hover tombol & tautan |
| `--primary-light` | `#EEF2FF` (Indigo 50) | Background badge, hover list, active state sidebar |
| `--bg-color` | `#FAFAFC` | Latar belakang halaman publik (Home, Info) |
| `--bg-dashboard` | `#F9FAFB` (Gray 50) | Latar belakang area kerja dashboard & editor |
| `--bg-surface` | `#FFFFFF` | Latar belakang kartu (Card), modal, header, navbar |
| `--text-primary` | `#111827` (Gray 900) | Judul heading, teks utama naskah |
| `--text-secondary`| `#4B5563` (Gray 600) | Deskripsi, subtitle, metadata naskah |
| `--text-muted` | `#9CA3AF` (Gray 400) | Placeholder, caption sekunder |
| `--border-color` | `#E5E7EB` (Gray 200) | Pembatas card, divider, garis tabel |
| `--border-focus` | `#818CF8` (Indigo 400) | Outline input saat aktif (focus-visible) |

#### Warna Status & Fitur AI
- **Typo Highlight (Kuning):** 
  - Background: `#FEF08A` (Yellow 200)
  - Teks: `#854d0e` (Yellow 900)
  - Style: `<mark style="background-color: #fef08a; color: #854d0e; padding: 2px 4px; border-radius: 4px; font-weight: 500;">`
- **Success / Valid (Hijau):** `#16A34A` / Background: `#DCFCE7`
- **Warning / Alert (Oranye/Kuning):** `#D97706` / Background: `#FEF3C7`
- **Error / Danger (Merah):** `#DC2626` / Background: `#FEE2E2`

### 2.2 Tipografi (*Typography*)

- **Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Perlakuan Teks Naskah/Editor:** Line-height longgar (`1.6 – 1.8`) untuk menjaga kenyamanan pembacaan teks panjang (*eye ergonomics*).

| Tingkat | Ukuran (Desktop) | Bobot (*Weight*) | Line Height | Penerapan |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1 Hero** | 48px (`3.0rem`) | 800 (ExtraBold) | 1.2 | Hero landing page |
| **Page Title / H2** | 32px (`2.0rem`) | 700 (Bold) | 1.3 | Judul halaman dashboard |
| **Section Title / H3**| 24px (`1.5rem`) | 600 (SemiBold) | 1.4 | Judul kartu layanan |
| **Subtitle / H4** | 18px (`1.125rem`)| 600 (SemiBold) | 1.5 | Sub-bagian / label header |
| **Body Regular** | 15px – 16px (`1rem`) | 400 (Regular) | 1.6 – 1.7 | Teks naskah, deskripsi |
| **Body Medium** | 14px (`0.875rem`)| 500 (Medium) | 1.5 | Tombol, menu sidebar, badge |
| **Caption / Small** | 12px (`0.75rem`)| 500 / 600 | 1.4 | Timestamp, tooltip, kuota |

### 2.3 Elevasi & Sudut Lengkung (*Elevation & Radius*)

- **Radius (Border Radius):**
  - Small (`rounded-sm`): `4px` (tag highlight mark, chip kecil)
  - Medium (`rounded-md`): `8px` (input, button, notifikasi)
  - Large (`rounded-lg`): `12px` – `16px` (modal, card, upload box)
  - Pill (`rounded-full`): `999px` (avatar, status badge)
- **Shadows (Bayangan):**
  - `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (card default)
  - `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (dropdown, hover card)
  - `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1)` (modal, preview mockup)

---

## 3. Sistem Layout & Navigasi

Aplikasi menggunakan 3 arsitektur layout utama via `react-router-dom`:

```
App
├── MainLayout (Publik) ───────── Landing Page (/), Harga (/harga), Legal (/tentang, /bantuan, /privasi, /syarat)
├── AuthLayout (Autentikasi) ──── Login (/login), Register (/register)
└── DashboardLayout (Workspace) ─ Dashboard (/dashboard), Koreksi Typo (/koreksi), Parafrase (/parafrase), Terjemah (/terjemah), Langganan (/langganan), Pengaturan (/pengaturan)
```

### 3.1 MainLayout (Halaman Publik)
- **Header/Navbar:** Sticky top, logo TypoKu di kiri, navigasi anchor tengah, tombol aksi "Masuk" & "Coba Gratis" di kanan.
- **Main Content:** Lebar maksimal 1280px terpusat dengan padding responsif.
- **Footer:** Multi-kolom (Produk, Bantuan, Legal, Copyright) dengan tema netral.

### 3.2 AuthLayout (Autentikasi)
- **Karakter:** Layar penuh (*full viewport*) dengan background lembut (`#F0F4F8`).
- **Kartu Tengah:** Lebar maksimal `400px`, padding luas, logo TypoKu di atas form, beralih antara Login dan Register secara mulus.

### 3.3 DashboardLayout (Workspace Aplikasi)
- **Sidebar Kiri (Fixed/Collapsible, lebar 260px):**
  - Bagian atas: Logo brand & badge workspace aktif.
  - Bagian tengah: Menu navigasi utama (`Dashboard`, `Koreksi Dokumen`, `Parafrase Cerdas`, `Penerjemah Jurnal`, `Riwayat`).
  - Bagian bawah: Indikator kuota akun & tombol logout.
- **Top Header Bar (Sticky, tinggi 64px):**
  - Search bar dokumen / naskah.
  - Tombol aksi cepat (+ Upload Dokumen).
  - Lonceng notifikasi & profil pengguna dengan dropdown menu.
- **Area Kerja Konten:** Lebar fleksibel, scroll independen, background `#F9FAFB`.

---

## 4. Spesifikasi Halaman & Fitur Utama

### 4.1 Koreksi Typo & Ejaan (`/koreksi`)
- **Zona Input:**
  - Area *drag-and-drop* file dokumen (.pdf, .docx) dengan indikator batas ukuran (maks. 5MB).
  - Preview nama file dan ukuran saat file dipilih.
  - Tombol aksi primer: `Periksa Dokumen Sekarang`.
- **Zona Hasil / Editor Teks:**
  - Tampilan split 2 kolom atau tab (Teks Asli vs Teks Hasil Perbaikan).
  - Kata-kata yang diperbaiki otomatis terbungkus `<mark>` warna kuning lembut.
  - Toolbar aksi: Salin Semua (`Copy to Clipboard`), Download TXT/DOCX, dan Bersihkan.
  - Ringkasan statistik cepat: Total kata, estimasi jumlah kesalahan yang dibetulkan.

### 4.2 Parafrase Cerdas (`/parafrase`)
- **Zona Input:**
  - Textarea interaktif dengan *live word counter*.
  - Pilihan gaya bahasa (*Pill Selector*): `Akademik (Formal)`, `Ringkas & Lugas`, `Ekspansif (Detil)`.
- **Zona Output:**
  - Hasil parafrase dengan perbandingan tingkat kemiripan makna.
  - Tombol `Salin Hasil` dan `Parafrase Ulang`.

### 4.3 Penerjemah Akademik (`/terjemah`)
- **Zona Input & Pengaturan Bahasa:**
  - Selector arah bahasa: `Indonesia ⇄ Inggris` dengan tombol tukar (*Swap*).
  - Dua panel berdampingan (*Side-by-side Editor*).
  - Input teks kiri (bahasa sumber) dan hasil kanan (bahasa tujuan) otomatis tersinkronisasi saat tombol `Terjemahkan` ditekan.

---

## 5. Panduan Komponen (*Component Guidelines*)

### 5.1 Tombol (*Buttons*)
- **Primary:** Background `#4F46E5`, teks putih, hover `#4338CA`, radius 8px, font-weight 600.
- **Secondary / Outline:** Border 1px `#E5E7EB`, background transparan / putih, teks `#111827`, hover background `#F3F4F6`.
- **Upload Action:** Background gradien halus atau kontras tinggi dengan ikon `FiUpload` atau `FiPlus`.
- **Disabled State:** Opacity 50%, kursor `not-allowed`.

### 5.2 Dropzone Upload Dokumen
- Garis putus-putus (*dashed border*) 2px warna `#CBD5E1`.
- State hover/drag-over: Border berubah menjadi `--primary-color` dengan latar belakang `#EEF2FF`.
- Ikon dokumen besar di tengah dengan instruksi teks jelas: *"Tarik & lepas file PDF/DOCX di sini atau klik untuk memilih file"*.

### 5.3 Indikator Loading & State Kosong
- **Loading:** Spinner lingkaran halus bernuansa primary indigo dengan teks status kontekstual (*"Sedang mengekstrak teks..."*, *"AI sedang menganalisis ejaan PUEBI..."*).
- **Empty State:** Ilustrasi dokumen minimalis, judul ringkas, dan satu tombol panggilan aksi (*Call-to-Action*) yang jelas.

---

## 6. Standar Integrasi API Frontend

Seluruh komunikasi backend difokuskan melalui `src/services/api.js` mengarah ke base URL `http://localhost:8000`:

```javascript
// Konfigurasi Endpoint:
POST /api/cek-typo   -> Body: FormData (file: File)
POST /api/parafrase  -> Body: JSON { text, style }
POST /api/terjemah   -> Body: JSON { text, target_lang }
```

### Penanganan Respon Koreksi Typo
Hasil dari `/api/cek-typo` menghasilkan HTML string yang memuat tag `<mark>`. Frontend harus merender dengan aman:

```jsx
<div 
  className="corrected-text-container"
  dangerouslySetInnerHTML={{ __html: resultText }}
/>
```

---

## 7. Responsivitas & Aksesibilitas (*Responsive & A11y*)

- **Breakpoints:**
  - Mobile: `< 768px` (Sidebar berubah menjadi drawer hamburger, editor split-screen bertransformasi menjadi vertikal atas-bawah).
  - Tablet: `768px – 1024px` (Sidebar versi ikon kompak / minim).
  - Desktop: `> 1024px` (Tampilan penuh dengan sidebar 260px).
- **Aksesibilitas:**
  - Kontras teks rasio minimal 4.5:1 (WCAG AA).
  - Semua elemen interaktif memiliki state `:focus-visible` dengan outline jelas.
  - Tag `<mark>` kuning memiliki kontras warna teks cokelat tua (`#854d0e`) di atas latar kuning pastel (`#fef08a`) sehingga ramah untuk pembacaan lama dan pembaca disleksia.
