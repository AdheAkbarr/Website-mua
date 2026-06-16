// Nama file: components/layout/Sidebar.jsx
// Deskripsi: Komponen menu navigasi samping (sidebar) khusus layar desktop

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Sparkles, FileBarChart2, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daftar Booking', path: '/bookings', icon: CalendarDays },
    { name: 'Tambah Booking', path: '/bookings/new', icon: PlusCircle },
    { name: 'Pricelist Ella Makeup', path: '/packages', icon: Sparkles },
    { name: 'Laporan & Ekspor', path: '/reports', icon: FileBarChart2 },
  ];

  if (user?.username === 'admin') {
    menuItems.push({ name: 'Kelola Akun Staff', path: '/register', icon: UserPlus });
  }


  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-gray-800 border-r border-rose-100 dark:border-gray-700 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="flex items-center h-16 px-6 border-b border-rose-50 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-bold shadow-md shadow-rose-200 dark:shadow-none">
            E
          </div>
          <span className="text-lg font-bold tracking-wider text-rose-500 dark:text-rose-400">
            Ella<span className="text-gray-800 dark:text-white">Makeup</span>
          </span>
        </div>
      </div>


      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-gray-700/50 dark:hover:text-white'
                }`
              }
              end={item.path === '/'}
            >
              {({ isActive }) => (
                <>
                  <IconComponent
                    className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400 group-hover:text-rose-500 dark:group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-rose-50 dark:border-gray-700 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Ella Makeup System v1.0.0<br />
          © {new Date().getFullYear()}
        </p>
      </div>

    </aside>
  );
};

export default Sidebar;
