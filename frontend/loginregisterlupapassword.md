# Spesifikasi Responsif Login, Register, dan Lupa Password

Dokumen ini mencatat ukuran acuan tampilan autentikasi TypoKu untuk desktop 1440px dan mobile. Semua ukuran diterapkan melalui `frontend/src/layouts/auth.css`.

## 1. Prinsip Responsif

- **Desktop acuan:** 1440 × 900px.
- **Laptop dengan ukuran berbeda:** tidak dipaksa menjadi 1440px. Layout menyesuaikan secara fluid menggunakan `width: 100%`, `max-width`, `clamp()`, `vh`, dan `dvh`.
- **Desktop/laptop:** mulai dari viewport dengan lebar minimum 640px menggunakan `@media (min-width: 640px)`; ukuran kartu, teks, padding, dan spacing memakai `clamp(min, fluid, max)` dengan batas maksimum.
- **Mobile:** viewport dengan lebar maksimum 639px menggunakan `@media (max-width: 639px)`.
- **Tinggi desktop/laptop:** halaman memakai `height: 100dvh` dan `overflow: hidden` agar form terlihat dalam satu layar.
- **Tinggi mobile:** halaman memakai `min-height: 100dvh`; register boleh scroll secara natural jika tinggi layar tidak mencukupi.

Dengan demikian, 1440px adalah ukuran desain referensi, bukan ukuran wajib. Pada laptop 1366px, 1280px, 1024px, atau ukuran lain, kartu tetap berada di tengah dan ukurannya mengikuti batas maksimum yang telah ditentukan.

## 2. Ukuran Desktop Acuan 1440px

Nilai di bawah adalah hasil acuan pada desktop 1440px. Implementasi tidak memakai ukuran fixed murni: nilai bergerak fluid dengan `clamp(min, fluid, max)` lalu berhenti pada batas maksimum agar layout tetap proporsional di laptop dan monitor besar.

### 2.1 Login

| Properti | Ukuran desktop |
|---|---:|
| Lebar maksimum kartu | `420px` |
| Padding kartu | `1.5rem 1.75rem 1.35rem` atau `24px 28px 21.6px` |
| Radius kartu | `0.75rem` atau `12px` |
| Badge logo | `3rem × 3rem` atau `48px × 48px` |
| Ukuran judul | `1.2rem` atau `19.2px` |
| Ukuran subtitle | `0.75rem` atau `12px` |
| Lebar maksimum subtitle | `20rem` atau `320px` |
| Tinggi input | `2.45rem` atau `39.2px` |
| Tinggi tombol | `2.45rem` atau `39.2px` |
| Ukuran teks input | `0.78rem` atau `12.48px` |
| Ukuran label | `0.7rem` atau `11.2px` |
| Ukuran checkbox | `0.85rem` atau `13.6px` |

Selector utama: `.auth-card:not(.auth-card--register)`.

### 2.2 Register

| Properti | Ukuran desktop |
|---|---:|
| Lebar maksimum kartu | `420px` |
| Padding kartu | `1.25rem 1.5rem 1.1rem` atau `20px 24px 17.6px` |
| Radius kartu | `0.75rem` atau `12px` |
| Badge logo | `2.75rem × 2.75rem` atau `44px × 44px` |
| Ukuran judul | `1.1rem` atau `17.6px` |
| Ukuran subtitle | `0.7rem` atau `11.2px` |
| Tinggi input | `2.2rem` atau `35.2px` |
| Tinggi tombol | `2.2rem` atau `35.2px` |
| Ukuran teks input | `0.74rem` atau `11.84px` |
| Ukuran label | `0.68rem` atau `10.88px` |
| Jarak antar field | `0.4rem` atau `6.4px` |

Selector utama: `.auth-card--register`.

Register menggunakan satu kolom vertikal. Karena jumlah field lebih banyak, spacing desktop dibuat lebih padat agar seluruh form dapat terlihat dalam satu layar 1440 × 900px.

### 2.3 Lupa Password, Cek Email, dan Reset Password

| Properti | Ukuran desktop |
|---|---:|
| Lebar maksimum kartu | `390px` |
| Padding kartu | `1.35rem 1.5rem 1.2rem` atau `21.6px 24px 19.2px` |
| Radius kartu | mengikuti kartu auth, sekitar `12px` |
| Badge logo | `2.75rem × 2.75rem` atau `44px × 44px` |
| Ukuran judul | `1.1rem` atau `17.6px` |
| Ukuran subtitle | `0.7rem` atau `11.2px` |
| Tinggi input | `2.3rem` atau `36.8px` |
| Tinggi tombol | `2.3rem` atau `36.8px` |
| Ukuran teks input | `0.75rem` atau `12px` |
| Ukuran label | `0.68rem` atau `10.88px` |
| Ukuran teks tautan kembali | `0.72rem` atau `11.52px` |

Selector utama: `.auth-card--narrow`.

Ukuran ini berlaku untuk:

- `/lupa-kata-sandi`
- `/cek-email`
- `/reset-password`
- Status tautan reset tidak valid
- Status reset berhasil
- Status verifikasi token

## 3. Ukuran Mobile

