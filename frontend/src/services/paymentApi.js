import { request } from './apiClient';

// Hanya status pembayaran yang dipakai halaman. Paket, konfigurasi pembayaran,
// pembuatan order, detail order, dan riwayat order sudah ditangani hook
// TanStack Query (usePackages, usePaymentConfig, useCreateOrder, useMyOrders)
// sehingga salinan fungsi di sini tidak pernah diimpor siapa pun.
export function getPaymentStatus(orderCode) {
  return request(`/api/payments/status/${encodeURIComponent(orderCode)}`, {
    auth: true,
  });
}
