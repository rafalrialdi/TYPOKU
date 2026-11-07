# Loading State Aksi Non-GET

Semua aksi yang mengirim atau mengubah data melalui `POST`, `PUT`, `PATCH`, atau `DELETE` wajib memiliki loading state. Request `GET` tidak perlu menonaktifkan tombol.

## Aturan

- Tombol aksi langsung dinonaktifkan ketika request dimulai.
- Tombol memakai `aria-busy="true"` selama proses berjalan.
- Teks tombol berubah menjadi indikator proses, misalnya `Menyimpan...` atau `Mengirim...`.
- Handler memiliki guard agar klik ganda tidak membuat request kedua.
- State selalu dikembalikan di `finally`, baik request berhasil maupun gagal.
- Jika satu form memiliki beberapa tombol aksi, semua tombol aksi pada form tersebut dinonaktifkan selama request.

## Hook reusable

Gunakan `useSubmit` dari `src/hooks/useSubmit.js` untuk membungkus aksi asynchronous:

```jsx
import { useSubmit } from '../hooks/useSubmit';

const { run: saveItem, loading } = useSubmit(async (payload) => {
  return createItem(payload);
});

async function handleSubmit(event) {
  event.preventDefault();
  if (loading) return;

  await saveItem(payload);
}
```

Hubungkan state ke tombol:

```jsx
<button
  type="submit"
  disabled={loading}
  aria-busy={loading}
>
  {loading ? 'Menyimpan...' : 'Simpan'}
</button>
```

`useSubmit` juga memiliki guard internal berbasis `useRef`, sehingga klik berulang tetap ditolak walaupun pembaruan state React belum selesai.

## Pengecualian GET

Aksi yang hanya mengambil data seperti memuat profil, pencarian, pagination, atau pengecekan akses `GET` tidak menggunakan loading tombol submit ini. Loading layar atau skeleton tetap boleh digunakan untuk meningkatkan pengalaman pengguna.

## Checklist

- Klik cepat berkali-kali hanya mengirim satu request.
- Tombol menjadi pudar dan tidak dapat diklik saat loading.
- Tombol kembali normal setelah berhasil.
- Tombol kembali normal setelah gagal.
- Request GET tidak menonaktifkan tombol aksi.
- Semua tombol POST/PUT/PATCH/DELETE baru mengikuti pola ini.

Loading di sisi klien bukan pengganti perlindungan server. Aksi penting seperti pembayaran dan pembuatan order tetap perlu idempotency key atau pengecekan duplikat di backend.
