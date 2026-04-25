import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('karuna_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the standard API envelope { success, data }
api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const message =
      error.response?.data?.error?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
