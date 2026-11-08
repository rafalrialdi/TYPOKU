export const queryKeys = {
  packages: ['packages'],
  paymentConfig: ['payment-config'],
  paymentStatus: (orderCode) => ['payment-status', orderCode],
  myOrders: ['orders', 'my'],
  myAccess: ['subscriptions', 'my-access'],
  orderByCode: (orderCode) => ['order', orderCode],
  resetToken: (token) => ['reset-token', token],
};
