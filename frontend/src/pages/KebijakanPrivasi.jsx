import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import './legal.css';

const SECTIONS = [
  {
    id: 'pendahuluan',
    title: 'Pendahuluan',
    body: [
      {
        type: 'p',
        text: 'Kebijakan Privasi ini menjelaskan bagaimana TypoKu mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda ketika Anda menggunakan Layanan.',
      },
      {
        type: 'p',
        text: 'Dengan menggunakan Layanan, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini. Jika Anda tidak menyetujuinya, mohon berhenti menggunakan Layanan.',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data yang Kami Kumpulkan',
    body: [
      {
        type: 'ul',
        items: [
          'Data akun: nama, alamat email, nomor telepon (opsional), dan ID akun Google (google_id) apabila Anda masuk melalui Google.',
          'Data autentikasi: kata sandi yang disimpan dalam bentuk hash menggunakan bcrypt, bukan teks asli. TypoKu tidak pernah dapat membaca kata sandi Anda.',
          'Data naskah: teks atau berkas PDF, DOCX, dan TXT berukuran maksimal 5 MB yang Anda unggah untuk diperiksa, diparafrase, atau diterjemahkan.',
          'Data transaksi: paket yang dibeli, kode pesanan, jumlah pembayaran, dan status pembayaran. Rincian instrumen pembayaran dikelola sepenuhnya oleh Midtrans.',
          'Data teknis: informasi yang diperlukan untuk menjalankan dan mengamankan Layanan, seperti waktu permintaan dan status kesalahan.',
        ],
      },
    ],
  },
  {
    id: 'penggunaan',
    title: 'Cara Kami Menggunakan Data',
    body: [
      {
        type: 'ul',
        items: [
          'Menyediakan dan menjalankan fitur Layanan, termasuk memproses naskah Anda.',
          'Mengelola akun, autentikasi, dan sesi masuk.',
          'Memproses pembayaran dan mengaktifkan langganan.',
          'Mengirim email terkait akun, misalnya tautan reset kata sandi.',
          'Menjaga keamanan, mencegah penyalahgunaan, dan memenuhi kewajiban hukum.',
        ],
      },
    ],
  },
  {
    id: 'dasar-hukum',
    title: 'Dasar Hukum Pemrosesan',
    body: [
      {
        type: 'p',
        text: 'Kami memproses data pribadi berdasarkan persetujuan Anda, pelaksanaan perjanjian layanan, pemenuhan kewajiban hukum, dan kepentingan yang sah, sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
      },
    ],
  },
  {
    id: 'pihak-ketiga',
    title: 'Berbagi Data dengan Pihak Ketiga',
    body: [
      {
        type: 'ul',
        items: [
          'Google: untuk autentikasi masuk melalui Google Identity Services dan untuk pemrosesan naskah melalui Google Gemini API.',
          'Midtrans: untuk memproses pembayaran dan memverifikasi status transaksi.',
          'Penyedia hosting dan basis data: untuk menjalankan server serta menyimpan data secara aman.',
          'Penyedia layanan email: untuk mengirim email transaksional seperti tautan reset kata sandi.',
        ],
      },
      {
        type: 'p',
        text: 'Kami tidak menjual data pribadi Anda. Data hanya dibagikan sebatas yang diperlukan untuk menjalankan Layanan atau memenuhi kewajiban hukum.',
      },
    ],
  },
  {
    id: 'data-google',
    title: 'Data Pengguna Google',
    body: [
      {
        type: 'p',
        text: 'Bagian ini menjelaskan secara khusus bagaimana TypoKu memperlakukan data yang diperoleh melalui layanan Google, baik untuk masuk ke aplikasi maupun untuk memproses naskah.',
      },
      {
        type: 'ul',
        items: [
          'Data yang kami terima dari Sign in with Google: nama tampilan, alamat email, dan ID akun Google (sub). Foto profil tidak disimpan.',
          'Data tersebut digunakan semata-mata untuk membuat atau mengautentikasi akun Anda dan menampilkan profil dasar di aplikasi.',
          'Naskah yang Anda kirim untuk diperiksa, diparafrase, atau diterjemahkan diproses melalui Google Gemini API hanya untuk menghasilkan keluaran yang Anda minta. Naskah tidak kami gunakan untuk melatih model.',
          'Kami tidak menggunakan data pengguna Google untuk keperluan periklanan, tidak menjualnya, dan tidak mentransferkannya kepada pihak ketiga selain yang dijelaskan pada bagian Berbagi Data dengan Pihak Ketiga.',
          'Kami tidak menggunakan data pengguna Google untuk menentukan kelayakan kredit, pinjaman, atau tujuan penetapan profil komersial lainnya.',
        ],
      },
      {
        type: 'p',
        text: 'Penggunaan TypoKu atas informasi yang diterima dari Google API mematuhi Google API Services User Data Policy, termasuk persyaratan Limited Use.',
      },
      {
        type: 'linkp',
        before: 'Anda dapat mencabut akses TypoKu kapan saja melalui halaman izin akun Google di ',
        link: {
          href: 'https://myaccount.google.com/permissions',
          label: 'myaccount.google.com/permissions',
        },
        after: ', atau dengan keluar dari aplikasi.',
      },
    ],
  },
  {
    id: 'retensi',
    title: 'Penyimpanan dan Retensi',
    body: [
      {
        type: 'ul',
        items: [
          'Data akun dan riwayat transaksi disimpan selama akun aktif atau selama diperlukan untuk memenuhi kewajiban hukum dan akuntansi.',
          'Token masuk (JWT) berlaku selama 7 hari sejak diterbitkan, setelah itu Anda perlu masuk kembali.',
          'Token reset kata sandi berlaku 60 menit dan disimpan dalam bentuk hash.',
          'Naskah diproses di memori server dan tidak disimpan secara permanen. Berkas hasil unduhan disimpan sementara di memori server selama maksimal 60 menit, lalu dihapus otomatis.',
        ],
      },
    ],
  },
  {
    id: 'keamanan',
    title: 'Keamanan Data',
    body: [
      {
        type: 'ul',
        items: [
          'Kata sandi di-hash dengan bcrypt dan tidak pernah disimpan dalam bentuk teks asli.',
          'Autentikasi menggunakan token JWT yang ditandatangani di sisi server.',
          'Komunikasi dengan server menggunakan HTTPS pada lingkungan produksi.',
          'Akses ke basis data dibatasi dan menggunakan koneksi terenkripsi TLS.',
        ],
      },
      {
        type: 'p',
        text: 'Meskipun kami menerapkan langkah pengamanan yang wajar, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya bebas risiko. Anda tetap bertanggung jawab menjaga kerahasiaan kredensial akun Anda.',
      },
    ],
  },
  {
    id: 'hak',
    title: 'Hak Anda',
    body: [
      {
        type: 'ul',
        items: [
          'Mengakses dan memperoleh salinan data pribadi yang kami simpan tentang Anda.',
          'Memperbaiki data yang tidak akurat atau tidak lengkap.',
          'Meminta penghapusan data pribadi, dengan memperhatikan kewajiban hukum yang masih berlaku.',
          'Menarik persetujuan atas pemrosesan tertentu.',
          'Mengajukan keberatan atas pemrosesan data dalam keadaan tertentu.',
        ],
      },
      {
        type: 'linkp',
        before: 'Untuk menggunakan hak-hak tersebut, hubungi kami melalui ',
        link: {
          href: 'https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Permintaan%20Hak%20Data%20Pribadi',
          label: 'rafalrialdi1@gmail.com',
        },
        after: '. Kami akan memverifikasi identitas Anda sebelum memproses permintaan.',
      },
      {
        type: 'linkp',
        before: 'Untuk menghapus akun beserta data pribadi Anda, kirim permintaan ke ',
        link: {
          href: 'https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Permintaan%20Penghapusan%20Akun',
          label: 'rafalrialdi1@gmail.com',
        },
        after: '. Permintaan diproses paling lambat 30 hari kerja, dengan tetap memperhatikan kewajiban penyimpanan data transaksi menurut hukum yang berlaku.',
      },
    ],
  },
  {
    id: 'penyimpanan-lokal',
    title: 'Cookie dan Penyimpanan Lokal',
    body: [
      {
        type: 'p',
        text: 'TypoKu tidak menggunakan cookie untuk menyimpan sesi autentikasi. Sebagai gantinya, token disimpan di localStorage atau sessionStorage peramban Anda, tergantung pilihan "Ingat saya" saat masuk.',
      },
      {
        type: 'ul',
        items: [
          'localStorage dan sessionStorage menyimpan token, data profil dasar, serta preferensi sesi.',
          'Cache data aplikasi hanya menyimpan daftar paket dan konfigurasi pembayaran untuk mempercepat pemuatan halaman.',
          'Seluruh data lokal tersebut dihapus ketika Anda keluar (logout) atau ketika server menolak token Anda.',
        ],
      },
      {
        type: 'p',
        text: 'Anda dapat menghapus data ini kapan saja melalui pengaturan peramban, namun hal tersebut akan mengakhiri sesi Anda.',
      },
    ],
  },
  {
    id: 'anak',
    title: 'Data Anak',
    body: [
      {
        type: 'p',
        text: 'Layanan ini ditujukan untuk pengguna berusia 17 tahun atau lebih. Kami tidak dengan sengaja mengumpulkan data pribadi anak di bawah usia tersebut. Apabila Anda mengetahui adanya data anak yang kami simpan, hubungi kami agar dapat kami hapus.',
      },
    ],
  },
  {
    id: 'perubahan',
    title: 'Perubahan Kebijakan',
    body: [
      {
        type: 'p',
        text: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru akan dipublikasikan pada halaman ini beserta tanggal pembaruan. Perubahan material akan diberitahukan melalui saluran yang wajar.',
      },
    ],
  },
  {
    id: 'kontak',
    title: 'Hubungi Kami',
    body: [
      {
        type: 'linkp',
        before: 'Pertanyaan, permintaan akses, atau keluhan terkait data pribadi dapat disampaikan melalui email ',
        link: {
          href: 'https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Pertanyaan%20Data%20Pribadi',
          label: 'rafalrialdi1@gmail.com',
        },
        after: '.',
      },
    ],
  },
];

function SectionBody({ body }) {
  return body.map((block, index) => {
    if (block.type === 'ul') {
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    if (block.type === 'linkp') {
      const isExternal = /^https?:\/\//.test(block.link.href);

      return (
        <p key={index}>
          {block.before}
          <a
            href={block.link.href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {block.link.label}
          </a>
          {block.after}
        </p>
      );
    }

    return <p key={index}>{block.text}</p>;
  });
}

export default function KebijakanPrivasi() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-hero">
          <h1 className="legal-title">Kebijakan Privasi</h1>
          <p className="legal-subtitle">
            Penjelasan mengenai data pribadi yang kami kumpulkan, cara penggunaannya, pihak ketiga
            yang terlibat, serta hak Anda atas data tersebut.
          </p>
          <p className="legal-updated">
            <FiCalendar aria-hidden="true" />
            Terakhir diperbarui: 10 November 2026
          </p>
        </header>

        <nav className="legal-toc" aria-label="Daftar isi Kebijakan Privasi">
          <h2 className="legal-toc-title">Daftar Isi</h2>
          <ol className="legal-toc-list">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a className="legal-toc-link" href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main>
          {SECTIONS.map((section, index) => (
            <section className="legal-section" id={section.id} key={section.id}>
              <h2 className="legal-section-title">
                <span className="legal-section-num">{index + 1}.</span>
                {section.title}
              </h2>
              <SectionBody body={section.body} />
            </section>
          ))}
        </main>

        <div className="legal-contact">
          <h2 className="legal-contact-title">Masih ada pertanyaan?</h2>
          <p>
            Hubungi kami di{' '}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Pertanyaan%20Kebijakan%20Privasi"
              target="_blank"
              rel="noopener noreferrer"
            >
              rafalrialdi1@gmail.com
            </a>
            . Kami akan merespons pada hari kerja, Senin sampai Jumat, pukul 08.00&ndash;17.00 WIB.
          </p>
        </div>

        <div className="legal-footer-nav">
          <Link className="legal-footer-link" to="/">
            <FiArrowLeft aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <Link className="legal-footer-link" to="/syarat-ketentuan">
            Baca Syarat &amp; Ketentuan
          </Link>
        </div>
      </div>
    </div>
  );
}
