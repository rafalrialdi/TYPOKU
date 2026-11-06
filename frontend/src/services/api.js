import { request } from './apiClient';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000');

export async function cekTypo(payload) {
  const response = await request('/api/cek-typo', {
    method: 'POST',
    body: payload instanceof FormData ? payload : { text: payload },
    auth: true,
  });

  return response;
}

export async function parafraseTypo(payload) {
  const response = await request('/api/cek-typo/parafrase', {
    method: 'POST',
    body: payload instanceof FormData ? payload : { text: payload },
    auth: true,
  });

  return response;
}

export function getDownloadUrl(downloadId, format = 'pdf') {
  return `${API_BASE_URL}/api/cek-typo/download/${downloadId}?format=${format}`;
}

export async function parafrase(text, style = 'akademik') {
  const response = await request('/api/parafrase', {
    method: 'POST',
    body: { text, style },
    auth: true,
  });

  return response;
}

export async function terjemah(text, targetLang = 'en') {
  const response = await request('/api/terjemah', {
    method: 'POST',
    body: { text, target_lang: targetLang },
    auth: true,
  });

  return response;
}
