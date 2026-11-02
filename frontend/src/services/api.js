const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

export async function cekTypo(payload) {
  let response;

  if (payload instanceof FormData) {
    response = await fetch(`${API_BASE_URL}/api/cek-typo`, {
      method: 'POST',
      body: payload,
    });
  } else {
    response = await fetch(`${API_BASE_URL}/api/cek-typo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload),
    });
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memeriksa typo');
  }
  return data;
}

export async function parafraseTypo(payload) {
  let response;

  if (payload instanceof FormData) {
    response = await fetch(`${API_BASE_URL}/api/cek-typo/parafrase`, {
      method: 'POST',
      body: payload,
    });
  } else {
    response = await fetch(`${API_BASE_URL}/api/cek-typo/parafrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload),
    });
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memparafrase teks');
  }
  return data;
}

export function getDownloadUrl(downloadId, format = 'pdf') {
  return `${API_BASE_URL}/api/cek-typo/download/${downloadId}?format=${format}`;
}

export async function parafrase(text, style = 'akademik') {
  const response = await fetch(`${API_BASE_URL}/api/parafrase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, style }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memparafrase teks');
  }
  return data;
}

export async function terjemah(text, targetLang = 'en') {
  const response = await fetch(`${API_BASE_URL}/api/terjemah`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, target_lang: targetLang }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menerjemahkan teks');
  }
  return data;
}
