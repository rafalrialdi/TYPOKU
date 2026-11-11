import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import './legal.css';

const SECTIONS = [
  {
    id: 'penerimaan',
    title: 'Penerimaan Ketentuan',
    body: [
      {
        type: 'p',
        text: 'Dengan mengakses atau menggunakan TypoKu, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan, mohon berhenti menggunakan layanan.',
      },
      {
        type: 'p',
        text: 'Syarat & Ketentuan ini merupakan perjanjian yang mengikat antara Anda sebagai pengguna dengan TypoKu sebagai penyedia layanan.',
      },
    ],
  },
  {
    id: 'definisi',
    title: 'Definisi Layanan',
    body: [
      {
        type: 'defs',
        items: [
          {
            term: 'TypoKu',
            desc: 'platform kecerdasan bahasa berbasis web untuk memeriksa ejaan dan typo, memparafrase, serta menerjemahkan naskah akademik.',
          },
          {
            term: 'Layanan',
            desc: 'situs, fitur pemeriksaan naskah, parafrase, terjemahan, paket langganan, dan seluruh konten yang disediakan TypoKu.',
          },
          {
            term: 'Naskah',
            desc: 'dokumen atau teks yang Anda unggah atau masukkan ke dalam Layanan untuk diproses.',
          },
          {
            term: 'Hasil',
            desc: 'keluaran yang dihasilkan Layanan, termasuk teks terkoreksi, parafrase, terjemahan, dan berkas unduhan.',
          },
        ],
      },
    ],
  },
  {
    id: 'akun',
    title: 'Akun dan Keamanan',
    body: [
      {
        type: 'p',
        text: 'Sebagian fitur memerlukan akun. Anda dapat mendaftar menggunakan email dan kata sandi atau masuk melalui akun Google.',
      },
      {
        type: 'ul',
        items: [
          'Anda wajib memberikan data yang benar, lengkap, dan mutakhir.',
          'Anda bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas yang terjadi pada akun Anda.',
          'Segera hubungi kami jika Anda mencurigai adanya akses tidak sah ke akun Anda.',
          'Satu akun hanya boleh digunakan oleh satu orang. Anda tidak diperkenankan membagikan kredensial kepada pihak lain.',
        ],
      },
    ],
  },
  {
    id: 'larangan',
    title: 'Penggunaan yang Dilarang',
    body: [
      { type: 'p', text: 'Saat menggunakan Layanan, Anda setuju untuk tidak:' },
      {
        type: 'ul',
        items: [
          'mengunggah naskah yang melanggar hak cipta, mengandung ujaran kebencian, ancaman, atau materi yang melanggar hukum;',
          'menggunakan Layanan untuk membuat atau menyebarkan karya yang menyesatkan, termasuk mengklaim hasil bantuan AI sebagai karya yang sepenuhnya ditulis manusia tanpa keterbukaan yang memadai;',
          'mencoba mengakses akun, data, atau sistem lain tanpa izin, termasuk peretasan, pengambilan data otomatis di luar batas wajar, atau tindakan yang membebani layanan secara berlebihan;',
          'merekayasa balik, menyalin, atau menjual kembali Layanan tanpa izin tertulis dari TypoKu;',
          'menggunakan Layanan untuk kegiatan yang melanggar hukum yang berlaku di Indonesia.',
        ],
      },
    ],
  },
  {
    id: 'pembayaran',
    title: 'Paket Langganan dan Pembayaran',
    body: [
      {
        type: 'ul',
        items: [
          'Layanan tersedia dalam beberapa paket dengan harga dan durasi yang tercantum pada halaman Paket.',
          'Harga dapat berubah sewaktu-waktu. Perubahan tidak berlaku surut terhadap paket yang telah dibayar.',
          'Pembayaran diproses oleh penyedia pembayaran pihak ketiga (Midtrans). TypoKu tidak menyimpan data kartu atau kredensial pembayaran Anda.',
          'Langganan aktif mulai berlaku sejak pembayaran terverifikasi dan berakhir sesuai durasi paket yang dipilih.',
          'Biaya administrasi ditambahkan pada setiap transaksi dan ditampilkan sebelum Anda menyelesaikan pembayaran.',
        ],
      },
      {
        type: 'p',
        text: 'Karena Layanan merupakan produk digital, pembayaran yang telah berhasil umumnya tidak dapat dikembalikan. Permintaan pengembalian dana dapat diajukan melalui saluran kontak resmi dan akan ditinjau secara individual.',
      },
    ],
  },
  {
    id: 'konten-pengguna',
    title: 'Konten Pengguna',
    body: [
      {
        type: 'p',
        text: 'Anda tetap memiliki seluruh hak atas naskah yang Anda unggah. TypoKu tidak mengklaim kepemilikan atas karya Anda.',
      },
      {
        type: 'p',
        text: 'Dengan menggunakan Layanan, Anda memberikan TypoKu lisensi terbatas dan non-eksklusif yang semata-mata digunakan untuk menjalankan Layanan, yaitu memproses, menyimpan sementara, dan mengirimkan naskah Anda ke penyedia model AI guna menghasilkan keluaran yang Anda minta.',
      },
      {
        type: 'ul',
        items: [
          'TypoKu tidak menggunakan naskah Anda untuk tujuan pemasaran.',
          'Anda bertanggung jawab memastikan bahwa Anda berhak mengunggah naskah tersebut dan bahwa pemrosesannya tidak melanggar hak pihak ketiga.',
          'Untuk materi yang bersifat sangat rahasia atau terikat perjanjian kerahasiaan, pertimbangkan untuk tidak mengunggahnya ke Layanan.',
        ],
      },
    ],
  },
  {
    id: 'hasil-ai',
    title: 'Hasil Pemrosesan AI',
    body: [
      {
        type: 'ul',
        items: [
          'Hasil dihasilkan oleh model kecerdasan buatan dan dapat mengandung kesalahan, termasuk pada ejaan, tata bahasa, maupun makna.',
          'Hasil bersifat saran, bukan keputusan final. Anda wajib memeriksa dan menyunting Hasil sebelum menggunakannya.',
          'TypoKu tidak bertanggung jawab atas konsekuensi akademik, profesional, atau hukum akibat penggunaan Hasil tanpa verifikasi.',
          'Hasil dapat berbeda untuk naskah yang sama karena sifat probabilistik model AI.',
        ],
      },
    ],
  },
  {
    id: 'hki',
    title: 'Hak Kekayaan Intelektual',
    body: [
      {
        type: 'p',
        text: 'Seluruh hak atas perangkat lunak, desain antarmuka, merek, logo, dan konten milik TypoKu dilindungi oleh hukum yang berlaku. Anda tidak memperoleh hak apa pun selain hak terbatas untuk menggunakan Layanan sesuai Syarat & Ketentuan ini.',
      },
    ],
  },
  {
    id: 'ketersediaan',
    title: 'Ketersediaan dan Perubahan Layanan',
    body: [
      {
        type: 'ul',
        items: [
          'Kami berupaya menjaga Layanan tetap tersedia, namun tidak menjamin akses tanpa gangguan.',
          'Pemeliharaan terjadwal, gangguan dari penyedia pihak ketiga, atau habisnya kuota layanan AI dapat menyebabkan keterbatasan sementara.',
          'Kami dapat menambah, mengubah, atau menghentikan fitur dengan pemberitahuan yang wajar.',
        ],
      },
    ],
  },
  {
    id: 'penghentian',
    title: 'Penangguhan dan Penghentian Akun',
    body: [
      {
        type: 'p',
        text: 'Kami dapat menangguhkan atau menghentikan akses Anda apabila terdapat indikasi pelanggaran Syarat & Ketentuan, penyalahgunaan Layanan, atau kewajiban hukum yang mengharuskan demikian. Anda dapat berhenti menggunakan Layanan kapan saja melalui fitur keluar (logout) pada akun Anda.',
      },
    ],
  },
  {
    id: 'tanggung-jawab',
    title: 'Batasan Tanggung Jawab',
    body: [
      {
        type: 'p',
        text: 'Sepanjang diizinkan oleh hukum, TypoKu tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial, termasuk kehilangan data, kehilangan keuntungan, atau kegagalan akademik, yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan.',
      },
      {
        type: 'p',
        text: 'Tanggung jawab TypoKu atas kerugian langsung dibatasi sebesar jumlah yang Anda bayarkan kepada TypoKu dalam dua belas bulan terakhir.',
      },
    ],
  },
  {
    id: 'perubahan',
    title: 'Perubahan Ketentuan',
    body: [
      {
        type: 'p',
        text: 'Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Versi terbaru akan dipublikasikan pada halaman ini beserta tanggal pembaruan. Penggunaan Layanan setelah pembaruan berarti Anda menyetujui ketentuan yang berlaku.',
      },
    ],
  },
  {
    id: 'hukum',
    title: 'Hukum yang Berlaku',
    body: [
      {
        type: 'p',
        text: 'Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa akan diselesaikan secara musyawarah terlebih dahulu, dan apabila tidak tercapai kesepakatan, melalui pengadilan yang berwenang di Indonesia.',
      },
    ],
  },
  {
    id: 'kontak',
    title: 'Hubungi Kami',
    body: [
      {
        type: 'linkp',
        before: 'Pertanyaan mengenai Syarat & Ketentuan ini dapat disampaikan melalui email ',
        link: {
          href: 'https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Pertanyaan%20Syarat%20dan%20Ketentuan',
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

    if (block.type === 'defs') {
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item.term}>
              <strong>{item.term}</strong> adalah {item.desc}
            </li>
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

export default function SyaratKetentuan() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-hero">
          <h1 className="legal-title">Syarat &amp; Ketentuan</h1>
          <p className="legal-subtitle">
            Aturan penggunaan layanan TypoKu, hak dan kewajiban Anda sebagai pengguna, serta
            ketentuan terkait langganan dan hasil pemrosesan naskah.
          </p>
          <p className="legal-updated">
            <FiCalendar aria-hidden="true" />
            Terakhir diperbarui: 10 November 2026
          </p>
        </header>

        <nav className="legal-toc" aria-label="Daftar isi Syarat dan Ketentuan">
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
              href="https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com&su=Pertanyaan%20Syarat%20dan%20Ketentuan"
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
          <Link className="legal-footer-link" to="/kebijakan-privasi">
            Baca Kebijakan Privasi
          </Link>
        </div>
      </div>
    </div>
  );
}
