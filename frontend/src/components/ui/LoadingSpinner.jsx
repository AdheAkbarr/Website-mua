// Nama file: components/ui/LoadingSpinner.jsx
// Deskripsi: Komponen indikator loading (spinner) dengan opsi fullscreen atau inline

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, size = 'medium', text = 'Memuat data...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 text-rose-500',
    medium: 'w-8 h-8 text-rose-500',
    large: 'w-12 h-12 text-rose-500'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={`animate-spin ${sizeClasses[size] || sizeClasses.medium}`} />
      {text && (
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm transition-colors duration-200">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center py-8">{spinner}</div>;
};

export default LoadingSpinner;
