import { request } from '../services/apiClient';

export async function api(path, options = {}) {
  return request(path, options);
}
