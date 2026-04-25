import axios from 'axios';
import { getToken } from './token.service';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error) => {
    const message = error.response?.data?.error?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
