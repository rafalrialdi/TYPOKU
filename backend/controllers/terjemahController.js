const { generateStructuredContent } = require('./geminiClient');

async function terjemah(req, res) {
  const { text, target_lang: targetLang = 'en' } = req.body || {};

  if (!text) {
    return res.status(400).json({
      status: 'error',
      message: 'Teks tidak boleh kosong',
    });
  }

  try {
    const bahasaTujuan =
      targetLang === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia';
    const prompt = `Terjemahkan teks berikut ke ${bahasaTujuan} dengan terminologi akademik yang presisi. Langsung berikan hasil terjemahannya:\n\n${text}`;

    const { response } = await generateStructuredContent({
      contents: prompt,
      timeoutMs: Number(process.env.GEMINI_TEXT_TIMEOUT_MS) || 30000,
      validate: (text) => Boolean(text.trim()),
      label: 'Terjemah',
    });

    return res.json({
      status: 'success',
      source_language: targetLang === 'en' ? 'id' : 'en',
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
