const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const { generateStructuredContent } = require('./geminiClient');

const HIGHLIGHT_STYLE =
  'background-color: #fef08a; color: #854d0e; ' +
  'padding: 2px 4px; border-radius: 4px; font-weight: 500;';

const ERROR_STYLE =
  'background-color: #fee2e2; color: #dc2626; text-decoration: line-through; ' +
  'padding: 2px 4px; border-radius: 4px; font-weight: 500;';

const TYPO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    total_errors: { type: 'integer' },
    original_text_html: { type: 'string' },
    result_text_html: { type: 'string' },
    clean_result_text: { type: 'string' },
  },
  required: ['total_errors', 'original_text_html', 'result_text_html', 'clean_result_text'],
};

const PARAPHRASE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    total_changes: { type: 'integer' },
    original_text_html: { type: 'string' },
    result_text_html: { type: 'string' },
    clean_result_text: { type: 'string' },
  },
  required: ['total_changes', 'original_text_html', 'result_text_html', 'clean_result_text'],
};

function isStructuredResult(text, response) {
  if (!text.trim() || response.candidates?.[0]?.finishReason === 'MAX_TOKENS') return false;
  try {
    const value = JSON.parse(stripCodeFence(text));
    return typeof value.original_text_html === 'string' &&
      typeof value.result_text_html === 'string' &&
      typeof value.clean_result_text === 'string' &&
      Number.isInteger(Number(value.total_errors ?? value.total_changes));
  } catch {
    return false;
  }
}

