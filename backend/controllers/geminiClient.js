const { GoogleGenAI } = require('@google/genai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MODEL_FALLBACKS = (process.env.GEMINI_MODEL_FALLBACKS || 'gemini-3.5-flash,gemini-flash-latest')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const error = new Error('GEMINI_API_KEY belum diset pada file .env');
      error.statusCode = 500;
      throw error;
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function modelChain() {
  return [...new Set([MODEL, ...MODEL_FALLBACKS])];
}

function getErrorCode(error) {
  return String(error?.status || error?.code || error?.message || '').toUpperCase();
}

function isTimeout(error) {
  const code = getErrorCode(error);
  return error?.name === 'TimeoutError' || /TIMEOUT|ETIMEDOUT|ECONNRESET|ABORT/.test(code);
}

function isRetryable(error) {
  if (isTimeout(error)) return true;
  const code = getErrorCode(error);
  return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|TOO MANY REQUESTS|HIGH DEMAND/.test(code);
}

function normalizeError(error, timedOut = false) {
  const normalized = new Error(
    timedOut || isTimeout(error)
      ? 'Layanan AI tidak merespons dalam batas waktu.'
      : 'Layanan AI sedang sibuk atau tidak tersedia.'
  );
  normalized.statusCode = timedOut || isTimeout(error) ? 504 : 503;
  normalized.cause = error;
  return normalized;
}

async function generateStructuredContent({ contents, config = {}, timeoutMs = 30000, validate, label = 'AI' }) {
  let lastError = null;
  let timedOut = false;

  for (const model of modelChain()) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents,
        config: {
          ...config,
          httpOptions: {
            ...(config.httpOptions || {}),
            timeout: timeoutMs,
          },
        },
      });
      const text = response.text || '';
      const finishReason = response.candidates?.[0]?.finishReason;
      if (!text.trim() || finishReason === 'MAX_TOKENS' || (validate && !validate(text, response))) {
        lastError = new Error(`${label} menghasilkan output tidak lengkap dari model ${model}`);
        continue;
      }
      return { response, model };
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
      timedOut = timedOut || isTimeout(error);
    }
  }

  throw normalizeError(lastError, timedOut);
}

module.exports = {
  getClient,
  MODEL,
  MODEL_FALLBACKS,
  generateStructuredContent,
};
