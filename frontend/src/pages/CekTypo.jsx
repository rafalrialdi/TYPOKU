import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiLock,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { Toast, useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useMyAccess } from '../hooks/useMyAccess';
import { api } from '../lib/api';
import { toHumanReadableError } from '../utils/humanizeError';
import './cekTypo.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB batas maksimal
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CekTypoSkeleton() {
  return (
    <div className="cek-typo-page">
      <div className="cek-typo-container">
        <Skeleton style={{ width: '8rem', height: '1.25rem', borderRadius: '9999px', marginBottom: '0.75rem' }} />
        <Skeleton style={{ width: '22rem', height: '2.25rem', marginBottom: '0.5rem' }} />
        <Skeleton style={{ width: '36rem', height: '1.125rem', marginBottom: '2rem' }} />
        <Skeleton style={{ width: '100%', height: '16rem', borderRadius: '1rem' }} />
      </div>
    </div>
  );
}

export default function CekTypo() {
  const { user } = useAuth();
  const { data: accessData, isError: isAccessError } = useMyAccess();
  const hasAccess = Boolean(accessData?.hasAccess);

  // Hanya user login yang datanya belum pernah masuk (fetch pertama) yang
  // melihat skeleton. Tamu selalu false karena `user` bernilai null, sehingga
  // langsung melihat kartu "fitur terkunci" tanpa kedipan loading.
  const isAccessLoading = Boolean(user) && accessData === undefined && !isAccessError;

  const { toast, showToast } = useToast();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('file'); // 'file' atau 'text'
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isOverSize, setIsOverSize] = useState(false);
  const [fileError, setFileError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  function validateAndSetFile(selectedFile) {
    if (!selectedFile) return;

    setBackendError('');
    const filename = (selectedFile.name || '').toLowerCase();
    const isValidFormat = ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext));

    if (!isValidFormat) {
      const err = 'Format file tidak didukung. Harap pilih berkas PDF, DOCX, atau TXT.';
      setFileError(err);
      showToast(err);
      return;
    }

    // File tetap disimpan dan ditampilkan di preview
    setFile(selectedFile);

    // Validasi ukuran 5MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setIsOverSize(true);
      const overMsg = 'Ukuran file melebihi batas maksimal 5 MB.';
      setFileError(overMsg);
      showToast(overMsg);
    } else {
      setIsOverSize(false);
      setFileError('');
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    validateAndSetFile(selected);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    const droppedFile = event.dataTransfer?.files?.[0];
    validateAndSetFile(droppedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function handleClearFile() {
    setFile(null);
    setIsOverSize(false);
    setFileError('');
    setBackendError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleProcess() {
    if (loading) return;
    setBackendError('');

    if (mode === 'file') {
      if (!file) {
        showToast('Silakan pilih berkas terlebih dahulu.');
        return;
      }

      // Validasi ketat frontend: tombol tidak bisa memproses jika > 5MB
      if (isOverSize || file.size > MAX_FILE_SIZE) {
        const overMsg = 'Ukuran file melebihi batas maksimal 5 MB.';
        showToast(overMsg);
        setFileError(overMsg);
        return;
      }
    } else {
      if (!textInput.trim()) {
        showToast('Silakan masukkan teks yang ingin diperiksa.');
        return;
      }
    }

    setLoading(true);

    try {
      let response;

      if (mode === 'file') {
        const formData = new FormData();
        formData.append('file', file);

        response = await api('/api/cek-typo', {
          method: 'POST',
          body: formData,
          auth: true,
        });
      } else {
        response = await api('/api/cek-typo', {
          method: 'POST',
          body: {
            text: textInput.trim(),
            filename: 'teks_pemeriksaan.txt',
          },
          auth: true,
        });
      }

      setResult(response);
    } catch (err) {
      // Detail teknis hanya untuk console; UI menampilkan pesan yang ramah pengguna.
      console.error('Cek typo error:', err);
      setBackendError(toHumanReadableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyResult() {
    if (!result?.clean_result_text) return;
    try {
      await navigator.clipboard.writeText(result.clean_result_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin naskah.');
    }
  }

  function handleResetWorkspace() {
    setResult(null);
    handleClearFile();
    setTextInput('');
    setBackendError('');
  }

  // Diletakkan setelah seluruh hook dideklarasikan agar urutan hook stabil.
  if (isAccessLoading) {
    return <CekTypoSkeleton />;
  }

  return (
    <div className="cek-typo-page">
      <div className="cek-typo-container">
        {/* Page Header */}
        <div className="cek-typo-header">
          <h1 className="cek-typo-title">Koreksi Typo &amp; Ejaan Bahasa Indonesia</h1>
          <p className="cek-typo-subtitle">
            Pindai kesalahan penulisan, huruf kapital, partikel, tanda baca, dan kata baku secara
            otomatis sesuai standar PUEBI &amp; KBBI tanpa mengubah konteks penelitian Anda.
          </p>
        </div>

        {/* Backend Error Alert Banner */}
        {backendError ? (
          <div className="cek-typo-alert cek-typo-alert--error" role="alert">
            <div className="cek-typo-alert-content">
              <FiAlertCircle aria-hidden="true" />
              <div>
                <strong>Pemeriksaan Gagal:</strong> {backendError}
              </div>
            </div>
            <button
              className="cek-typo-alert-close"
              type="button"
              onClick={() => setBackendError('')}
              aria-label="Tutup pesan error"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {/* Jika belum memiliki langganan aktif: Tampilkan Lock Banner */}
        {!hasAccess ? (
          <div className="cek-typo-locked-card">
            <div className="cek-typo-locked-info">
              <span className="cek-typo-locked-badge">
                <FiLock aria-hidden="true" />
                Fitur terkunci
              </span>
              <h2 className="cek-typo-locked-title">
                Buka pemeriksaan typo untuk naskah ilmiah Anda
              </h2>
              <p className="cek-typo-locked-desc">
                Layanan koreksi naskah ilmiah berbasis AI terstandarisasi hanya tersedia untuk
                pengguna dengan paket langganan aktif. Pilih paket untuk membuka akses penuh.
              </p>
              <ul className="cek-typo-locked-features">
                <li>
                  <FiCheck aria-hidden="true" />
                  Ejaan &amp; kata baku sesuai PUEBI dan KBBI
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Huruf kapital, partikel, dan tanda baca
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Konteks penelitian tetap terjaga
                </li>
              </ul>
              <Link className="cek-typo-btn cek-typo-btn-primary cek-typo-locked-cta" to="/paket">
                Lihat Pilihan Paket
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="cek-typo-locked-visual" aria-hidden="true">
              <div className="cek-typo-locked-preview">
                <div className="cek-typo-locked-preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="cek-typo-locked-preview-text">
                  <span className="cek-typo-locked-line">
                    <span className="cek-typo-locked-seg" style={{ width: '34%' }} />
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--red" style={{ width: '16%' }} />
                    <span className="cek-typo-locked-seg" style={{ width: '22%' }} />
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--yellow" style={{ width: '12%' }} />
                  </span>
                  <span className="cek-typo-locked-line">
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--yellow" style={{ width: '20%' }} />
                    <span className="cek-typo-locked-seg" style={{ width: '26%' }} />
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--red" style={{ width: '14%' }} />
                    <span className="cek-typo-locked-seg" style={{ width: '18%' }} />
                  </span>
                  <span className="cek-typo-locked-line">
                    <span className="cek-typo-locked-seg" style={{ width: '28%' }} />
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--red" style={{ width: '10%' }} />
                    <span className="cek-typo-locked-seg" style={{ width: '32%' }} />
                  </span>
                </div>
              </div>
              <span className="cek-typo-locked-overlay">
                <FiLock aria-hidden="true" />
              </span>
            </div>
          </div>
        ) : result ? (
          /* ================================================================
             RESULTS WORKSPACE: KOMPARASI 2 KOLOM
             ================================================================ */
          <div className="cek-typo-results">
            <div className="cek-typo-results-head">
              <div className="cek-typo-results-title-group">
                <h2 className="cek-typo-results-title">Komparasi Naskah &amp; Hasil Koreksi</h2>
                <span
                  className={`cek-typo-error-count-badge${result.total_errors === 0 ? ' cek-typo-error-count-badge--clean' : ''}`}
                >
                  <FiCheckCircle aria-hidden="true" />
                  {result.total_errors > 0
                    ? `${result.total_errors} Kesalahan Ditemukan`
                    : 'Naskah Bersih (0 Typo)'}
                </span>
              </div>

              <div className="cek-typo-results-actions">
                <button
                  className="cek-typo-btn cek-typo-btn-secondary"
                  type="button"
                  onClick={handleCopyResult}
                  title="Salin hasil perbaikan"
                >
                  {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                  {copied ? 'Tersalin!' : 'Salin Semua'}
                </button>

                {result.download_pdf ? (
                  <a
                    className="cek-typo-btn cek-typo-btn-primary"
                    href={result.download_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <FiDownload aria-hidden="true" />
                    Unduh PDF
                  </a>
                ) : null}

                {result.download_txt ? (
                  <a
                    className="cek-typo-btn cek-typo-btn-secondary"
                    href={result.download_txt}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <FiDownload aria-hidden="true" />
                    Unduh TXT
                  </a>
                ) : null}

                <button
                  className="cek-typo-btn cek-typo-btn-secondary"
                  type="button"
                  onClick={handleResetWorkspace}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Periksa Berkas Baru
                </button>
              </div>
            </div>

            {/* Split Comparison Columns */}
            <div className="cek-typo-split">
              {/* Kolom Kiri: Teks Asli */}
              <div className="cek-typo-column">
                <div className="cek-typo-column-head">
                  <span className="cek-typo-column-title">Naskah Asli</span>
                  <span className="cek-typo-badge" style={{ margin: 0 }}>
                    {result.filename || 'Naskah Input'}
                  </span>
                </div>
                <div
                  className="cek-typo-column-body"
                  dangerouslySetInnerHTML={{
                    __html: result.original_text_html || result.original_text || result.original_text_raw,
                  }}
                />
                <div className="cek-typo-column-legend">
                  <span className="cek-typo-legend-dot cek-typo-legend-dot--red" aria-hidden="true" />
                  <span>Merah coret: Kata / ejaan yang salah</span>
                </div>
              </div>

              {/* Kolom Kanan: Teks Hasil Perbaikan */}
              <div className="cek-typo-column">
                <div className="cek-typo-column-head">
                  <span className="cek-typo-column-title cek-typo-column-title--primary">
                    Teks Hasil Perbaikan
                  </span>
                  <span className="cek-typo-badge" style={{ margin: 0, backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    Standar PUEBI / KBBI
                  </span>
                </div>
                <div
                  className="cek-typo-column-body"
                  dangerouslySetInnerHTML={{
                    __html: result.result_text || result.clean_result_text,
                  }}
                />
                <div className="cek-typo-column-legend">
                  <span className="cek-typo-legend-dot cek-typo-legend-dot--yellow" aria-hidden="true" />
                  <span>Kuning: Kata baku hasil perbaikan</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================
             INPUT ZONE: UNGGAH DOKUMEN / KETIK TEKS
             ================================================================ */
          <div>
            {/* Mode Tabs */}
            <div className="cek-typo-tabs" role="tablist">
              <button
                className={`cek-typo-tab${mode === 'file' ? ' cek-typo-tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={mode === 'file'}
                onClick={() => setMode('file')}
                disabled={loading}
              >
                <FiFileText aria-hidden="true" />
                Unggah Dokumen (PDF / DOCX / TXT)
              </button>
              <button
                className={`cek-typo-tab${mode === 'text' ? ' cek-typo-tab--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={mode === 'text'}
                onClick={() => setMode('text')}
                disabled={loading}
              >
                <FiEdit3 aria-hidden="true" />
                Ketik / Tempel Teks Langsung
              </button>
            </div>

            {mode === 'file' ? (
              <div>
                {/* Drag and Drop Zone */}
                {!file ? (
                  <div
                    className={`cek-typo-dropzone${isDragOver ? ' cek-typo-dropzone--dragover' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      ref={fileInputRef}
                      className="cek-typo-dropzone-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      aria-label="Pilih berkas dokumen PDF, DOCX, atau TXT"
                    />
                    <div className="cek-typo-dropzone-icon" aria-hidden="true">
                      <FiUploadCloud />
                    </div>
                    <p className="cek-typo-dropzone-title">
                      Tarik &amp; lepas berkas naskah di sini, atau klik untuk memilih file
                    </p>
                    <p className="cek-typo-dropzone-hint">
                      Maksimal ukuran berkas <strong>5 MB</strong>. Format didukung:{' '}
                      <strong>.pdf, .docx, .txt</strong>
                    </p>
                  </div>
                ) : (
                  /* Preview Card saat file terpilih (tetap muncul meski melebihi 5MB) */
                  <div className="cek-typo-file-card">
                    <div className="cek-typo-file-info">
                      <div
                        className={`cek-typo-file-icon${isOverSize ? ' cek-typo-file-icon--error' : ''}`}
                        aria-hidden="true"
                      >
                        <FiFileText />
                      </div>
                      <div className="cek-typo-file-details">
                        <div className="cek-typo-file-name-row">
                          <span className="cek-typo-file-name" title={file.name}>
                            {file.name}
                          </span>
                          {isOverSize ? (
                            <span className="cek-typo-file-status-badge cek-typo-file-status-badge--error">
                              <FiAlertCircle aria-hidden="true" />
                              Melebihi 5 MB
                            </span>
                          ) : (
                            <span className="cek-typo-file-status-badge cek-typo-file-status-badge--ready">
                              <FiCheckCircle aria-hidden="true" />
                              Siap Diperiksa
                            </span>
                          )}
                        </div>
                        <p className="cek-typo-file-meta">
                          Ukuran: <strong>{formatBytes(file.size)}</strong>
                          {isOverSize ? (
                            <span className="cek-typo-file-error-text">
                              {' '}
                              — Melebihi batas maksimal 5 MB. Tombol dinonaktifkan.
                            </span>
                          ) : (
                            ' • Dokumen Teks Akademik'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="cek-typo-file-actions">
                      <button
                        className="cek-typo-btn cek-typo-btn-secondary"
                        type="button"
                        onClick={handleClearFile}
                        disabled={loading}
                      >
                        <FiTrash2 aria-hidden="true" />
                        Ganti Berkas
                      </button>

                      <button
                        className="cek-typo-btn cek-typo-btn-primary"
                        type="button"
                        onClick={handleProcess}
                        disabled={isOverSize || loading}
                        aria-busy={loading}
                        title={isOverSize ? 'Ukuran berkas melebihi batas 5 MB' : 'Periksa kesalahan naskah'}
                      >
                        {loading ? (
                          <>
                            <FiRefreshCw className="animate-spin" aria-hidden="true" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <FiCheck aria-hidden="true" />
                            Cek Typo Sekarang
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode Ketik / Tempel Teks */
              <div className="cek-typo-text-card">
                <textarea
                  className="cek-typo-textarea"
                  placeholder="Tempelkan atau ketik naskah skripsi, jurnal, atau karya ilmiah Anda di sini..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={loading}
                  rows={8}
                />
                <div className="cek-typo-text-footer">
                  <span className="cek-typo-text-count">
                    {`${textInput.trim() ? textInput.trim().split(/\s+/).length : 0} kata / ${textInput.length} karakter`}
                  </span>
                  <button
                    className="cek-typo-btn cek-typo-btn-primary"
                    type="button"
                    onClick={handleProcess}
                    disabled={loading || !textInput.trim()}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin" aria-hidden="true" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FiCheck aria-hidden="true" />
                        Cek Typo Teks Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading Processing State */}
            {loading ? (
              <div className="cek-typo-loading-card">
                <div className="cek-typo-spinner" aria-hidden="true" />
                <h3 className="cek-typo-loading-title">AI Sedang Memeriksa Naskah</h3>
                <p className="cek-typo-loading-text">
                  Membandingkan susunan kalimat dengan kaidah PUEBI edisi terbaru dan entri leksikal KBBI...
                  Mohon jangan menutup halaman ini.
                </p>
              </div>
            ) : null}

            {/* Pedoman Singkat Ejaan */}
            <div className="cek-typo-guideline">
              <strong>Pedoman Tata Ejaan PUEBI &amp; KBBI TypoKu:</strong> Sistem secara otomatis
              memeriksa kesalahan penulisan kata depan (di/ke), partikel (pun/kah), imbuhan gabung,
              huruf kapital pada nama geografis/gelar, pemakaian tanda baca koma dan hubung, serta
              kosakata baku bahasa Indonesia ilmiah.
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifikasi Global */}
      <Toast toast={toast} />
    </div>
  );
}