function sanitizeHtml(html = '', markStyle) {
  let value = String(html)
    .replace(/<(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/gi, (tag) => {
      const match = tag.match(/^<\/?\s*([a-z0-9]+)/i);
      if (!match) return '';
      const name = match[1].toLowerCase();
      if (tag.startsWith('</')) return ['mark', 'br', 'p', 'strong', 'em', 'b', 'i', 'u', 'span'].includes(name) ? `</${name}>` : '';
      if (name === 'br') return '<br>';
      if (name === 'mark') return `<mark style="${markStyle}">`;
      if (['p', 'strong', 'em', 'b', 'i', 'u', 'span'].includes(name)) return `<${name}>`;
      return '';
    });
  return value.replace(/javascript:/gi, '').replace(/on[a-z]+\s*=\s*(['"]).*?\1/gi, '');
}

function createAiError(message, statusCode = 503) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const downloadStore = new Map();
const DOWNLOAD_TTL = 60 * 60 * 1000;

function saveDownloadableResult(data) {
  const id = crypto.randomUUID();
  downloadStore.set(id, {
    ...data,
    createdAt: Date.now(),
  });

  const now = Date.now();
  for (const [key, value] of downloadStore.entries()) {
    if (now - value.createdAt > DOWNLOAD_TTL) {
      downloadStore.delete(key);
    }
  }

  return id;
}

function getDownloadUrls(req, id) {
  const host = req.get('host') || 'localhost:8000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}/api/cek-typo/download/${id}`;
  return {
    download_id: id,
    download_url: `/api/cek-typo/download/${id}?format=pdf`,
    download_link: `${baseUrl}?format=pdf`,
    download_pdf: `${baseUrl}?format=pdf`,
    download_txt: `${baseUrl}?format=txt`,
  };
}

async function extractText(file) {
  const filename = (file.originalname || '').toLowerCase();

  if (filename.endsWith('.pdf')) {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      return (result.text || '').trim();
    } finally {
      await parser.destroy();
    }
  }

  if (filename.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return (result.value || '').trim();
  }

  if (filename.endsWith('.txt')) {
    return (file.buffer ? file.buffer.toString('utf-8') : '').trim();
  }

  return '';
}

function stripCodeFence(text = '') {
  let value = text.trim();

  if (value.startsWith('```json')) {
    value = value.slice(7);
  } else if (value.startsWith('```html') || value.startsWith('```HTML')) {
    value = value.slice(7);
  } else if (value.startsWith('```')) {
    value = value.slice(3);
  }

  if (value.endsWith('```')) {
    value = value.slice(0, -3);
  }

  return value.trim();
}

function stripHtmlTags(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseGeminiJsonResponse(rawText) {
  const cleaned = stripCodeFence(rawText);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw err;
  }
}

function splitTextIntoChunks(text, limit = 12000) {
  if (text.length <= limit) return [text];
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (paragraph.length > limit) {
      if (current) chunks.push(current);
      current = '';
      for (let index = 0; index < paragraph.length; index += limit) {
        chunks.push(paragraph.slice(index, index + limit));
      }
      continue;
    }
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > limit && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  if (chunks.length > 20) throw createAiError('Naskah terlalu panjang untuk diproses sekaligus.', 413);
  return chunks;
}

function generatePdfBuffer({ title, content }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        info: {
          Title: title || 'TypoKu - Dokumen Hasil Pemeriksaan',
          Author: 'TypoKu AI',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).font('Helvetica-Bold').text('TypoKu — Asisten Penulisan Akademik', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text(`Hasil Naskah • Diekspor pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1);

      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').fillColor('#111827').text(title || 'Naskah Hasil Perbaikan:');
      doc.moveDown(0.6);

      doc.fontSize(10.5).font('Helvetica').fillColor('#1f2937').lineGap(4).text(content || '', {
        align: 'justify',
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function cekTypo(req, res) {
  try {
    let teks = '';
    let filename = 'dokumen.txt';

    if (req.file) {
      teks = await extractText(req.file);
      filename = req.file.originalname;
    } else if (req.body && req.body.text) {
      teks = (req.body.text || '').trim();
      filename = req.body.filename || 'naskah_input.txt';
    }

    if (!teks) {
      return res.status(400).json({
        status: 'error',
        message: 'File wajib diunggah (PDF atau DOCX) atau kirimkan teks dalam request body.',
      });
    }

    const chunks = splitTextIntoChunks(teks);
    const chunkResults = [];

    for (const chunk of chunks) {
      const prompt = `
Kamu adalah ahli bahasa Indonesia, editor naskah ilmiah, dan pakar PUEBI/KBBI.
Perbaiki semua kata salah ketik (typo), kesalahan ejaan, tanda baca, dan kata tidak baku pada teks bahasa Indonesia berikut sesuai kaidah EYD/PUEBI dan KBBI tanpa mengubah susunan atau esensi makna kalimat.

Kamu WAJIB mengembalikan output HANYA dalam format JSON valid (tanpa blok pembungkus \`\`\`json, tanpa teks pengantar):
{
  "total_errors": <angka_jumlah_kesalahan_yang_ditemukan>,
  "original_text_html": "<seluruh teks asli lengkap dengan kata salah dibungkus mark>",
  "result_text_html": "<seluruh teks hasil perbaikan lengkap dengan kata pengganti dibungkus mark>",
  "clean_result_text": "<seluruh teks hasil perbaikan bersih tanpa tag HTML>"
}

Pertahankan seluruh teks, struktur kalimat, pemisah baris, dan paragraf. Pada original_text_html gunakan mark merah untuk kesalahan. Pada result_text_html gunakan mark kuning untuk penggantian.

Teks asli:
${chunk}
`;

      const { response } = await generateStructuredContent({
        contents: prompt,
        timeoutMs: Number(process.env.GEMINI_TYPO_TIMEOUT_MS) || 60000,
        config: {
          responseMimeType: 'application/json',
          responseSchema: TYPO_RESPONSE_SCHEMA,
          maxOutputTokens: 8192,
        },
        validate: isStructuredResult,
        label: 'Pemeriksaan typo',
      });

      let aiData;
      try {
        aiData = parseGeminiJsonResponse(response.text);
      } catch {
        throw createAiError('Gemini menghasilkan format pemeriksaan yang tidak valid. Silakan coba lagi.');
      }
      if (!aiData.clean_result_text || !aiData.original_text_html || !aiData.result_text_html) {
        throw createAiError('Hasil pemeriksaan typo tidak lengkap. Silakan coba lagi.');
      }
      chunkResults.push(aiData);
    }

    const cleanResult = chunkResults.map((item) => item.clean_result_text).join('\n\n');
    const originalHtml = chunkResults.map((item) => sanitizeHtml(item.original_text_html, ERROR_STYLE)).join('\n\n') || teks;
    const resultHtml = chunkResults.map((item) => sanitizeHtml(item.result_text_html, HIGHLIGHT_STYLE)).join('\n\n');
    const totalErrors = chunkResults.reduce((total, item) => total + (Number(item.total_errors) || 0), 0);

    const downloadId = saveDownloadableResult({
      filename: filename.replace(/\.[^/.]+$/, '') + '_hasil_koreksi',
      content: cleanResult,
      htmlContent: resultHtml,
      originalText: teks,
      type: 'koreksi_typo',
    });

    const downloadInfo = getDownloadUrls(req, downloadId);

    return res.json({
      status: 'success',
      filename,
      total_errors: totalErrors,
      original_text: originalHtml,
      original_text_html: originalHtml,
      original_text_raw: teks,
      result_text: resultHtml,
      clean_result_text: cleanResult,
      ...downloadInfo,
    });
  } catch (error) {
    console.error('cekTypo error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.statusCode
      ? `Gagal memproses dokumen: ${error.message}`
      : 'Gagal memproses dokumen. Pastikan berkas tidak rusak dan formatnya sesuai, lalu coba lagi.';
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
}

async function parafraseTypo(req, res) {
  try {
    let teks = '';
    let filename = 'naskah_parafrase.txt';

    if (req.file) {
      teks = await extractText(req.file);
      filename = req.file.originalname;
    } else if (req.body && req.body.text) {
      teks = (req.body.text || '').trim();
      filename = req.body.filename || 'naskah_parafrase.txt';
    }

    if (!teks) {
      return res.status(400).json({
        status: 'error',
        message: 'Teks atau file dokumen wajib disertakan untuk diparafrase.',
      });
    }

    const style = (req.body && req.body.style) || 'akademik';

    const prompt = `
Kamu adalah akademisi dan pakar parafrase naskah ilmiah bahasa Indonesia.
Tugas kamu adalah memparafrase teks berikut dengan gaya "${style}" agar lebih akademis, formal, dan sesuai kaidah jurnal ilmiah tanpa mengubah esensi makna.

Kamu WAJIB mengembalikan output HANYA dalam format JSON valid (tanpa blok pembungkus \`\`\`json, tanpa pengantar):
{
  "total_changes": <angka perkiraan jumlah bagian kata/frasa yang diubah>,
  "original_text_html": "<seluruh teks asli lengkap di mana SETIAP bagian kata/frasa yang diubah dibungkus dengan tag: <mark style=\\"${ERROR_STYLE}\\">kata_asli</mark>>",
  "result_text_html": "<seluruh teks hasil parafrase di mana SETIAP kata/frasa hasil perbaikan/parafrase WAJIB dibungkus dengan tag sorotan kuning: <mark style=\\"${HIGHLIGHT_STYLE}\\">kata_hasil_parafrase</mark>>",
  "clean_result_text": "<seluruh teks hasil parafrase bersih tanpa tag HTML apapun>"
}

Aturan:
1. Pada "result_text_html", setiap kata atau frasa baru hasil parafrase WAJIB diblok kuning menggunakan tag: <mark style="${HIGHLIGHT_STYLE}">kata_hasil_parafrase</mark>.
2. Pada "original_text_html", bagian teks asli yang diubah dibungkus tag: <mark style="${ERROR_STYLE}">kata_asli</mark> (blok merah garis).
3. Pertahankan struktur kalimat dan alur naskah.

Teks asli:
${teks}
`;

    const { response } = await generateStructuredContent({
      contents: prompt,
      timeoutMs: Number(process.env.GEMINI_TYPO_TIMEOUT_MS) || 60000,
      config: {
        responseMimeType: 'application/json',
        responseSchema: PARAPHRASE_RESPONSE_SCHEMA,
        maxOutputTokens: 8192,
      },
      validate: isStructuredResult,
      label: 'Parafrase dokumen',
    });

    let aiData;
    try {
      aiData = parseGeminiJsonResponse(response.text);
    } catch {
      throw createAiError('Gemini menghasilkan format parafrase yang tidak valid. Silakan coba lagi.');
    }

    const cleanResult = aiData.clean_result_text;
    const originalHtml = sanitizeHtml(aiData.original_text_html, ERROR_STYLE) || teks;
    const resultHtml = sanitizeHtml(aiData.result_text_html, HIGHLIGHT_STYLE);
    const totalChanges = Number(aiData.total_changes) || (resultHtml.match(/<mark/g) || []).length;

    const downloadId = saveDownloadableResult({
      filename: filename.replace(/\.[^/.]+$/, '') + '_hasil_parafrase',
      content: cleanResult,
      htmlContent: resultHtml,
      originalText: teks,
      type: 'parafrase',
      style,
    });

    const downloadInfo = getDownloadUrls(req, downloadId);

    return res.json({
      status: 'success',
      filename,
      style,
      total_changes: totalChanges,
      original_text: originalHtml,
      original_text_html: originalHtml,
      original_text_raw: teks,
      result_text: resultHtml,
      clean_result_text: cleanResult,
      ...downloadInfo,
    });
  } catch (error) {
    console.error('parafraseTypo error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.statusCode
      ? `Gagal memparafrase dokumen: ${error.message}`
      : 'Gagal memparafrase dokumen. Pastikan berkas tidak rusak dan formatnya sesuai, lalu coba lagi.';
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
}

async function downloadResult(req, res) {
  try {
    const id = req.params.id || req.query.id;
    const format = (req.query.format || (req.body && req.body.format) || 'pdf').toLowerCase();

    let item = id ? downloadStore.get(id) : null;

    if (!item && req.body && req.body.text) {
      item = {
        filename: req.body.filename || 'hasil_pemeriksaan',
        content: req.body.text,
        type: req.body.type || 'dokumen',
      };
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'File unduhan tidak ditemukan atau tautan telah kedaluwarsa.',
      });
    }

    const cleanFilename = (item.filename || 'hasil_typoku').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.txt"`);
      return res.send(item.content);
    }

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.html"`);
      return res.send(item.htmlContent || item.content);
    }

    const pdfBuffer = await generatePdfBuffer({
      title: item.type === 'parafrase' ? 'Naskah Hasil Parafrase' : 'Naskah Hasil Koreksi Dokumen',
      content: item.content,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadResult error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Gagal membuat berkas unduhan. Silakan coba lagi.',
    });
  }
}

module.exports = {
  cekTypo,
  parafraseTypo,
  downloadResult,
  HIGHLIGHT_STYLE,
  ERROR_STYLE,
  sanitizeHtml,
  splitTextIntoChunks,
};
