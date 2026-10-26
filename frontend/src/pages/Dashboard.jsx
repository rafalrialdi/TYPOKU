import { FiPlus, FiType, FiRefreshCw, FiGlobe, FiArrowRight, FiFileText, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import './dashboard.css';

export default function Dashboard() {
  return (
    <div>
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <span className="welcome-badge">WORKSPACE AKTIF • Semester Ganjil 2026/2027</span>
          <h1>Halo, Prima <FiStar color="#f59e0b" size={24} /></h1>
          <p>Siap memperbaiki tulisan kamu hari ini? Cek dokumen terbaru atau mulai perbaikan baru di bawah dengan mesin koreksi berbasis kaidah PUEBI terbaru.</p>
        </div>
        <button className="btn-upload">
          <FiPlus size={20} /> Upload Dokumen Baru
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Kolom Kiri: Layanan Cepat */}
        <div className="services-section">
          <h3>
            <div className="service-header-title">
              <div className="service-dot"></div>
              Pilih Layanan Cepat
            </div>
            <span className="service-engine-version">Engine Ver 3.4.1 (KBBI V)</span>
          </h3>
          
          <div className="services-cards">
            {/* Kartu Koreksi */}
            <div className="service-card">
              <div className="service-icon-wrapper icon-blue">
                <FiType />
              </div>
              <h4>Koreksi Dokumen</h4>
              <p>Periksa dokumen DOCX & PDF, temukan typo, kesalahan spasi.</p>
              <button className="service-btn">Mulai Pemeriksaan <FiArrowRight /></button>
            </div>

            {/* Kartu Parafrase */}
            <div className="service-card">
              <div className="service-icon-wrapper icon-indigo">
                <FiRefreshCw />
              </div>
              <h4>Parafrase Cerdas</h4>
              <p>Ubah struktur kalimat agar lebih lugas, formal, atau akademik.</p>
              <button className="service-btn outline">Mulai Parafrase <FiArrowRight /></button>
            </div>

            {/* Kartu Terjemah */}
            <div className="service-card">
              <div className="service-icon-wrapper icon-green">
                <FiGlobe />
              </div>
              <h4>Penerjemah ID &rarr; EN</h4>
              <p>Terjemahan dwibahasa presisi tinggi dengan konteks akademik.</p>
              <button className="service-btn outline">Mulai Terjemah <FiArrowRight /></button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Status Paket */}
        <div className="package-card">
          <div className="package-header">
            <div>
              <div className="package-subtitle">STATUS PAKET</div>
              <h3>Paket Gratis</h3>
            </div>
            <span className="badge-free">Free Tier</span>
          </div>

          <div className="package-stat-group">
            <div className="package-stat-label">
              <span>Koreksi Typo</span>
              <span><strong>2 / 3</strong> dokumen</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '66%' }}></div></div>
          </div>

          <div className="package-stat-group last">
            <div className="package-stat-label">
              <span>Penerjemah Akademik</span>
              <span><strong>4 / 5</strong> kali</span>
            </div>
            <div className="progress-bar"><div className="progress-fill red" style={{ width: '80%' }}></div></div>
          </div>

          <div className="allocation-alert">
            <div className="allocation-circle">72%</div>
            <div>
              <div className="allocation-title">Total Alokasi Terpakai</div>
              <div className="allocation-desc">Sisa kuota kamu hampir habis bulan ini.</div>
            </div>
          </div>

          <button className="btn-upgrade">
            Upgrade ke Pro (Rp29.000/bln)
          </button>
        </div>
      </div>

      {/* Tabel Aktivitas */}
      <div className="recent-activity">
        <div className="activity-header">
          <div>
            <h3 className="activity-title">Aktivitas Dokumen Terbaru</h3>
            <p className="activity-subtitle">Pantau riwayat naskah yang telah diproses secara real-time</p>
          </div>
        </div>

        <table className="table-activity">
          <thead>
            <tr>
              <th>Nama Dokumen</th>
              <th>Fitur</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div className="doc-name-cell"><FiFileText color="#4F46E5" /> Makalah_Machine_Learning.docx</div></td>
              <td><span className="feature-cell"><div className="dot-blue"></div> Koreksi Typo</span></td>
              <td><div className="date-cell">25 Sep 2026, 14:20</div></td>
              <td><span className="status-badge status-done"><FiCheckCircle /> Selesai</span></td>
              <td><button className="btn-action-primary">Lihat Hasil</button></td>
            </tr>
            <tr>
              <td><div className="doc-name-cell"><FiFileText color="#4F46E5" /> Abstrak_Skripsi_Final.docx</div></td>
              <td><span className="feature-cell"><div className="dot-orange"></div> Parafrase</span></td>
              <td><div className="date-cell">24 Sep 2026, 09:15</div></td>
              <td><span className="status-badge status-done"><FiCheckCircle /> Selesai</span></td>
              <td><button className="btn-action-primary">Buka</button></td>
            </tr>
            <tr>
              <td><div className="doc-name-cell"><FiFileText color="#ef4444" /> Tugas_Metodologi_Penelitian.pdf</div></td>
              <td><span className="feature-cell"><div className="dot-blue"></div> Koreksi Typo</span></td>
              <td><div className="date-cell">18 Sep 2026, 11:05</div></td>
              <td><span className="status-badge status-saved"><FiClock /> Tersimpan</span></td>
              <td><button className="btn-action-secondary">Lanjutkan</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}