import { Link } from 'react-router-dom';
import { FiClock, FiMail, FiPhone } from 'react-icons/fi';
import { FaGithub, FaInstagram, FaTiktok } from 'react-icons/fa';
import './components.css';

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/rafalsxc?dlrf=MTh1MWltOXh5MjVobQ%3D%3D&utm_source=qr',
    icon: FaInstagram,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@plumbls',
    icon: FaTiktok,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/rafalrialdi',
    icon: FaGithub,
  },
];

const produk = [
  ['Pemeriksa Ejaan PUEBI', '#'],
  ['Parafrase Cerdas', '/parafrase'],
  ['Penerjemah Akademik', '/terjemah'],
  ['Paket Langganan', '/paket'],
];

const sumberDaya = [
  ['Panduan Kaidah PUEBI', '#'],
  ['Dokumentasi API', '#'],
  ['Hubungi Tim Dukungan', '#'],
  ['Standar Sitasi Ilmiah', '#'],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <span className="footer-brand">TypoKu</span>
            <p className="footer-desc">
              Platform kecerdasan bahasa untuk standardisasi karya ilmiah, jurnal bereputasi, dan
              kepatuhan kaidah PUEBI.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Produk</h4>
            <ul className="footer-links">
              {produk.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Sumber Daya &amp; Bantuan</h4>
            <ul className="footer-links">
              {sumberDaya.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Legal &amp; Kontak</h4>
            <ul className="footer-links footer-links-contact">
              <li className="footer-contact">
                <FiMail />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=rafalrialdi1@gmail.com"
                  className="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  rafalrialdi1@gmail.com
                </a>
              </li>
              <li className="footer-contact">
                <FiPhone />
                <a href="tel:+6281234567890" className="footer-link">+62 812-3456-7890</a>
              </li>
              <li className="footer-contact">
                <FiClock />
                <span>Senin - Jumat (08.00 - 17.00 WIB)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>&copy; 2026 TypoKu. Hak Cipta Dilindungi Undang-Undang.</span>

            <div className="footer-legal">
              <Link className="footer-link" to="/kebijakan-privasi">
                Kebijakan Privasi
              </Link>
              <span className="footer-legal-sep" aria-hidden="true">
                &middot;
              </span>
              <Link className="footer-link" to="/syarat-ketentuan">
                Syarat &amp; Ketentuan
              </Link>
            </div>
          </div>

          <div className="footer-social">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="footer-social-link"
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
