// Nama file: components/layout/Navbar.jsx
// Deskripsi: Komponen header navigasi atas dengan fitur Dark Mode, Notifikasi Bell, dan Profile

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ReminderBell from '../reminder/ReminderBell';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Inisialisasi & Toggle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-rose-100 shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
      {/* Bagian Kiri: Hamburguer Menu & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-wider text-rose-500 dark:text-rose-400">
            Ella<span className="text-gray-800 dark:text-white">Makeup</span>
          </span>
        </div>
      </div>

      {/* Bagian Kanan: Dark Mode, Bell, Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Toggle Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 rounded-lg hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          title={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        {/* Notifikasi Bell */}
        <ReminderBell />

        {/* Info User Dropdown */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
              {user?.nama || 'MUA Admin'}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              @{user?.username || 'admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;

