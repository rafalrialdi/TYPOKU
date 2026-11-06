# Hero Section TypoKu — Dokumentasi Implementasi

Dokumen ini mencatat kebutuhan hero section homepage, rumus tinggi yang dipakai, dan kode yang sudah diimplementasikan.

File terkait:

- `src/pages/Home.jsx` — markup hero dan mockup editor.
- `src/pages/home.css` — seluruh styling hero, background, dan media query.
- `src/components/Navbar.jsx` — logo dan navigasi.
- `src/components/components.css` — ukuran logo, tombol navbar, dan footer.

---

## 1. Kebutuhan Hero Section

1. Hero harus tampil penuh dalam **satu layar** dan section pricing tidak ikut terlihat saat halaman pertama kali dibuka.
2. Ukuran teks dan spacing menggunakan pendekatan fluid dengan `clamp(min, fluid, max)`, bukan scaling global yang memaksa semua desktop memiliki pixel identik.
3. Desktop mempertahankan komposisi dua kolom selama ruang tersedia cukup; mobile memakai satu kolom dengan urutan konten utama terlebih dahulu.
4. Urutan hero pada mobile adalah judul, deskripsi, tombol aksi, lalu editor preview agar pesan dan CTA langsung terlihat sebelum elemen dekoratif.
2. Tinggi hero memakai rumus yang memperhitungkan tinggi navbar (80px).
3. Background hero dan section pricing harus **menyatu**, tidak ada garis pembatas panjang antar-section.
4. Background putih diberi tint ungu muda yang samar dan halus.
5. Card editor mockup memiliki aksen dekoratif:
   - tile ungu di sudut atas-kiri,
   - tile ungu di sudut bawah-kanan,
   - doodle panah putus-putus.
6. Logo navbar diperbesar agar proporsional dengan wordmark "TypoKu".
7. Tombol hero:
   - **Mulai Sekarang** → `/cek-typo`,
   - **Lihat Paket** → `#paket`,
   - tombol utama dibuat sedikit lebih panjang dari tombol sekunder.
8. Layout harus terasa profesional dan tidak menyisakan ruang kosong berlebihan di kiri-kanan pada layar lebar.
9. Judul hero harus selalu berbentuk dua baris yang sama di semua ukuran layar:
   - `Tulisan Akademik Bebas`
   - `Typo, Lebih Percaya Diri`
   - Pembungkusan baris dipaksa lewat dua elemen `<span>` (bukan mengandalkan wrap otomatis), sehingga ukuran font responsif tidak mengubah bentuk judul.

---

## 2. Rumus Tinggi Hero

Navbar memiliki tinggi tetap 80px. Nilai tersebut disimpan sebagai CSS variable agar mudah diubah:

```css
.home-page {
  --home-navbar-height: 80px;
}
```

Hero memakai `min-height` dengan tiga fallback:

```css
.home-hero {
  min-height: calc(100vh - var(--home-navbar-height));
  min-height: calc(100dvh - var(--home-navbar-height));
  min-height: calc(100svh - var(--home-navbar-height));
}
```

Penjelasan:

- `100vh` — fallback untuk browser lama.
- `100dvh` — dynamic viewport height, mengikuti tinggi viewport yang berubah.
- `100svh` — small viewport height, nilai paling aman agar seluruh hero tetap terlihat saat toolbar browser muncul (dipakai terakhir sehingga menang di browser modern).
- `calc(... - var(--home-navbar-height))` — karena navbar ikut alur layout (sticky), tinggi hero dikurangi 80px agar bagian bawah hero tepat di batas viewport.

`min-height` dipilih, bukan `height`, supaya hero boleh memanjang jika kontennya lebih tinggi dari layar dan tidak terpotong.

---

## 3. Kode CSS yang Diimplementasikan

### 3.1 Background halaman

```css
.home-page {
  --home-navbar-height: 80px;
  background:
    radial-gradient(ellipse 900px 520px at 15% 4%, rgba(99, 87, 255, 0.07), transparent 70%),
    radial-gradient(ellipse 800px 600px at 92% 55%, rgba(99, 87, 255, 0.045), transparent 70%),
    #fbfaff;
  color: #141b2b;
}
```

