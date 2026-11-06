const STRENGTH_LABELS = ['Belum diisi', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];

export function getPasswordStrength(password = '') {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const tone =
    score === 0 ? '' : score === 1 ? 'is-weak' : score === 2 ? 'is-medium' : 'is-strong';

  return {
    score,
    label: STRENGTH_LABELS[score],
    tone,
  };
}

export function getPasswordRequirements(password = '') {
  return [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Mengandung huruf', met: /[A-Za-z]/.test(password) },
    { label: 'Mengandung angka', met: /\d/.test(password) },
    { label: 'Mengandung simbol', met: /[^A-Za-z0-9]/.test(password) },
  ];
}
