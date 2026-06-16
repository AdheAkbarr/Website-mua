// Nama file: components/dashboard/UpcomingList.jsx
// Deskripsi: Komponen list booking terdekat (7 hari ke depan) untuk dasbor utama

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, User } from 'lucide-react';
import { formatDateIndo } from '../../utils/dateHelper';
import { StatusBadge } from '../booking/StatusBadge';

const UpcomingList = ({ bookings = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-colors duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-gray-700">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
          Jadwal Terdekat (7 Hari Ke Depan)
        </h4>
        <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2.5 py-1 rounded-full">
          {bookings.length} Acara
        </span>
      </div>

      {/* List Item */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 dark:text-gray-500">
            Tidak ada jadwal booking dalam 7 hari ke depan.
          </div>
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              to={`/bookings/${booking.id}`}
              className="flex items-center justify-between p-3.5 rounded-xl border border-rose-50 hover:border-rose-100 dark:border-gray-700/50 dark:hover:border-gray-600 bg-white hover:bg-rose-50/10 dark:bg-gray-800/40 dark:hover:bg-gray-700/35 transition-all duration-150 group"
            >
              <div className="flex items-start space-x-3 min-w-0">
                {/* Lingkaran Inisial / Avatar Mini */}
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {booking.nama_client ? booking.nama_client.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>

                {/* Info Utama */}
                <div className="min-w-0">
                  <h5 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {booking.nama_client}
                  </h5>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                    {booking.nama_paket || 'Kustom'} • {booking.jumlah_orang} orang
                  </p>
                  
                  {/* Waktu detail */}
                  <div className="flex items-center space-x-2 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-0.5 shrink-0" />
                      {formatDateIndo(booking.tanggal_acara)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5 shrink-0" />
                      {booking.jam_acara} WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Panah */}
              <div className="flex items-center space-x-2 shrink-0">
                <StatusBadge status={booking.status} />
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
              </div>

            </Link>
          ))
        )}
      </div>

    </div>
  );
};

export default UpcomingList;
