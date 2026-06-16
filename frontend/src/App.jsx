// Nama file: App.jsx
// Deskripsi: Komponen utama Frontend - mendefinisikan rute halaman (React Router v6), pelindung rute, dan tata letak (layout)

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

// Layout & UI
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Toast from './components/ui/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookingList from './pages/BookingList';
import BookingForm from './pages/BookingForm';
import BookingDetail from './pages/BookingDetail';
import PackageManager from './pages/PackageManager';
import Report from './pages/Report';
import Register from './pages/Register';

// State Store
import useAuthStore from './store/authStore';

// Pelindung Rute (AuthGuard) - Hanya izinkan masuk jika terautentikasi
const AuthGuard = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Simpan lokasi awal untuk redirect pasca login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Pelindung Rute Khusus Admin (AdminGuard)
const AdminGuard = ({ children }) => {
  const { user } = useAuthStore();
  if (user?.username !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};


// Tata Letak Utama (Layout) dengan Sidebar desktop dan Bottom Nav mobile
const Layout = () => {
  return (
    <div className="flex min-h-screen bg-rose-50/20 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* Sidebar - Tampil hanya di Desktop (lg) */}
      <Sidebar />

      {/* Kontainer Utama */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 overflow-x-hidden">
        
        {/* Navbar Atas */}
        <Navbar />

        {/* Area Viewport Halaman */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav - Tampil hanya di HP (mobile/tablet) */}
      <MobileBottomNav />

    </div>
  );
};

function App() {
  const { checkAuth } = useAuthStore();

  // Jalankan cek token di awal muatan aplikasi
  useEffect(() => {
    checkAuth();
    
    // Inisialisasi tema dark/light dari preferensi lokal
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [checkAuth]);

  return (
    <>
      {/* Container Toast Notifikasi Global */}
      <Toast />

      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi JWT */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/new" element={<BookingForm />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/bookings/:id/edit" element={<BookingForm />} />
            <Route path="/packages" element={<PackageManager />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/register" element={<AdminGuard><Register /></AdminGuard>} />
          </Route>
        </Route>

        {/* Rute Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
