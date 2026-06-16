// Nama file: components/booking/BookingCard.jsx
// Deskripsi: Komponen kartu booking untuk view mobile

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Calendar, Clock, MapPin, Eye, Trash2, Edit } from 'lucide-react';
import { StatusBadge, DpStatusBadge } from './StatusBadge';
import { formatDateIndo, formatRupiah } from '../../utils/dateHelper';
import { getWAUrl, getWhatsAppTemplates } from '../../utils/whatsappHelper';

const BookingCard = ({ booking, onStatusChange, onDelete }) => {
  const sisa = booking.harga_total - booking.dp_jumlah;
  const waTemplates = getWhatsAppTemplates(booking);
  
  // URL untuk kirim konfirmasi WA pertama kali
  const waConfirmUrl = getWAUrl(booking.no_hp, waTemplates.confirmation);

  return (
    <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Header Kartu: Kode & Status */}
      <div className="flex items-start justify-between border-b border-rose-50 dark:border-gray-700 pb-3 mb-3">
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            KODE BOOKING
          </span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {booking.kode_booking || '-'}
          </span>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <StatusBadge status={booking.status} />
          <DpStatusBadge status={booking.dp_status} />
        </div>
      </div>

      {/* Konten Utama */}
      <div className="space-y-2 text-sm">
        
        {/* Nama Client & Paket */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-base">
            {booking.nama_client}
          </h4>
          <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">
            Paket: {booking.nama_paket || 'Kustom'}
          </span>
        </div>

        {/* Waktu & Lokasi */}
        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300 text-xs py-1">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{formatDateIndo(booking.tanggal_acara)}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{booking.jam_acara} WIB</span>
          </div>
        </div>

        <div className="flex items-start space-x-1.5 text-gray-600 dark:text-gray-300 text-xs">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{booking.lokasi}</span>
        </div>

        {/* Info Keuangan */}
        <div className="bg-rose-50/50 dark:bg-gray-700/40 rounded-xl p-3 grid grid-cols-2 gap-1 text-xs mt-3">
          <div>
            <span className="text-gray-400 dark:text-gray-500 block text-[10px]">TOTAL BIAYA</span>
            <span className="font-bold text-gray-800 dark:text-white">{formatRupiah(booking.harga_total)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 dark:text-gray-500 block text-[10px]">SISA BAYAR</span>
            <span className={`font-bold ${sisa > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600'}`}>
              {formatRupiah(sisa)}
            </span>
          </div>
        </div>

      </div>

      {/* Tombol Aksi */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-50 dark:border-gray-700">
        
        {/* Tombol Hubungi & Kirim WA */}
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${booking.no_hp}`}
            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg shrink-0 transition-colors"
            title="Telepon Client"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={waConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm flex items-center space-x-1 transition-colors"
            title="Kirim Konfirmasi WA"
          >
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Detail, Edit, Hapus */}
        <div className="flex items-center space-x-1">
          <Link
            to={`/bookings/${booking.id}`}
            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/bookings/${booking.id}/edit`}
            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit Booking"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(booking.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            title="Hapus Booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Quick Status Update */}
      <div className="mt-3">
        <select
          value={booking.status}
          onChange={(e) => onStatusChange(booking.id, e.target.value)}
          className="w-full text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:ring-1 focus:ring-rose-500 focus:outline-none"
        >
          <option value="pending">Set Pending</option>
          <option value="confirmed">Set Confirmed (Buku)</option>
          <option value="done">Set Selesai</option>
          <option value="cancelled">Set Dibatalkan</option>
        </select>
      </div>

    </div>
  );
};

export default BookingCard;
