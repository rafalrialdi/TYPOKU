const GENERIC_PROCESS_ERROR = 'Terjadi kesalahan saat memproses naskah. Silakan coba lagi.';

export function toHumanReadableError(error) {
  const status = error && typeof error === 'object' ? error.status : undefined;
  const raw = error && typeof error === 'object' ? error.message : error;
  const text = typeof raw === 'string' ? raw.trim() : '';

  if (
    status === 504 ||
    /DEADLINE_EXCEEDED|tidak merespons dalam batas waktu|timeout|deadline/i.test(text)
  ) {
    return 'Pemrosesan naskah memakan waktu terlalu lama. Silakan coba lagi.';
  }

  if (/kuota|quota|RESOURCE_EXHAUSTED|rate limit|terlalu banyak permintaan/i.test(text)) {
    return 'Kuota layanan sedang penuh. Silakan coba lagi nanti.';
  }

  if (
    status === 503 ||
    /UNAVAILABLE|RESOURCE_EXHAUSTED|HIGH DEMAND|sedang sibuk|tidak tersedia/i.test(text)
  ) {
    return 'Layanan pemeriksaan sedang sibuk. Silakan coba beberapa saat lagi.';
  }

  const looksTechnical =
    /^[\[{]/.test(text) ||
    /"(error|status|code|message)"\s*:/i.test(text) ||
    /\bat\s+[\w.<>]+\s*\(/.test(text) ||
    /\b[A-Z][A-Z0-9_]{5,}\b\s*:/.test(text);

  if (looksTechnical) return GENERIC_PROCESS_ERROR;

  return text || GENERIC_PROCESS_ERROR;
}
