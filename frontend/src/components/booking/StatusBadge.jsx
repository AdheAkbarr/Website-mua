// Nama file: components/booking/StatusBadge.jsx
// Deskripsi: Komponen badge untuk memformat status booking dan status DP secara visual

import React from 'react';
import { Clock, CheckCircle2, XCircle, CalendarRange } from 'lucide-react';

/**
 * Badge Status Booking
 */
export const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      label: 'Pending',
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
      icon: <Clock className="w-3.5 h-3.5 mr-1" />
    },
    confirmed: {
      label: 'Confirmed',
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900',
      icon: <CalendarRange className="w-3.5 h-3.5 mr-1" />
    },
    done: {
      label: 'Selesai',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
    },
    cancelled: {
      label: 'Dibatalkan',
      classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900',
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />
    }
  };

  const current = config[status] || {
    label: status,
    classes: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    icon: null
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold border rounded-full transition-colors ${current.classes}`}>
      {current.icon}
      {current.label}
    </span>
  );
};

/**
 * Badge Status DP (Down Payment)
 */
export const DpStatusBadge = ({ status }) => {
  const config = {
    lunas: {
      label: 'DP Lunas',
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
    },
    belum: {
      label: 'Belum Lunas',
      classes: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'
    }
  };

  const current = config[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold border rounded-md uppercase tracking-wider ${current.classes}`}>
      {current.label}
    </span>
  );
};

export default StatusBadge;
