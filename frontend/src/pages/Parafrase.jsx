import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiClipboard,
  FiCopy,
  FiEdit3,
  FiFileText,
  FiLock,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { Toast, useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useMyAccess } from '../hooks/useMyAccess';
import { api } from '../lib/api';
import { toHumanReadableError } from '../utils/humanizeError';
import './cekTypo.css';
import './parafrase.css';

const STYLE_OPTIONS = [
  { value: 'akademik', label: 'Akademik (Formal)' },
  { value: 'lugas', label: 'Ringkas & Lugas' },
  { value: 'ekspansif', label: 'Ekspansif' },
];

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ParafraseSkeleton() {
  return (
    <div className="parafrase-page">
      <div className="parafrase-container">
        <Skeleton style={{ width: '18rem', height: '2.5rem', marginBottom: '0.5rem' }} />
        <Skeleton style={{ width: '34rem', maxWidth: '100%', height: '1.125rem', marginBottom: '2rem' }} />
        <div className="parafrase-skeleton-grid">
          <Skeleton style={{ width: '100%', height: '30rem', borderRadius: '1rem' }} />
          <Skeleton style={{ width: '100%', height: '30rem', borderRadius: '1rem' }} />
        </div>
      </div>
    </div>
  );
}

export default function Parafrase() {
  const { user } = useAuth();
  const { data: accessData, isError: isAccessError } = useMyAccess();
  const hasAccess = Boolean(accessData?.hasAccess);

  // Hanya user login yang datanya belum pernah masuk (fetch pertama) yang
  // melihat skeleton. Tamu selalu false karena `user` bernilai null, sehingga
  // langsung melihat kartu "fitur terkunci" tanpa kedipan loading.
  const isAccessLoading = Boolean(user) && accessData === undefined && !isAccessError;

  const { toast, showToast } = useToast();

  const [text, setText] = useState('');
  const [style, setStyle] = useState('akademik');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = countWords(text);
  const charCount = text.length;
  const activeStyle = STYLE_OPTIONS.find((option) => option.value === style) || STYLE_OPTIONS[0];
  const resultText = result ? result.clean_result_text || stripHtml(result.result_text) : '';
  const resultWordCount = countWords(resultText);
  const resultCharCount = resultText.length;

  function handleStyleChange(nextStyle) {
    if (loading || nextStyle === style) return;
    setStyle(nextStyle);
    setResult(null);
    setError('');
  }

  function handleTextChange(event) {
    setText(event.target.value);
    if (result) setResult(null);
  }

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        showToast('Clipboard tidak berisi teks.');
        return;
      }
      setText(clipboardText);
      setResult(null);
      setError('');
    } catch {
      showToast('Tidak dapat membaca clipboard. Tempel teks secara manual.');
    }
  }

  function handleClear() {
    setText('');
    setResult(null);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (!text.trim()) {
      showToast('Silakan masukkan teks yang ingin diparafrase.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api('/api/cek-typo/parafrase', {
        method: 'POST',
        body: { text: text.trim(), style },
        auth: true,
      });

      setResult(response);
    } catch (err) {
      console.error('Parafrase error:', err);
      setError(toHumanReadableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyResult() {
    if (!result) return;

    const copySource = result.clean_result_text || stripHtml(result.result_text);
    if (!copySource) return;

    try {
      await navigator.clipboard.writeText(copySource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin hasil parafrase.');
    }
  }

  // Diletakkan setelah seluruh hook dideklarasikan agar urutan hook stabil.
  if (isAccessLoading) {
    return <ParafraseSkeleton />;
  }

  return (
    <div className="parafrase-page">
      <div className="parafrase-container">
        <header className="parafrase-header">
          <h1 className="parafrase-title">Parafrase Cerdas Akademik</h1>
          <p className="parafrase-subtitle">
            Tulis ulang kalimat ilmiah dengan beragam gaya bahasa untuk memperkaya variasi kosakata
            dan menurunkan indikasi plagiarisme.
          </p>
        </header>

        {error ? (
          <div className="cek-typo-alert cek-typo-alert--error" role="alert">
            <div className="cek-typo-alert-content">
              <FiAlertCircle aria-hidden="true" />
              <div>
                <strong>Parafrase Gagal:</strong> {error}
              </div>
            </div>
            <button
              className="cek-typo-alert-close"
              type="button"
              onClick={() => setError('')}
              aria-label="Tutup pesan error"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {!hasAccess ? (
          <div className="cek-typo-locked-card">
            <div className="cek-typo-locked-info">
              <span className="cek-typo-locked-badge">
                <FiLock aria-hidden="true" />
                Fitur terkunci
              </span>
              <h2 className="cek-typo-locked-title">
                Buka parafrase untuk naskah ilmiah Anda
              </h2>
              <p className="cek-typo-locked-desc">
                Parafrase akademik berbasis AI dengan pilihan gaya bahasa hanya tersedia untuk
                pengguna dengan paket langganan aktif. Pilih paket untuk membuka akses penuh.
              </p>
              <ul className="cek-typo-locked-features">
                <li>
                  <FiCheck aria-hidden="true" />
                  Tiga gaya: formal, lugas, dan ekspansif
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Makna, istilah, dan sitasi tetap terjaga
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Kosakata akademik lebih variatif
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
                    <span className="cek-typo-locked-seg cek-typo-locked-seg--yellow" style={{ width: '16%' }} />
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
        ) : (
          <>
            <div className="parafrase-style-bar" role="group" aria-label="Pilih gaya parafrase">
              <span className="parafrase-style-label">Gaya bahasa</span>
              <div className="parafrase-style-pills">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`parafrase-style-pill${style === option.value ? ' parafrase-style-pill--active' : ''}`}
                    type="button"
                    aria-pressed={style === option.value}
                    onClick={() => handleStyleChange(option.value)}
                    disabled={loading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="parafrase-workspace">
              <form className="parafrase-panel" onSubmit={handleSubmit}>
                <div className="parafrase-panel-head">
                  <h2 className="parafrase-panel-title">
                    <FiFileText aria-hidden="true" />
                    Teks Sumber
                  </h2>
                  <div className="parafrase-panel-actions">
                    <button
                      className="parafrase-tool-btn"
                      type="button"
                      onClick={handlePaste}
                      disabled={loading}
                    >
                      <FiClipboard aria-hidden="true" />
                      Paste Teks
                    </button>
                    <button
                      className="parafrase-tool-btn parafrase-tool-btn--danger"
                      type="button"
                      onClick={handleClear}
                      disabled={loading || !text}
                    >
                      <FiTrash2 aria-hidden="true" />
                      Hapus Teks
                    </button>
                  </div>
                </div>

                <div className="parafrase-source-body">
                  <textarea
                    className="parafrase-textarea"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Tempel paragraf naskah, abstrak, atau kajian pustaka Anda di sini..."
                    aria-label="Teks sumber yang akan diparafrase"
                    disabled={loading}
                  />
                </div>

                <div className="parafrase-source-foot">
                  <span className="parafrase-counter">
                    {wordCount} kata / {charCount} karakter
                  </span>
                  <button
                    className={`parafrase-submit${loading ? ' parafrase-submit--loading' : ''}`}
                    type="submit"
                    disabled={loading || !text.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="parafrase-spinner" aria-hidden="true" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Parafrase Sekarang
                        <FiArrowRight aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <section className="parafrase-panel parafrase-panel--result" aria-live="polite">
                <div className="parafrase-panel-head">
                  <h2 className="parafrase-panel-title">
                    <FiEdit3 aria-hidden="true" />
                    Hasil Parafrase
                  </h2>
                  {result ? (
                    <span className="parafrase-result-badge">{activeStyle.label}</span>
                  ) : null}
                </div>

                <div className="parafrase-result-body">
                  {loading ? (
                    <div className="parafrase-result-loading">
                      <span className="parafrase-spinner" aria-hidden="true" />
                      <p>Menyusun parafrase...</p>
                    </div>
                  ) : result ? (
                    <div
                      className="parafrase-result-content"
                      dangerouslySetInnerHTML={{
                        __html: result.result_text || result.clean_result_text,
                      }}
                    />
                  ) : (
                    <div className="parafrase-result-empty">
                      <FiEdit3 aria-hidden="true" />
                      <p>Hasil parafrase akan muncul di sini.</p>
                      <span>
                        Masukkan teks sumber, pilih gaya bahasa, lalu tekan &ldquo;Parafrase
                        Sekarang&rdquo;.
                      </span>
                    </div>
                  )}
                </div>

                <div className="parafrase-result-foot">
                  <span className="parafrase-counter">
                    {resultWordCount} kata / {resultCharCount} karakter
                  </span>
                  <button
                    className="parafrase-copy-btn"
                    type="button"
                    onClick={handleCopyResult}
                    disabled={!result || loading}
                  >
                    {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                    {copied ? 'Tersalin!' : 'Salin semua'}
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
