// Nama file: store/bookingStore.js
// Deskripsi: State management untuk CRUD Booking dan notifikasi menggunakan Zustand

import { create } from 'zustand';
import api from '../api/axios';

const useBookingStore = create((set, get) => ({
  bookings: [],
  bookingDetail: null,
  statusLogs: [],
  reminderLogs: [],
  notifications: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  },
  filters: {
    status: 'all',
    bulan: '',
    search: '',
    sort: 'tanggal_acara',
    order: 'asc'
  },

  // Mengubah filter pencarian
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Ambil daftar booking dari server
  fetchBookings: async (page = 1) => {
    set({ loading: true, error: null });
    const { filters } = get();
    try {
      const response = await api.get('/bookings', {
        params: {
          ...filters,
          page
        }
      });
      set({
        bookings: response.data.bookings,
        pagination: response.data.pagination,
        loading: false
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memuat data booking.';
      set({ loading: false, error: errMsg });
    }
  },

  // Ambil detail satu booking
  fetchBookingDetail: async (id) => {
    set({ loading: true, error: null, bookingDetail: null, statusLogs: [], reminderLogs: [] });
    try {
      const response = await api.get(`/bookings/${id}`);
      set({
        bookingDetail: response.data.booking,
        statusLogs: response.data.statusLogs,
        reminderLogs: response.data.reminderLogs,
        loading: false
      });
      return response.data.booking;
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memuat detail booking.';
      set({ loading: false, error: errMsg });
      return null;
    }
  },

  // Buat booking baru
  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/bookings', bookingData);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal membuat booking baru.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Perbarui detail booking
  updateBooking: async (id, bookingData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/bookings/${id}`, bookingData);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memperbarui data booking.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Hapus booking
  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/bookings/${id}`);
      set({ loading: false });
      // Refresh list
      get().fetchBookings(get().pagination.page);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal menghapus booking.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Ubah status booking (Quick Action atau dari halaman detail)
  updateBookingStatus: async (id, status, catatan) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/bookings/${id}/status`, { status, catatan });
      set({ loading: false });
      
      // Jika sedang melihat detail booking yang diupdate, muat ulang detailnya
      const currentDetail = get().bookingDetail;
      if (currentDetail && currentDetail.id === parseInt(id)) {
        get().fetchBookingDetail(id);
      }
      
      // Refresh list
      get().fetchBookings(get().pagination.page);
      return { success: true, data: response.data };
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memperbarui status booking.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  // Log manual pengiriman WhatsApp
  logManualReminder: async (id, tipe, pesan) => {
    try {
      await api.post(`/bookings/${id}/reminder-manual`, { tipe, pesan });
      // Muat ulang detail untuk melihat log terupdate
      const currentDetail = get().bookingDetail;
      if (currentDetail && currentDetail.id === parseInt(id)) {
        get().fetchBookingDetail(id);
      }
    } catch (error) {
      // console.error('Gagal mencatat log reminder manual:', error.message);
    }
  },

  // Ambil notifikasi dari server untuk bell icon
  fetchNotifications: async () => {
    try {
      const response = await api.get('/dashboard/notifications');
      set({ notifications: response.data });
    } catch (error) {
      // console.error('Gagal memuat notifikasi:', error.message);
    }
  }
}));

export default useBookingStore;
