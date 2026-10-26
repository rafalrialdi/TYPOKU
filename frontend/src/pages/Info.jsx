import { useLocation, Link } from 'react-router-dom';
import { FiMail, FiMapPin } from 'react-icons/fi';
import './style.css';

export default function Info() {
  const location = useLocation();
  const path = location.pathname;

  let title = "";
  let content = null;

  if (path === '/tentang') {
    title = "Hubungi Kami";
    content = (
      <>
        <p className="info-desc">
          Jika Anda memiliki pertanyaan mengenai penggunaan TypoKu, kerjasama kampus, 
          atau kendala teknis, silakan hubungi kami melalui formulir atau saluran berikut:
        </p>
        
        <div className="contact-grid">
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon"><FiMail /></div>
              <span>halo@typoku.id</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><FiMapPin /></div>
              <span>Universitas Pamulang (UNPAM), Tangerang Selatan, Banten.</span>
            </div>
          </div>
          
          <div className="contact-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Nama Lengkap" className="info-input" />
              <input type="email" placeholder="Alamat Email" className="info-input" />
              <textarea placeholder="Pesan atau Pertanyaan" className="info-textarea" rows="4"></textarea>
              <button type="submit" className="btn-info-submit">Kirim Pesan</button>
            </form>
          </div>
        </div>
      </>
    );
  } else if (path === '/bantuan') {
    title = "Pusat Bantuan";
    content = (
      <>
        <p className="info-desc">Butuh bantuan dalam menggunakan TypoKu? Tim dukungan kami siap membantu Anda 24/7.</p>
        <h3 className="info-subtitle">Kendala Umum:</h3>
        <ul className="info-list">
          <li><strong>Gagal Unggah Dokumen:</strong> Pastikan format dokumen Anda adalah .DOCX atau .PDF dengan ukuran maksimal 10MB.</li>
          <li><strong>Kuota Tidak Bertambah:</strong> Jika Anda baru saja melakukan pembayaran berlangganan, harap muat ulang (refresh) halaman dashboard dalam 1-2 menit.</li>
          <li><strong>Hasil Parafrase Kurang Pas:</strong> Cobalah memecah kalimat yang sangat panjang menjadi dua kalimat yang lebih pendek sebelum memparafrasenya.</li>
        </ul>
      </>
    );
  } else if (path === '/privasi') {
    title = "Kebijakan Privasi";
    content = (
      <>
        <p className="info-desc">Privasi dan keamanan dokumen Anda adalah prioritas utama kami. Dokumen yang Anda unggah ke server TypoKu dienkripsi menggunakan standar AES-256 bit.</p>
        <p className="info-desc">Sistem AI kami membaca dokumen Anda hanya selama proses perbaikan berlangsung. Kami <strong>tidak pernah</strong> menyimpan secara permanen, mendistribusikan, atau menggunakan naskah akademik Anda untuk melatih model AI publik tanpa izin eksplisit dari Anda.</p>
      </>
    );
  } else if (path === '/syarat') {
    title = "Syarat & Ketentuan";
    content = (
      <>
        <p className="info-desc">Dengan menggunakan layanan TypoKu, Anda menyetujui persyaratan berikut:</p>
        <ol className="info-list">
          <li>Layanan TypoKu beroperasi sebagai alat bantu (asisten), pengguna tetap bertanggung jawab penuh atas validitas dan orisinalitas isi naskah akademik mereka.</li>
          <li>Biaya berlangganan paket Pro dan Premium tidak dapat dikembalikan (non-refundable) apabila masa aktif paket sudah berjalan lebih dari 2x24 jam.</li>
          <li>Pengguna dilarang menggunakan TypoKu untuk memproses dokumen yang mengandung ujaran kebencian, materi ilegal, atau melanggar hak cipta pihak lain.</li>
        </ol>
      </>
    );
  }

  return (
    <div className="home-container info-page-wrapper">
      <div className="info-layout">
        
        {/* Sidebar Navigasi Kiri */}
        <aside className="info-sidebar">
          <h3 className="info-sidebar-title">DUKUNGAN</h3>
          <nav className="info-nav">
            <Link to="/tentang" className={`info-link ${path === '/tentang' ? 'active' : ''}`}>Kontak & Tentang</Link>
            <Link to="/bantuan" className={`info-link ${path === '/bantuan' ? 'active' : ''}`}>Pusat Bantuan</Link>
            <Link to="/syarat" className={`info-link ${path === '/syarat' ? 'active' : ''}`}>Syarat & Ketentuan</Link>
            <Link to="/privasi" className={`info-link ${path === '/privasi' ? 'active' : ''}`}>Kebijakan Privasi</Link>
          </nav>
        </aside>

        {/* Area Konten Utama Kanan */}
        <main className="info-main-content">
          <div className="info-header">
            <span className="info-accent-line"></span>
            <h2>{title}</h2>
          </div>
          <div className="info-body">
            {content}
          </div>
        </main>

      </div>
    </div>
  );
}