import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiClipboard,
  FiCopy,
  FiEdit3,
  FiFileText,
  FiLock,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { Toast, useToast } from '../components/Toast';
import { useMyAccess } from '../hooks/useMyAccess';
import { api } from '../lib/api';
import { toHumanReadableError } from '../utils/humanizeError';
import './cekTypo.css';
import './terjemah.css';

const LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'en', label: 'Bahasa Inggris' },
  { code: 'es', label: 'Bahasa Spanyol' },
  { code: 'zh', label: 'Bahasa Tionghoa' },
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

export function TerjemahSkeleton() {
  return (
    <div className="terjemah-page">
      <div className="terjemah-container">
        <Skeleton style={{ width: '18rem', height: '2.5rem', marginBottom: '0.5rem' }} />
        <Skeleton style={{ width: '34rem', maxWidth: '100%', height: '1.125rem', marginBottom: '2rem' }} />
        <div className="terjemah-skeleton-grid">
          <Skeleton style={{ width: '100%', height: '30rem', borderRadius: '1rem' }} />
          <Skeleton style={{ width: '100%', height: '30rem', borderRadius: '1rem' }} />
        </div>
      </div>
    </div>
  );
}

export default function Terjemah() {
  const { data: accessData } = useMyAccess();
  const hasAccess = Boolean(accessData?.hasAccess);
  const { toast, showToast } = useToast();

  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('id');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [targetMenuOpen, setTargetMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = countWords(sourceText);
  const charCount = sourceText.length;
  const sourceLabel = LANGUAGES.find((option) => option.code === sourceLang)?.label || LANGUAGES[0].label;
  const targetLabel = LANGUAGES.find((option) => option.code === targetLang)?.label || LANGUAGES[1].label;

  function handleSourceChange(event) {
    setSourceText(event.target.value);
    if (result) setResult(null);
  }

  function handleClear() {
    setSourceText('');
    setResult(null);
    setError('');
  }

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        showToast('Clipboard tidak berisi teks.');
        return;
      }
      setSourceText(clipboardText);
      setResult(null);
      setError('');
    } catch {
      showToast('Tidak dapat membaca clipboard. Tempel teks secara manual.');
    }
  }

  function handleSwap() {
    if (sourceLang === targetLang) {
      showToast('Sumber dan target tidak boleh menggunakan bahasa yang sama.');
      return;
    }
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setResult(null);
    setError('');
  }

  async function handleTranslate(event) {
    event.preventDefault();
    if (loading) return;

    if (!sourceText.trim()) {
      showToast('Silakan masukkan teks yang ingin diterjemahkan.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api('/api/terjemah', {
        method: 'POST',
        body: { text: sourceText.trim(), source_lang: sourceLang, target_lang: targetLang },
        auth: true,
      });

      setResult(response);
    } catch (err) {
      console.error('Terjemah error:', err);
      setError(toHumanReadableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;

    const copySource = result.result_text || stripHtml(result.result_text);
    if (!copySource) return;

    try {
      await navigator.clipboard.writeText(copySource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Gagal menyalin hasil terjemahan.');
    }
  }

  return (
    <div className="terjemah-page">
      <div className="terjemah-container">
        <header className="terjemah-header">
          <h1 className="terjemah-title">Penerjemah Akademik</h1>
          <p className="terjemah-subtitle">
            Terjemahkan abstrak, manuskrip, dan jurnal internasional dengan kosakata ilmiah yang presisi dan
            mempertahankan gaya sitasi.
          </p>
        </header>

        {error ? (
          <div className="cek-typo-alert cek-typo-alert--error" role="alert">
            <div className="cek-typo-alert-content">
              <FiAlertCircle aria-hidden="true" />
              <div>
                <strong>Terjemah Gagal:</strong> {error}
              </div>
            </div>
            <button className="cek-typo-alert-close" type="button" onClick={() => setError('')} aria-label="Tutup pesan error">
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
              <h2 className="cek-typo-locked-title">Buka penerjemahan untuk naskah ilmiah Anda</h2>
              <p className="cek-typo-locked-desc">
                Terjemahan akademik ke bahasa target untuk abstrak, manuskrip, dan jurnal internasional hanya
                tersedia untuk pengguna dengan paket langganan aktif. Pilih paket untuk membuka akses penuh.
              </p>
              <ul className="cek-typo-locked-features">
                <li>
                  <FiCheck aria-hidden="true" />
                  Terjemahan akademik ke bahasa target
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Kosakata ilmiah & terminologi presisi
                </li>
                <li>
                  <FiCheck aria-hidden="true" />
                  Penerjemahan gaya sitasi tetap
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
            <div className="terjemah-language-bar">
              <div className="terjemah-lang-cluster">
                <button className="terjemah-lang-btn" type="button" onClick={() => setSourceMenuOpen((open) => !open)}>
                  <span className="terjemah-lang-label">Bahasa Sumber</span>
                  <span className="terjemah-lang-value">{sourceLabel}</span>
                  <FiChevronDown className="terjemah-lang-chevron" aria-hidden="true" />
                </button>
                {sourceMenuOpen ? (
                  <div className="terjemah-lang-menu">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        className="terjemah-lang-option"
                        onClick={() => {
                          setSourceLang(language.code);
                          setSourceMenuOpen(false);
                        }}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button className="terjemah-swap-btn" type="button" onClick={handleSwap} aria-label="Tukar Posisi Bahasa">
                <FiRefreshCw aria-hidden="true" />
              </button>

              <div className="terjemah-lang-cluster">
                <button className="terjemah-lang-btn" type="button" onClick={() => setTargetMenuOpen((open) => !open)}>
                  <span className="terjemah-lang-label">Bahasa Sasaran</span>
                  <span className="terjemah-lang-value">{targetLabel}</span>
                  <FiChevronDown className="terjemah-lang-chevron" aria-hidden="true" />
                </button>
                {targetMenuOpen ? (
                  <div className="terjemah-lang-menu">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        className="terjemah-lang-option"
                        onClick={() => {
                          setTargetLang(language.code);
                          setTargetMenuOpen(false);
                        }}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="terjemah-workspace">
              <form className="terjemah-panel" onSubmit={handleTranslate}>
                <div className="terjemah-panel-head">
                  <h2 className="terjemah-panel-title">
                    <FiFileText aria-hidden="true" />
                    Bahasa Sumber
                  </h2>
                  <div className="terjemah-panel-actions">
                    <button className="terjemah-tool-btn" type="button" onClick={handlePaste} disabled={loading}>
                      <FiClipboard aria-hidden="true" />
                      Paste Teks
                    </button>
                    <button
                      className="terjemah-tool-btn terjemah-tool-btn--danger"
                      type="button"
                      onClick={handleClear}
                      disabled={loading || !sourceText}
                    >
                      <FiTrash2 aria-hidden="true" />
                      Hapus Teks
                    </button>
                  </div>
                </div>

                <div className="terjemah-source-body">
                  <textarea
                    className="terjemah-textarea"
                    value={sourceText}
                    onChange={handleSourceChange}
                    placeholder="Ketik atau tempel teks akademik bahasa Indonesia di sini..."
                    aria-label="Teks sumber akademik"
                    disabled={loading}
                  />
                </div>

                <div className="terjemah-source-foot">
                  <span className="terjemah-counter">
                    {wordCount} kata / {charCount} karakter
                  </span>
                  <button
                    className={`terjemah-submit${loading ? ' terjemah-submit--loading' : ''}`}
                    type="submit"
                    disabled={loading || !sourceText.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="terjemah-spinner" aria-hidden="true" />
                        Menerjemahkan...
                      </>
                    ) : (
                      <>
                        Terjemahkan Sekarang
                        <FiArrowRight aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <section className="terjemah-panel terjemah-panel--result" aria-live="polite">
                <div className="terjemah-panel-head">
                  <h2 className="terjemah-panel-title">
                    <FiEdit3 aria-hidden="true" />
                    Bahasa Sasaran
                  </h2>
                  {result ? <span className="terjemah-result-badge">{targetLabel}</span> : null}
                </div>

                <div className="terjemah-result-body">
                  {loading ? (
                    <div className="terjemah-result-loading">
                      <span className="terjemah-spinner" aria-hidden="true" />
                      <p>Menerjemahkan...</p>
                    </div>
                  ) : result ? (
                    <div
                      className="terjemah-result-content"
                      dangerouslySetInnerHTML={{ __html: result.result_text || '' }}
                    />
                  ) : (
                    <div className="terjemah-result-empty">
                      <FiEdit3 aria-hidden="true" />
                      <p>Hasil terjemahan akan muncul di sini.</p>
                      <span>Masukkan teks sumber, pilih bahasa, lalu tekan &ldquo;Terjemahkan Sekarang&rdquo;.</span>
                    </div>
                  )}
                </div>

                <div className="terjemah-result-foot">
                  <button className="terjemah-copy-btn" type="button" onClick={handleCopy} disabled={!result || loading}>
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
