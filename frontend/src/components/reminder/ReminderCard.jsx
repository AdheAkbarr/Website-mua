// Nama file: components/reminder/ReminderCard.jsx
// Deskripsi: Komponen kartu untuk merender log reminder dengan aksi cepat kirim WhatsApp

import React from 'react';
import { MessageSquare, Calendar, Send } from 'lucide-react';
import { getWAUrl } from '../../utils/whatsappHelper';

const ReminderCard = ({ reminder, clientPhone, onSendSuccess }) => {
  const { tipe, pesan, sent_at } = reminder;

  // Hubungkan ke link wa.me
  const waUrl = getWAUrl(clientPhone, pesan);

  const getTypeLabel = (t) => {
    switch (t) {
      case 'H-3': return 'PENGINGAT H-3 ACARA';
      case 'H-1': return 'PENGINGAT H-1 ACARA';
      case 'H-0': return 'HARI H ACARA';
      case 'DEADLINE_H-1': return 'DEADLINE KONFIRMASI H-1';
      default: return t || 'REMINDER';
    }
  };

  const getTypeColor = (t) => {
    switch (t) {
      case 'H-0':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/45 dark:text-rose-400 dark:border-rose-900';
      case 'DEADLINE_H-1':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/45 dark:text-amber-400 dark:border-amber-900';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/45 dark:text-blue-400 dark:border-blue-900';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm hover:border-rose-100 dark:hover:border-gray-600 transition-all duration-150">
      
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-50 dark:border-gray-700/60 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wider ${getTypeColor(tipe)}`}>
          {getTypeLabel(tipe)}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {new Date(sent_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Konten Pesan */}
      <div className="flex items-start space-x-2.5">
        <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 flex-1 break-words font-mono whitespace-pre-line">
          {pesan}
        </p>
      </div>

      {/* Footer Aksi */}
      <div className="flex justify-end mt-4">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onSendSuccess}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm hover:shadow flex items-center space-x-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim WhatsApp Sekarang</span>
        </a>
      </div>

    </div>
  );
};

export default ReminderCard;
