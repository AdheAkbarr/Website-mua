// Nama file: pages/BookingList.jsx
// Deskripsi: Halaman daftar booking lengkap dengan fitur pencarian, filter, sorting, pagination, dan responsivitas

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw, XCircle } from 'lucide-react';
import useBookingStore from '../store/bookingStore';
import useToastStore from '../store/toastStore';
import BookingTable from '../components/booking/BookingTable';
import BookingCard from '../components/booking/BookingCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BookingList = () => {
  const { showToast } = useToastStore();
  const {
    bookings,
    pagination,
    filters,
    loading,
    error,
    fetchBookings,
    setFilters,
    deleteBooking,
    updateBookingStatus
  } = useBookingStore();

  // Dialog Konfirmasi Hapus
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Inisialisasi fetch data saat load atau filter berubah
  useEffect(() => {
    fetchBookings(1);
  }, [filters.status, filters.bulan, filters.sort, filters.order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBookings(newPage);
    }
  };

  // Ubah status cepat via dropdown
  const handleStatusChange = async (id, status) => {
    const res = await updateBookingStatus(id, status, 'Status diperbarui via Quick Action di Daftar Booking.');
    if (res.success) {
      showToast('Status booking berhasil diperbarui!', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Pemicu hapus data booking
  const triggerDelete = (id) => {
    setTargetDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDeleteId) return;
    const res = await deleteBooking(targetDeleteId);
    if (res.success) {
      showToast('Booking berhasil dihapus!', 'success');
    } else {
      showToast(res.error, 'error');
    }
    setTargetDeleteId(null);
  };

  // Reset semua filter
  const resetFilters = () => {
    setFilters({
      status: 'all',
      bulan: '',
      search: '',
      sort: 'tanggal_acara',
      order: 'asc'
    });
    // Triggers fetch bookings secara langsung
    setTimeout(() => fetchBookings(1), 50);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">
            Kelola Booking MUA
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Cari, filter, dan ubah status pemesanan klien Anda secara cepat.
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Booking</span>
        </Link>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Input Search */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 pr-4 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="Cari nama client atau kode booking..."
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="done">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Tombol Submit & Reset */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm focus:outline-none flex items-center justify-center space-x-1"
            >
              <span>Cari</span>
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-colors focus:outline-none"
              title="Reset Filter"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Filter Bulan & Tahun */}
        <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-rose-50 dark:border-gray-700 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              Filter Bulan:
            </span>
            <input
              type="month"
              value={filters.bulan}
              onChange={(e) => setFilters({ bulan: e.target.value })}
              className="bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {filters.bulan && (
              <button
                onClick={() => setFilters({ bulan: '' })}
                className="text-red-500 hover:text-red-600 text-xs"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Konten Utama: Desktop View vs Mobile View */}
      {loading ? (
        <LoadingSpinner text="Memuat daftar booking..." />
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-2">
            <XCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <h4 className="text-base font-bold text-gray-800 dark:text-white">
              Tidak ada data booking ditemukan
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
              Coba ubah kata kunci pencarian Anda atau buat booking baru dengan menekan tombol Tambah Booking di atas.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Tampilan Desktop Table (Sembunyi di Mobile < lg) */}
          <div className="hidden lg:block">
            <BookingTable
              bookings={bookings}
              onStatusChange={handleStatusChange}
              onDelete={triggerDelete}
              onSortChange={(field, order) => setFilters({ sort: field, order: order })}
              activeSort={filters.sort}
              activeOrder={filters.order}
            />
          </div>

          {/* Tampilan Mobile Grid Cards (Sembunyi di Desktop >= lg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onDelete={triggerDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-rose-50 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Menampilkan halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total data)
              </span>
              <div className="flex space-x-1 text-xs">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Booking Client?"
        message="Apakah Anda yakin ingin menghapus data booking klien ini? Semua log perubahan status dan pengingat terkait akan ikut terhapus selamanya."
        confirmText="Ya, Hapus Permanen"
      />

    </div>
  );
};

export default BookingList;
