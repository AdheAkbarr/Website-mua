// Nama file: components/ui/ConfirmDialog.jsx
// Deskripsi: Komponen Dialog Konfirmasi reusable untuk tindakan kritis/berbahaya (seperti hapus data)

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melakukan tindakan ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      iconBg: 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
    },
    warning: {
      buttonBg: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
    },
    info: {
      buttonBg: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400'
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-rose-50 dark:border-gray-700 overflow-hidden transform transition-all animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-rose-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${config.iconBg} shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          <div className="mt-3 ml-14">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 ${config.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;
