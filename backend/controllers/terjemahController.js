const { generateStructuredContent } = require('./geminiClient');

// Daftar bahasa yang benar-benar didukung. Frontend (Terjemah.jsx) menawarkan
// empat bahasa ini, jadi controller wajib memakai daftar yang sama. Sebelumnya
// controller hanya mengenal 'en' dan menganggap bahasa lain sebagai Indonesia,
// sehingga permintaan id->es atau id->zh tetap diterjemahkan ke Bahasa Indonesia.
const LANGUAGE_NAMES = {
  id: 'Bahasa Indonesia',
  en: 'Bahasa Inggris',
  es: 'Bahasa Spanyol',
  zh: 'Bahasa Tionghoa',
};

const SUPPORTED_CODES = Object.keys(LANGUAGE_NAMES);

function normalizeCode(value, fallback) {
  const code = String(value || '')
    .trim()
    .toLowerCase();
  return code || fallback;
}

async function terjemah(req, res) {
  const { text } = req.body || {};
  const sourceLang = normalizeCode(req.body && req.body.source_lang, 'id');
  const targetLang = normalizeCode(req.body && req.body.target_lang, 'en');

  if (!text || !String(text).trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Teks tidak boleh kosong',
    });
  }

  if (!LANGUAGE_NAMES[sourceLang] || !LANGUAGE_NAMES[targetLang]) {
    return res.status(400).json({
      status: 'error',
      message: `Bahasa tidak didukung. Pilihan yang tersedia: ${SUPPORTED_CODES.join(', ')}.`,
    });
  }

  if (sourceLang === targetLang) {
    return res.status(400).json({
      status: 'error',
      message: 'Bahasa sumber dan bahasa sasaran tidak boleh sama.',
    });
  }

  try {
    const prompt = `Terjemahkan teks berikut dari ${LANGUAGE_NAMES[sourceLang]} ke ${LANGUAGE_NAMES[targetLang]} dengan terminologi akademik yang presisi. Langsung berikan hasil terjemahannya:\n\n${text}`;

    const { response } = await generateStructuredContent({
      contents: prompt,
      timeoutMs: Number(process.env.GEMINI_TEXT_TIMEOUT_MS) || 30000,
      validate: (output) => Boolean(output.trim()),
      label: 'Terjemah',
    });

    return res.json({
      status: 'success',
      source_language: sourceLang,
      target_language: targetLang,
      result_text: response.text,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: `Gagal terhubung ke Gemini: ${error.message}`,
    });
  }
}

module.exports = { terjemah };
