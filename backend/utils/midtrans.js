const midtransClient = require('midtrans-client');
const crypto = require('crypto');

const isProduction = (process.env.MIDTRANS_IS_PRODUCTION || 'false').trim().toLowerCase() === 'true';
const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
const clientKey = (process.env.MIDTRANS_CLIENT_KEY || '').trim();

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

function mapPaymentMethodToEnabledPayments(method) {
  const normalized = (method || '').toLowerCase().trim();
  switch (normalized) {
    case 'qris':
      return ['other_qris'];
    case 'dana':
      return ['dana'];
    case 'ovo':
      return ['ovo'];
    case 'gopay':
      return ['gopay'];
    case 'shopeepay':
      return ['shopeepay'];
    case 'bca_va':
      return ['bca_va'];
    case 'bni_va':
      return ['bni_va'];
    case 'bri_va':
      return ['bri_va'];
    case 'mandiri_va':
      return ['echannel'];
    default:
      return [normalized];
  }
}

function verifyNotificationSignature(orderId, statusCode, grossAmount, signatureKey) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const calculated = crypto.createHash('sha512').update(payload).digest('hex');
  return calculated.toLowerCase() === signatureKey.toLowerCase();
}

module.exports = {
  snap,
  coreApi,
  isProduction,
  serverKey,
  clientKey,
  mapPaymentMethodToEnabledPayments,
  verifyNotificationSignature,
};
