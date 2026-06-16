// Nama file: components/booking/BookingTimeline.jsx
// Deskripsi: Komponen timeline untuk merender log perubahan status booking secara visual

import React from 'react';
import { CircleDot, CalendarDays, CheckCircle2, Clock, Ban } from 'lucide-react';

const BookingTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
        Tidak ada catatan riwayat status untuk booking ini.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'confirmed':
        return <CalendarDays className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'cancelled':
        return <Ban className="w-4 h-4 text-red-500" />;
      default:
        return <CircleDot className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Mulai';
    switch (status) {
      case 'pending': return 'PENDING';
      case 'confirmed': return 'CONFIRMED';
      case 'done': return 'SELESAI';
      case 'cancelled': return 'DIBATALKAN';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              
              {/* Garis penghubung timeline */}
              {logIdx !== logs.length - 1 ? (
                <span 
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-rose-100 dark:bg-gray-700" 
                  aria-hidden="true" 
                />
              ) : null}

              <div className="relative flex space-x-3">
                {/* Bulatan status ikon */}
                <div>
                  <span className="h-8 w-8 rounded-full bg-rose-50 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                    {getStatusIcon(log.status_baru)}
                  </span>
                </div>

                {/* Konten detail log */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex justify-between items-start space-x-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {log.status_lama ? (
                          <>
                            Ubah status:{' '}
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">
                              {getStatusLabel(log.status_lama)}
                            </span>{' '}
                            →{' '}
                          </>
                        ) : (
                          'Pembuatan Booking Awal: '
                        )}
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-mono font-bold">
                          {getStatusLabel(log.status_baru)}
                        </span>
                      </p>
                      {log.catatan && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                          "{log.catatan}"
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
                      <time dateTime={log.changed_at}>
                        {new Date(log.changed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}{' '}
                        {new Date(log.changed_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingTimeline;
