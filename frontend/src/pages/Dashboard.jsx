// Nama file: pages/Dashboard.jsx
// Deskripsi: Halaman Dashboard Utama - menampilkan ringkasan metrik, grafik, kalender, dan jadwal MUA terdekat

import React, { useEffect, useState } from 'react';
import { Sparkles, CalendarDays, Coins, AlertCircle, Calendar } from 'lucide-react';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CalendarMini from '../components/dashboard/CalendarMini';
import UpcomingList from '../components/dashboard/UpcomingList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRupiah } from '../utils/dateHelper';

const Dashboard = () => {
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);

  // States data dashboard
  const [summary, setSummary] = useState({
    bookingsThisMonth: 0,
    revenueThisMonth: 0,
    unpaidDpCount: 0,
    unpaidDpAmount: 0,
    bookingsThisWeek: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [calendarBookings, setCalendarBookings] = useState([]);

  // Fetch data dashboard dari server
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes, upcomingRes, bookingsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/revenue'),
        api.get('/dashboard/upcoming'),
        // Ambil data bookings untuk kalender mini (ambil halaman 1 dengan limit 100)
        api.get('/bookings?limit=100')
      ]);

      setSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
      setUpcoming(upcomingRes.data);
      setCalendarBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data dashboard. Periksa koneksi backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Menghitung statistik terbaru..." fullPage />;
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
            <Sparkles className="w-6 h-6 text-rose-500 mr-2 shrink-0 animate-pulse" />
            Ringkasan Studio MUA
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Monitor pesanan, pembayaran, dan jadwal makeup artis secara real-time.
          </p>
        </div>
      </div>

      {/* Grid 4 Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Booking Bulan Ini */}
        <StatCard
          title="Booking Bulan Ini"
          value={`${summary.bookingsThisMonth} Acara`}
          icon={<CalendarDays className="w-6 h-6" />}
          subtext="Jadwal makeup aktif"
          type="rose"
        />

        {/* 2. Total Pendapatan Bulan Ini */}
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(summary.revenueThisMonth)}
          icon={<Coins className="w-6 h-6" />}
          subtext="DP yang sudah masuk"
          type="emerald"
        />

        {/* 3. Sisa DP belum lunas */}
        <StatCard
          title="DP Belum Lunas"
          value={formatRupiah(summary.unpaidDpAmount)}
          icon={<AlertCircle className="w-6 h-6" />}
          subtext={`${summary.unpaidDpCount} Klien belum melunasi DP`}
          type="amber"
        />

        {/* 4. Booking Minggu Ini */}
        <StatCard
          title="Booking Minggu Ini"
          value={`${summary.bookingsThisWeek} Acara`}
          icon={<Calendar className="w-6 h-6" />}
          subtext="Jadwal dalam 7 hari ini"
          type="blue"
        />

      </div>

      {/* Grid Utama: Chart, Kalender & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Pendapatan 6 Bulan */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Kalender Mini */}
        <div>
          <CalendarMini bookings={calendarBookings} />
        </div>

      </div>

      {/* Row Bawah: Daftar Upcoming Bookings */}
      <div className="w-full">
        <UpcomingList bookings={upcoming} />
      </div>

    </div>
  );
};

export default Dashboard;