Gradient diletakkan di `.home-page`, bukan di masing-masing section, sehingga hero dan pricing berbagi background yang sama dan tidak muncul garis pembatas.

### 3.2 Container

```css
.home-container {
  width: 100%;
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 3rem;
}
```

`max-width` 1536px membuat ruang kosong kiri-kanan lebih sedikit pada layar lebar, sementara pada lebar 1280px tampilannya tetap sama seperti referensi desain.

### 3.3 Hero

```css
.home-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: center;
  min-height: calc(100vh - var(--home-navbar-height));
  min-height: calc(100dvh - var(--home-navbar-height));
  min-height: calc(100svh - var(--home-navbar-height));
  padding: 3rem 0;
}
```

### 3.4 Grid, urutan mobile, dan tipografi

Pada desktop, hero menggunakan dua kolom. Pada viewport di bawah 1024px, hero berubah menjadi satu kolom. Urutan mobile sengaja menempatkan copy sebelum editor preview:

```css
@media (max-width: 1023px) {
  .home-hero-copy {
    order: 1;
  }

  .home-editor-wrap {
    order: 2;
  }
}
```

Dengan urutan tersebut, pengguna melihat judul, deskripsi, dan CTA sebelum preview editor. Ini lebih efektif pada layar sempit karena tujuan halaman langsung terlihat.

```css
.home-hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .home-hero-grid {
    grid-template-columns: 7fr 5fr;
    gap: 3rem;
  }
}

.home-hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
}

.home-hero-copy h1 {
  max-width: 700px;
  font-size: clamp(2.5rem, 4.4vw, 3.75rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #141b2b;
}

.home-hero-copy h1 span {
  display: block;
}

.home-lead {
  max-width: 580px;
  font-size: 1.125rem;
  line-height: 1.7;
  font-weight: 400;
  color: #4b5563;
}
```

### 3.5 Tombol

```css
.home-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding-top: 0.25rem;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-button-primary {
  padding-left: 2rem;
  padding-right: 2rem;
  background: #4f46e5;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(20, 27, 43, 0.08);
}

.home-button-primary:hover {
  background: #4338ca;
  transform: scale(1.01);
}

.home-button-secondary {
  background: #ffffff;
  color: #141b2b;
  border: 1px solid #e5e7eb;
}

.home-button-secondary:hover {
  background: #f9fafb;
  color: #3525cd;
}
```

### 3.6 Aksen dekoratif card editor

```css
.home-editor-tile {
  position: absolute;
  right: -1rem;
  bottom: -1rem;
  z-index: 1;
  width: 9rem;
  height: 9rem;
  border-radius: 1rem;
  background: rgba(189, 194, 255, 0.4);
}

.home-editor-tile-top {
  top: -1.25rem;
  left: -1.25rem;
  right: auto;
  bottom: auto;
  background: rgba(189, 194, 255, 0.28);
}

.home-doodle svg {
  width: 8rem;
  height: 6rem;
  overflow: visible;
}

.home-doodle-top {
  top: -3rem;
  left: -3.5rem;
}

.home-doodle-bottom {
  bottom: -3rem;
  right: -3rem;
}
```

Doodle panah selalu ditampilkan, termasuk di layar pendek. Ukuran 8rem x 6rem dipilih agar ujung panah tetap berada di area header card dan tidak menutupi baris meta. Garis panah dibuat lebih panjang dengan menggeser titik ekor di dalam `viewBox`, sedangkan ujung panah tidak dipindahkan agar posisinya tetap presisi.

### 3.7 Media query untuk desktop pendek

