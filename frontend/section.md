# Standar Fluid Section TypoKu

Dokumen ini menjadi acuan pembuatan section responsive di frontend TypoKu. Pendekatan utama menggunakan fluid typography dan fluid spacing dengan pola CSS:

```css
clamp(minimum, nilai-fluid, maksimum)
```

## 1. Tujuan

Fluid design membuat ukuran section menyesuaikan viewport secara halus tanpa membuat elemen terlalu kecil di layar sempit atau terlalu besar di layar lebar.

Targetnya bukan membuat semua ukuran layar memiliki pixel yang identik, tetapi menjaga agar section tetap:

- terbaca,
- seimbang,
- tidak overflow,
- nyaman digunakan,
- dan memiliki batas ukuran yang masuk akal.

## 2. Rumus `clamp()`

Sintaks:

```css
property: clamp(minimum, fluid, maksimum);
```

Contoh:

```css
.hero-title {
  font-size: clamp(2rem, 4vw, 3.75rem);
}

.section {
  padding: clamp(1.5rem, 5vw, 4rem) 0;
}
```

Artinya:

- Nilai tidak pernah lebih kecil dari `minimum`.
- Nilai mengikuti `fluid` ketika viewport berada di antara batas.
- Nilai tidak pernah lebih besar dari `maksimum`.

## 3. Fluid Typography

Gunakan `clamp()` untuk judul, teks pendukung, label section, dan elemen teks lain yang memang perlu mengikuti ukuran layar.

### Judul utama

```css
h1 {
  font-size: clamp(2rem, 4.4vw, 3.75rem);
  line-height: 1.08;
}
```

### Teks pendukung

```css
.lead {
  font-size: clamp(0.9375rem, 1.5vw, 1.125rem);
  line-height: 1.65;
}
```

### Prinsip ukuran

- Jangan menggunakan `vw` murni untuk teks penting tanpa batas.
- Selalu gunakan batas minimum agar teks tetap terbaca di layar kecil.
- Selalu gunakan batas maksimum agar teks tidak terlalu besar di monitor ultrawide.
- Gunakan `rem` untuk batas min/max agar konsisten dengan root font size.
- Gunakan `line-height` tanpa satuan untuk menjaga proporsi ketika font berubah.

## 4. Fluid Spacing

Gunakan `clamp()` untuk padding, margin, gap, dan jarak antar elemen section.

```css
.section {
  padding-block: clamp(2rem, 6vw, 5rem);
}

.section-grid {
  gap: clamp(1.25rem, 3vw, 3rem);
}

.section-copy {
  gap: clamp(0.875rem, 2vw, 1.5rem);
}
```

Gunakan `padding-block` dan `padding-inline` jika arah spacing perlu jelas:

```css
.section {
  padding-block: clamp(2rem, 5vh, 5rem);
  padding-inline: clamp(1rem, 5vw, 3rem);
}
```

## 5. Container Responsive

Section tidak boleh melebar tanpa batas pada monitor besar.

```css
.container {
  width: 100%;
  max-width: 1536px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 3rem);
}
```

`max-width` menjaga panjang baris teks dan posisi konten tetap nyaman. Pada layar yang lebih kecil, padding menyusut menggunakan `clamp()`.

## 6. Tinggi Satu Layar

Untuk hero atau section yang harus memenuhi area layar, kurangi tinggi navbar dari dynamic viewport height:

```css
.page {
  --navbar-height: 80px;
}

.hero {
  min-height: calc(100dvh - var(--navbar-height));
  min-height: calc(100svh - var(--navbar-height));
}
```

Gunakan `min-height`, bukan `height`, agar konten tetap boleh bertambah ketika konten lebih tinggi daripada viewport.

- `100dvh` mengikuti viewport dinamis.
- `100svh` lebih aman ketika browser mobile menampilkan toolbar.
- `min-height` mencegah konten terpotong.

## 7. Breakpoint

Breakpoint dipakai ketika struktur layout perlu berubah, bukan untuk setiap perubahan ukuran kecil.

Contoh:

```css
.section-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .section-grid {
    grid-template-columns: 7fr 5fr;
  }
}
```

Prinsip TypoKu:

- Mobile: satu kolom, konten utama lebih dahulu.
- Desktop: dua kolom jika ruang cukup.
- Tablet: tetap satu kolom sampai dua kolom benar-benar nyaman.
- Breakpoint ditentukan berdasarkan kebutuhan konten, bukan berdasarkan perangkat tertentu saja.

## 8. Urutan Mobile

Pada mobile, urutan yang direkomendasikan untuk hero adalah:

```text
1. Judul
2. Deskripsi
3. Tombol aksi
4. Preview atau ilustrasi
```

Pesan utama dan CTA muncul sebelum preview agar pengguna langsung memahami fungsi halaman dan dapat bertindak tanpa harus melewati mockup visual.

## 9. Kapan Menggunakan Scaling Murni

`transform: scale()` atau rumus scaling berbasis ukuran kanvas tidak menjadi pendekatan default untuk website biasa karena dapat menyebabkan:

- teks sulit terbaca,
- target sentuh terlalu kecil,
- layout tidak fleksibel,
- masalah aksesibilitas.

Scaling murni hanya dipertimbangkan untuk kanvas tetap seperti slide, game, kiosk, atau preview dengan rasio yang wajib identik.

## 10. Checklist Implementasi

Sebelum menyelesaikan section, pastikan:

- Tipografi penting memakai `clamp()` dengan min dan max.
- Padding serta gap tidak menggunakan satu ukuran besar yang kaku.
- Container memiliki `max-width`.
- Section tidak overflow pada 320px, 360px, dan 390px.
- Hero desktop dapat terlihat dalam satu viewport jika memang dipersyaratkan.
- Layout mobile memiliki urutan konten yang natural.
- Tidak ada teks atau tombol yang terpotong.
- Field form mobile memiliki tinggi sentuh sekitar 42px atau lebih jika ruang memungkinkan.
- Checkbox dan teks persetujuan memakai alignment atas agar teks multi-baris tetap rapi.
- Register mobile boleh scroll ketika jumlah field melebihi tinggi viewport.
- Breakpoint hanya mengubah struktur ketika diperlukan.
- Build frontend berhasil setelah perubahan.
