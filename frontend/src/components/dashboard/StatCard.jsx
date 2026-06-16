// Nama file: components/dashboard/StatCard.jsx
// Deskripsi: Komponen kartu statistik ringkasan untuk dasbor utama

import React from 'react';

const StatCard = ({ title, value, icon, subtext, type = 'rose' }) => {
  const typeConfig = {
    rose: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/35 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400'
    },
    emerald: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/35 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/40',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/35 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400'
    },
    blue: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/40',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    }
  };

  const config = typeConfig[type] || typeConfig.rose;

  return (
    <div className={`p-6 border rounded-2xl bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-sm ${config.bg}`}>
      <div className="flex items-center justify-between">
        
        {/* Detail Angka */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            {title}
          </span>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtext && (
            <span className="text-xs text-gray-400 dark:text-gray-500 block">
              {subtext}
            </span>
          )}
        </div>

        {/* Ikon Lingkaran */}
        <div className={`p-3.5 rounded-2xl ${config.iconBg} shrink-0`}>
          {icon}
        </div>

      </div>
    </div>
  );
};

export default StatCard;
