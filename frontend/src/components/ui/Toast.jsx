// Nama file: components/ui/Toast.jsx
// Deskripsi: Komponen kontainer toast notifikasi yang terpaut ke state global toastStore

import React from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import useToastStore from '../../store/toastStore';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    },
    error: {
      bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500" />
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 w-full max-w-sm pointer-events-none px-4">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.info;
        return (
          <div
            key={toast.id}
            className={`flex items-start p-4 border rounded-xl shadow-lg pointer-events-auto animate-slide-in transition-all duration-200 ${config.bg} ${config.text}`}
            role="alert"
          >
            <div className="shrink-0">{config.icon}</div>
            <div className="flex-1 ml-3 text-sm font-medium pr-2 break-words">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
