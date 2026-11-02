const { generateStructuredContent } = require('./geminiClient');

async function parafrase(req, res) {
  const { text, style = 'akademik' } = req.body || {};

  if (!text) {
    return res.status(400).json({
      status: 'error',
      message: 'Teks tidak boleh kosong',
    });
  }

  try {
    const prompt = `Parafrase teks berikut dengan gaya ${style} agar sesuai standar naskah ilmiah/akademik. Langsung berikan hasil perbaikannya:\n\n${text}`;

    const { response } = await generateStructuredContent({
      contents: prompt,
      timeoutMs: Number(process.env.GEMINI_TEXT_TIMEOUT_MS) || 30000,
      validate: (text) => Boolean(text.trim()),
      label: 'Parafrase',
    });

    return res.json({
      status: 'success',
      result_text: response.text,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: `Gagal terhubung ke Gemini: ${error.message}`,
    });
  }
}

module.exports = { parafrase };
