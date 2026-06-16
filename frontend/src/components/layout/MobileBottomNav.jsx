// Nama file: components/layout/MobileBottomNav.jsx
// Deskripsi: Komponen menu navigasi bawah (bottom navigation) khusus layar HP / mobile-first

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Sparkles, FileBarChart2 } from 'lucide-react';

const MobileBottomNav = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Tambah', path: '/bookings/new', icon: PlusCircle },
    { name: 'Paket', path: '/packages', icon: Sparkles },
    { name: 'Laporan', path: '/reports', icon: FileBarChart2 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-rose-100 dark:border-gray-700 shadow-2xl transition-colors duration-200">
      <div className="flex justify-around items-center h-16 px-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full min-w-[64px] min-h-[44px] text-center transition-all ${
                  isActive
                    ? 'text-rose-500 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-rose-400'
                }`
              }
              end={item.path === '/'}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : ''
                  }`}>
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] tracking-wide mt-0.5">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
