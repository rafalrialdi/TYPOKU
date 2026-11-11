import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { googleLogin } from '../services/apiClient';
import { queryKeys } from '../lib/queryKeys';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload) =>
      api('/api/auth/login', {
        method: 'POST',
        body: payload,
        auth: false,
      }),
    meta: {
      invalidates: [queryKeys.myOrders, queryKeys.myAccess],
    },
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: (credential) => googleLogin(credential),
    meta: {
      invalidates: [queryKeys.myOrders, queryKeys.myAccess],
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload) =>
      api('/api/auth/register', {
        method: 'POST',
        body: payload,
        auth: false,
      }),
    meta: {
      invalidates: [queryKeys.myOrders, queryKeys.myAccess],
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email) =>
      api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
        auth: false,
      }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload) =>
      api('/api/auth/reset-password', {
        method: 'POST',
        body: payload,
        auth: false,
      }),
  });
}
