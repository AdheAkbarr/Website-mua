// Nama file: components/reminder/ReminderBell.jsx
// Deskripsi: Komponen lonceng notifikasi (bell) dengan dropdown pengingat otomatis

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, AlertCircle, Calendar } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';

const ReminderBell = () => {
  const navigate = useNavigate();
  const { notifications, fetchNotifications } = useBookingStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Muat notifikasi berkala
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 menit sekali
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Tombol Lonceng */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 rounded-lg hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
        title="Pengingat / Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Notifikasi */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-rose-100 rounded-xl shadow-xl dark:bg-gray-800 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-3 border-b border-rose-50 dark:border-gray-700 bg-rose-50/50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Pengingat Jadwal MUA</span>
              <span className="px-2 py-0.5 text-xs font-medium text-rose-600 bg-rose-100 rounded-full dark:bg-rose-900/30 dark:text-rose-400">
                {notifications.length} Baru
              </span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                Tidak ada log pengingat otomatis saat ini.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/bookings/${notif.booking_id}`);
                  }}
                  className="p-3 text-left hover:bg-rose-50/55 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-2">
                    {notif.tipe === 'SYSTEM_ALERT' ? (
                      <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 mt-0.5 text-rose-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">
                        {notif.pesan}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(notif.sent_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(notif.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link
              to="/bookings"
              onClick={() => setShowDropdown(false)}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400"
            >
              Lihat Daftar Booking
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReminderBell;
