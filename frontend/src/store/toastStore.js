// Nama file: store/toastStore.js
// Deskripsi: State management untuk notifikasi Toast menggunakan Zustand

import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  
  /**
   * Menampilkan toast baru
   * @param {string} message - Pesan yang ingin ditampilkan
   * @param {'success' | 'error' | 'info' | 'warning'} type - Tipe notifikasi
   * @param {number} duration - Durasi tampil dalam milidetik (default: 3000)
   */
  showToast: (message, type = 'success', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },

  // Menghapus toast secara manual
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

export default useToastStore;
