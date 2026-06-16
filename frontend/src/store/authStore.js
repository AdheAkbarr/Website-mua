// Nama file: store/authStore.js
// Deskripsi: State management untuk autentikasi user menggunakan Zustand

import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Login menggunakan Password atau PIN 6-digit
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal login. Periksa koneksi Anda.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Logout dari aplikasi
  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Abaikan error saat logout api, tetap bersihkan data lokal
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    }
  },

  // Cek apakah data user di localStorage masih valid
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    } else {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  // Hapus pesan error
  clearError: () => set({ error: null })
}));

export default useAuthStore;
