// Nama file: api/axios.js
// Deskripsi: Konfigurasi Axios instance dengan interceptor untuk melampirkan JWT token secara otomatis

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk Request: Sisipkan token dari localStorage jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk Response: Tangani token kedaluwarsa atau error tidak terorisasi (401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika token kedaluwarsa atau tidak valid, logout user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Arahkan ke halaman login (opsional, bisa ditangani oleh store/router)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
