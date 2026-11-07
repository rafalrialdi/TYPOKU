import { request } from './apiClient';

export function getPackages({ signal } = {}) {
  return request('/api/packages', { signal });
}

export function getPaymentConfig({ signal } = {}) {
  return request('/api/payments/config', { signal });
}

export function createOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getOrderByCode(orderCode) {
  return request(`/api/orders/${encodeURIComponent(orderCode)}`, {
    auth: true,
  });
}

export function getMyOrders() {
  return request('/api/orders/my', {
    auth: true,
  });
}

export function getPaymentStatus(orderCode) {
  return request(`/api/payments/status/${encodeURIComponent(orderCode)}`, {
    auth: true,
  });
}
