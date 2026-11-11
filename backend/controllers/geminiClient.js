const { GoogleGenAI } = require('@google/genai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MODEL_FALLBACKS = (
  process.env.GEMINI_MODEL_FALLBACKS ||
  'gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.7-flash,gemini-flash-latest'
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;
const MIN_COOLDOWN_MS = 30 * 1000;
const MAX_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const modelCooldownUntil = new Map();

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const error = new Error('Konfigurasi layanan AI belum lengkap. Silakan hubungi administrator.');
      error.statusCode = 500;
      error.cause = 'GEMINI_API_KEY belum diset pada file .env';
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
  return (
    error?.name === 'TimeoutError' ||
    /TIMEOUT|ETIMEDOUT|ECONNRESET|ABORT|DEADLINE_EXCEEDED|DEADLINE/.test(code) ||
    Number(error?.status ?? error?.code) === 504
  );
}

function isRetryable(error) {
  if (isTimeout(error)) return true;
  const code = getErrorCode(error);
  return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|TOO MANY REQUESTS|HIGH DEMAND/.test(code);
}

function isQuotaError(error) {
  return /429|RESOURCE_EXHAUSTED|QUOTA|RATE LIMIT|TOO MANY REQUESTS/.test(getErrorCode(error));
}

function parseRetryDelayMs(error) {
  const text = String(error?.message || '');

  const retryInfo = text.match(/"retryDelay"\s*:\s*"([\d.]+)s"/i);
  if (retryInfo) return Number(retryInfo[1]) * 1000;

  const retryIn = text.match(/retry in\s+([0-9hms.]+)/i);
  if (!retryIn) return null;

  const value = retryIn[1].toLowerCase();
  const hours = value.match(/([\d.]+)h/);
  const minutes = value.match(/([\d.]+)m/);
  const seconds = value.match(/([\d.]+)s/);

  let total = 0;
  if (hours) total += Number(hours[1]) * 60 * 60 * 1000;
  if (minutes) total += Number(minutes[1]) * 60 * 1000;
  if (seconds) total += Number(seconds[1]) * 1000;

  return total > 0 ? total : null;
}

function cooldownMsFor(error) {
  const retryDelay = parseRetryDelayMs(error);
  if (retryDelay) return Math.min(Math.max(retryDelay, MIN_COOLDOWN_MS), MAX_COOLDOWN_MS);

  const configured = Number(process.env.GEMINI_MODEL_COOLDOWN_MS);
  const base = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_COOLDOWN_MS;
  return Math.min(Math.max(base, MIN_COOLDOWN_MS), MAX_COOLDOWN_MS);
}

function markModelCooldown(model, error) {
  if (!isQuotaError(error)) return;
  modelCooldownUntil.set(model, Date.now() + cooldownMsFor(error));
}

function isModelCoolingDown(model) {
  const until = modelCooldownUntil.get(model);
  if (!until) return false;

  if (until <= Date.now()) {
    modelCooldownUntil.delete(model);
    return false;
  }

  return true;
}

function normalizeError(error, timedOut = false) {
  const timeout = timedOut || isTimeout(error);
  const code = getErrorCode(error);

  let message = 'Layanan AI sedang sibuk atau tidak tersedia. Silakan coba lagi beberapa saat lagi.';
  if (timeout) {
    message = 'Layanan AI tidak merespons dalam batas waktu. Silakan coba lagi.';
  } else if (error?.code === 'INVALID_OUTPUT') {
    message = 'Layanan AI menghasilkan respons yang tidak lengkap. Silakan coba lagi.';
  } else if (/401|403|PERMISSION|API KEY|API_KEY|UNAUTHENTICATED|INVALID/.test(code)) {
    message = 'Konfigurasi layanan AI tidak valid. Silakan hubungi administrator.';
  } else if (/429|RESOURCE_EXHAUSTED|QUOTA|RATE LIMIT|LIMIT/.test(code)) {
    message = 'Kuota layanan sedang penuh. Silakan coba lagi nanti.';
  }

  const normalized = new Error(message);
  normalized.statusCode = timeout ? 504 : 503;
  normalized.cause = error;
  return normalized;
}

async function generateStructuredContent({ contents, config = {}, timeoutMs = 30000, validate, label = 'AI' }) {
  let lastError = null;
  let timedOut = false;

  const chain = modelChain();
  const readyModels = chain.filter((model) => !isModelCoolingDown(model));
  const modelsToTry = readyModels.length ? readyModels : chain;

  for (const model of modelsToTry) {
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
        lastError = Object.assign(
          new Error(`${label} menghasilkan output tidak lengkap dari model ${model}`),
          { code: 'INVALID_OUTPUT' }
        );
        continue;
      }
      return { response, model };
    } catch (error) {
      lastError = error;
      if (error?.statusCode) throw error;
      markModelCooldown(model, error);
      if (!isRetryable(error)) throw normalizeError(error);
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