```css
/* Desktop pendek, mis. 1280x720 */
@media (min-width: 1024px) and (max-height: 760px) {
  .home-hero {
    padding: 2rem 0;
  }

  .home-hero-copy {
    gap: 1.125rem;
  }

  .home-hero-copy h1 {
    font-size: clamp(2.25rem, 3.8vw, 3.25rem);
  }

  .home-lead {
    font-size: 1rem;
    line-height: 1.6;
  }

  .home-editor-body {
    padding: 1.25rem;
    gap: 0.75rem;
  }

  .home-editor-body p {
    font-size: 0.8125rem;
    line-height: 1.6;
  }

  .home-correction {
    margin-top: 0.375rem;
    padding: 0.75rem;
  }
}

/* Desktop sangat pendek / zoom besar, mis. 1024x600 */
@media (min-width: 1024px) and (max-height: 660px) {
  .home-hero {
    padding: 1.25rem 0;
  }

  .home-hero-copy {
    gap: 0.875rem;
  }

  .home-hero-copy h1 {
    font-size: clamp(2rem, 3.6vw, 3rem);
  }

  .home-lead {
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .home-editor-body {
    padding: 1rem;
    gap: 0.625rem;
  }

  .home-editor-body p {
    font-size: 0.78125rem;
    line-height: 1.55;
  }

  .home-editor-footer {
    padding: 0.5rem 0.875rem;
  }
}
```

### 3.8 Tablet dan mobile (card editor di atas, teks di bawah)

Di bawah 1024px hero tidak dipaksa setinggi viewport karena konten ditumpuk vertikal. Urutan visual di HP/Android dibuat **card editor lebih dulu di atas, lalu judul dan teks di bawahnya**. Grid tetap satu kolom, dan urutan diatur dengan `order` agar layout desktop dua kolom tidak berubah.

```css
@media (max-width: 1023px) {
  .home-container {
    padding: 0 clamp(1rem, 5vw, 3rem);
  }

  .home-hero {
    min-height: auto;
    padding: clamp(1.5rem, 4vw, 3rem) 0 1.5rem;
  }

  .home-hero-grid {
    gap: clamp(1.5rem, 4vw, 3rem);
  }

  .home-editor-wrap {
    order: 1;
  }

  .home-hero-copy {
    order: 2;
    gap: clamp(0.875rem, 3vw, 1.25rem);
  }

  .home-hero-copy h1 {
    font-size: clamp(1.6rem, 6.8vw, 3.25rem);
  }

  .home-lead {
    font-size: clamp(0.9375rem, 3.4vw, 1.125rem);
    line-height: 1.65;
  }

  .home-editor-body {
    padding: clamp(0.875rem, 4vw, 1.5rem);
    gap: clamp(0.625rem, 2.5vw, 0.875rem);
  }

  .home-editor-body p {
    font-size: clamp(0.78125rem, 3.2vw, 0.875rem);
  }

  .home-editor-footer {
    padding: clamp(0.5rem, 2.5vw, 0.75rem) clamp(0.75rem, 3.5vw, 1rem);
  }
}
```

### 3.9 Rumus responsif HP

Supaya tampilan konsisten di berbagai lebar HP, semua ukuran penting memakai `clamp(min, fluid, max)`:

```text
ukuran = clamp(nilai_minimum, nilai_fluid_vw, nilai_maksimum)
```

- `vw` membuat ukuran mengikuti lebar layar HP.
- `min` menjaga teks tetap terbaca di HP kecil (mis. 320–360px).
- `max` mencegah teks atau padding terlalu besar di tablet (768–1023px).
- `min-height: auto` dipakai karena konten vertikal HP lebih tinggi dari viewport; hero tidak dipaksa setinggi layar.
- Grid otomatis satu kolom karena `grid-template-columns: 1fr` pada ukuran dasar.
- `order: 1` pada `.home-editor-wrap` dan `order: 2` pada `.home-hero-copy` membuat card editor tampil di atas tanpa mengubah urutan DOM desktop.

Breakpoint `1023px` dipilih karena di `1024px` ke atas grid berubah menjadi dua kolom `7fr 5fr` (teks kiri, card kanan). Di bawahnya, tampilan menjadi satu kolom dengan card di atas.