Breakpoint mobile: `max-width: 639px`.

### 3.1 Login

| Properti | Ukuran mobile |
|---|---:|
| Lebar kartu | `width: 100%`, maksimum `420px` |
| Padding kartu | `1.25rem 1.25rem 1.15rem` atau `20px 20px 18.4px` |
| Badge logo | `2.75rem × 2.75rem` atau `44px × 44px` |
| Ukuran judul | `1.15rem` atau `18.4px` |
| Ukuran subtitle | `0.72rem` atau `11.52px` |
| Tinggi input | `2.35rem` atau `37.6px` |
| Tinggi tombol | `2.35rem` atau `37.6px` |
| Ukuran teks input | `0.75rem` atau `12px` |
| Ukuran label | `0.68rem` atau `10.88px` |

Login dipusatkan dan dioptimalkan agar terlihat penuh pada layar ponsel umum seperti 390 × 844px, 360 × 800px, dan 320 × 720px.

### 3.2 Register

| Properti | Ukuran mobile |
|---|---:|
| Lebar kartu | `100%`, maksimum `460px` |
| Padding kartu | `1.4rem 1.25rem 1.25rem` atau `22.4px 20px 20px` |
| Radius kartu | `0.9rem` atau `14.4px` |
| Badge logo | `2.75rem × 2.75rem` atau `44px × 44px` |
| Ukuran judul | `1.15rem` atau `18.4px` |
| Ukuran subtitle | `0.74rem` atau `11.84px` |
| Tinggi input | `2.65rem` atau `42.4px` |
| Tinggi tombol | `2.65rem` atau `42.4px` |
| Ukuran teks input | `0.85rem` atau `13.6px` |
| Ukuran label | `0.75rem` atau `12px` |
| Jarak antar field | `0.75rem` atau `12px` |
| Ukuran checkbox | `1rem` atau `16px` |
| Ukuran teks persetujuan | `0.72rem` atau `11.52px` |

Register di mobile menggunakan `overflow-y: auto` karena memiliki banyak field. Scroll hanya muncul jika tinggi perangkat tidak mencukupi; lebar kartu tetap mengikuti viewport. Tinggi input sekitar 42px dipertahankan agar nyaman disentuh, sedangkan card dan spacing dibuat lebih lega supaya label, strength indicator, dan persetujuan tidak berhimpitan.

### 3.3 Lupa Password, Cek Email, dan Reset Password

| Properti | Ukuran mobile |
|---|---:|
| Lebar kartu | `100%` dengan batas ruang halaman |
| Padding kartu | `1.15rem 1rem 1rem` atau `18.4px 16px 16px` |
| Badge logo | `2.5rem × 2.5rem` atau `40px × 40px` |
| Ukuran judul | `1.05rem` atau `16.8px` |
| Ukuran subtitle | `0.68rem` atau `10.88px` |
| Tinggi input | `2.25rem` atau `36px` |
| Tinggi tombol | `2.25rem` atau `36px` |
| Ukuran teks input | `0.74rem` atau `11.84px` |
| Ukuran label | `0.66rem` atau `10.56px` |

Halaman lupa password tetap dibuat ringkas agar umumnya terlihat dalam satu layar mobile.

## 4. Penyesuaian Laptop Selain 1440px

### Laptop lebih kecil dari 1440px

- Kartu tidak melebar melebihi `max-width` masing-masing.
- Kartu tetap horizontal center.
- Padding dan ukuran elemen mengikuti aturan `clamp()` pada style dasar serta aturan desktop.
- Pada tinggi layar pendek, misalnya 1024 × 600px, media query `max-height: 620px` mengecilkan spacing, input, tombol, dan menyembunyikan subtitle agar tetap muat.

### Laptop lebih besar dari 1440px

- Kartu tetap memiliki lebar maksimum 420px untuk login/register dan 390px untuk alur lupa password.
- Ruang kosong di sisi kartu bertambah, tetapi proporsi kartu dan form tetap sama.
- Kartu tetap berada di tengah viewport.

## 5. Aturan Tinggi Layar Pendek

Untuk viewport dengan tinggi maksimum 620px:

- Subtitle auth disembunyikan untuk menghemat tinggi.
- Checklist password disembunyikan jika tersedia; indikator kekuatan password tetap digunakan.
- Padding kartu dan jarak antar elemen dipadatkan.
- Input dan tombol menggunakan tinggi sekitar `2.15rem`.
- Copyright tetap berada tepat di bawah kartu.

## 6. Struktur Halaman Auth

Semua halaman memakai struktur berikut:

```text
.auth-page
└── .auth-main
    ├── .auth-card
    └── .auth-copyright
```

Copyright berada di bawah kartu, bukan menempel pada dasar browser. Logo menggunakan badge ungu dengan huruf `T` putih tebal.

## 7. Daftar Halaman

| Route | Kelas kartu |
|---|---|
| `/login` | `.auth-card` |
| `/register` | `.auth-card.auth-card--register` |
| `/lupa-kata-sandi` | `.auth-card.auth-card--narrow` |
| `/cek-email` | `.auth-card.auth-card--narrow` |
| `/reset-password` | `.auth-card.auth-card--narrow` |

