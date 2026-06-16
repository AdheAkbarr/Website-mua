// Nama file: components/booking/BookingTable.jsx
// Deskripsi: Komponen tabel daftar booking khusus untuk layar desktop

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Phone, Calendar, ArrowUpDown } from 'lucide-react';
import { StatusBadge, DpStatusBadge } from './StatusBadge';
import { formatDateIndo, formatRupiah } from '../../utils/dateHelper';
import { getWAUrl, getWhatsAppTemplates } from '../../utils/whatsappHelper';

const BookingTable = ({ bookings, onStatusChange, onDelete, onSortChange, activeSort, activeOrder }) => {
  
  const handleSort = (field) => {
    if (onSortChange) {
      const order = activeSort === field && activeOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(field, order);
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl shadow-sm transition-colors duration-200">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-rose-50/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-rose-100 dark:border-gray-700">
            <th className="py-4 px-5">Kode Booking</th>
            <th className="py-4 px-5">Client</th>
            
            {/* Sortable Tanggal */}
            <th 
              className="py-4 px-5 cursor-pointer hover:bg-rose-100/50 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleSort('tanggal_acara')}
            >
              <div className="flex items-center space-x-1">
                <span>Tanggal & Jam</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            
            <th className="py-4 px-5">Paket Makeup</th>
            
            {/* Sortable Harga */}
            <th 
              className="py-4 px-5 cursor-pointer hover:bg-rose-100/50 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleSort('harga_total')}
            >
              <div className="flex items-center space-x-1">
                <span>Keuangan</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            
            <th className="py-4 px-5 text-center">Status DP</th>
            <th className="py-4 px-5 text-center">Status Booking</th>
            <th className="py-4 px-5 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rose-50 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
          {bookings.map((booking) => {
            const sisa = booking.harga_total - booking.dp_jumlah;
            const waTemplates = getWhatsAppTemplates(booking);
            const waConfirmUrl = getWAUrl(booking.no_hp, waTemplates.confirmation);

            return (
              <tr 
                key={booking.id}
                className="hover:bg-rose-50/20 dark:hover:bg-gray-700/20 transition-colors"
              >
                {/* Kode Booking */}
                <td className="py-4 px-5 font-bold text-gray-800 dark:text-white">
                  {booking.kode_booking || '-'}
                </td>
                
                {/* Info Client */}
                <td className="py-4 px-5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {booking.nama_client}
                    </span>
                    <a 
                      href={`tel:${booking.no_hp}`}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-rose-500 flex items-center mt-0.5 space-x-1 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{booking.no_hp}</span>
                    </a>
                  </div>
                </td>

                {/* Tanggal & Jam */}
                <td className="py-4 px-5">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatDateIndo(booking.tanggal_acara)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Jam: {booking.jam_acara} WIB
                    </span>
                  </div>
                </td>

                {/* Paket Makeup */}
                <td className="py-4 px-5">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {booking.nama_paket || 'Kustom'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {booking.jumlah_orang} orang
                    </span>
                  </div>
                </td>

                {/* Keuangan */}
                <td className="py-4 px-5">
                  <div className="flex flex-col text-xs">
                    <div className="flex justify-between w-36">
                      <span className="text-gray-400">Total:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{formatRupiah(booking.harga_total)}</span>
                    </div>
                    <div className="flex justify-between w-36 mt-0.5">
                      <span className="text-gray-400">Sisa:</span>
                      <span className={`font-bold ${sisa > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600'}`}>
                        {formatRupiah(sisa)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status DP */}
                <td className="py-4 px-5 text-center">
                  <DpStatusBadge status={booking.dp_status} />
                </td>

                {/* Status Booking */}
                <td className="py-4 px-5 text-center">
                  <div className="flex flex-col items-center space-y-1.5">
                    <StatusBadge status={booking.status} />
                    <select
                      value={booking.status}
                      onChange={(e) => onStatusChange(booking.id, e.target.value)}
                      className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="done">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </td>

                {/* Tombol Aksi */}
                <td className="py-4 px-5 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <a
                      href={waConfirmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors"
                      title="Kirim Konfirmasi WA"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/bookings/${booking.id}/edit`}
                      className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit Booking"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Hapus Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
// 