Catatan aksesibilitas: `order` hanya mengubah urutan visual, bukan urutan DOM/tab. Saat ini DOM tetap menempatkan teks lebih dulu; jika suatu saat urutan fokus harus sama dengan urutan visual di HP, ubah struktur JSX atau tambahkan pengelolaan fokus.

---

## 4. Markup Hero (Home.jsx)

Bagian utama hero:

```jsx
<section className="home-hero">
  <div className="home-hero-glow" aria-hidden="true" />
  <div className="home-container">
    <div className="home-hero-grid">
      <div className="home-hero-copy">
        <h1>
          <span>Tulisan Akademik Bebas</span>
          <span>Typo, Lebih Percaya Diri</span>
        </h1>
        <p className="home-lead">
          Asisten penulisan akademik berbasis AI terstandarisasi PUEBI &amp; KBBI.
          Deteksi salah ketik, perbaiki struktur kalimat, parafrase ilmiah, dan
          terjemahan jurnal tanpa mengubah esensi riset Anda.
        </p>
        <div className="home-actions">
          <Link className="home-button home-button-primary" to="/cek-typo">
            Mulai Sekarang
          </Link>
          <a className="home-button home-button-secondary" href="#paket">
            Lihat Paket
            <FiArrowRight />
          </a>
        </div>
      </div>
      <EditorPreview />
    </div>
  </div>
</section>
```

Urutan DOM tetap teks lalu `EditorPreview` agar desktop tidak berubah. Di HP, CSS `order` menampilkan `EditorPreview` lebih dulu, baru teks di bawahnya.

`EditorPreview` berisi:

- doodle panah atas-kiri dan bawah-kanan,
- toolbar file `Draf_Bab4_Skripsi_v2.docx`,
- meta `Modul Pemeriksaan: PUEBI 2024` dan `842 Kata`,
- dua paragraf contoh dengan kata `efektifitas` di-highlight,
- kartu koreksi `efektifitas → efektivitas`,
- status footer `Pemeriksaan aktif` dan `Selesaikan Semua`,
- dua tile ungu dekoratif.

---

## 5. Perilaku per Ukuran Layar

| Viewport | Perilaku |
|---|---|
| 1920×1080 | Hero penuh satu layar, konten di tengah, pricing tidak terlihat |
| 1536×864 | Hero penuh satu layar, pricing tidak terlihat |
| 1366×768 | Hero penuh satu layar, pricing tidak terlihat (sudah diverifikasi) |
| 1280×720 | Media query `max-height: 760px` aktif, ukuran teks dan card sedikit mengecil |
| 1024×600 | Media query `max-height: 660px` aktif, doodle tetap tampil pada posisi aslinya |
| ≤1023px (tablet/mobile) | `min-height: auto`, card editor tampil di atas, teks di bawah, ukuran fluid via `clamp()` |

Catatan: `min-height` hanya menjamin hero minimal setinggi satu layar. Jika konten lebih tinggi dari viewport (misalnya zoom sangat besar), hero akan memanjang dan sebagian konten bisa berada di bawah fold. Media query tinggi di atas mengurangi risiko tersebut sampai sekitar 600px.

Judul hero tetap dua baris di semua ukuran karena setiap baris dibungkus `<span>` dengan `display: block`. Yang berubah hanya ukuran font, bukan bentuk atau titik pemisahan barisnya.

---

## 6. Verifikasi

Perintah build:

```bash
npm run build
```

Checklist:

- Hero mengisi tepat satu layar pada 1366×768.
- Section pricing tidak terlihat saat halaman dibuka.
- Tidak ada garis pembatas antar hero dan pricing.
- Background ungu muda terlihat samar dan menyatu.
- Tombol "Mulai Sekarang" mengarah ke `/cek-typo`.
- Card editor dan doodle tetap rapi pada layar pendek.
- Di HP (mis. 390×844 dan 360×800), card editor tampil di atas, lalu judul, lead, dan tombol di bawahnya.
- Tidak ada overflow horizontal pada 320px, 360px, dan 390px.
- Perpindahan urutan card/teks hanya terjadi di bawah 1024px; desktop tetap dua kolom.
