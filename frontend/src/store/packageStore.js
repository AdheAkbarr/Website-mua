// Nama file: store/packageStore.js
// Deskripsi: State management untuk CRUD master paket makeup menggunakan Zustand

import { create } from 'zustand';
import api from '../api/axios';

const usePackageStore = create((set, get) => ({
  packages: [],
  loading: false,
  error: null,

  // Ambil semua paket dari server
  fetchPackages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/packages');
      set({ packages: response.data, loading: false });
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memuat daftar paket.';
      set({ loading: false, error: errMsg });
    }
  },

  // Tambahkan paket baru
  createPackage: async (pkgData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/packages', pkgData);
      set({ loading: false });
      get().fetchPackages();
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal membuat paket baru.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Perbarui data paket
  updatePackage: async (id, pkgData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/packages/${id}`, pkgData);
      set({ loading: false });
      get().fetchPackages();
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memperbarui paket.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Hapus paket
  deletePackage: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/packages/${id}`);
      set({ loading: false });
      get().fetchPackages();
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal menghapus paket.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Toggle status aktif paket (aktif/nonaktif)
  togglePackageActive: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/packages/${id}/toggle`);
      set({ loading: false });
      
      // Update local state secara langsung agar lebih cepat
      set((state) => ({
        packages: state.packages.map((pkg) =>
          pkg.id === parseInt(id) ? { ...pkg, aktif: response.data.aktif } : pkg
        )
      }));
      return { success: true, aktif: response.data.aktif };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal mengubah status aktif paket.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  }
}));

export default usePackageStore;
