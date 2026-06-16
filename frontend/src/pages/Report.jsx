// Nama file: pages/Report.jsx
// Deskripsi: Halaman Laporan Bulanan MUA - rekap keuangan, grafik pie status booking, ekspor CSV & cetak laporan PDF

import React, { useEffect, useState } from 'react';
import { FileBarChart2, Calendar, FileText, Download, TrendingUp, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDateIndo, formatRupiah, getTodayDateString } from '../utils/dateHelper';
import { exportToCSV } from '../utils/exportCSV';
import { exportElementToPDF } from '../utils/exportPDF';

const Report = () => {
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]);

  // Filter Rentang Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Rincian Hasil Filter
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalRevenue: 0,
    totalDp: 0,
    totalOutstanding: 0,
    countPending: 0,
    countConfirmed: 0,
    countDone: 0,
    countCancelled: 0
  });

  // Ambil semua data booking (limit besar) untuk difilter secara lokal
  const fetchAllBookingsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings', {
        params: { limit: 1000, sort: 'tanggal_acara', order: 'asc' }
      });
      setAllBookings(response.data.bookings || []);
    } catch (error) {
      showToast('Gagal memuat data laporan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookingsData();
    
    // Inisialisasi filter bulan ini
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatD = (d) => d.toISOString().slice(0, 10);
    setStartDate(formatD(start));
    setEndDate(formatD(end));
  }, []);

  // Proses perhitungan statistik setiap kali rentang tanggal atau data berubah
  useEffect(() => {
    if (!startDate || !endDate || allBookings.length === 0) {
      setFilteredBookings([]);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filtered = allBookings.filter((b) => {
      const bDate = new Date(b.tanggal_acara);
      return bDate >= start && bDate <= end;
    });

    // Hitung statistik
    let totalRev = 0;
    let totalDpVal = 0;
    let totalOut = 0;
    let pending = 0;
    let confirmed = 0;
    let done = 0;
    let cancelled = 0;

    for (const b of filtered) {
      if (b.status !== 'cancelled') {
        totalRev += b.harga_total;
        totalDpVal += b.dp_jumlah;
        
        if (b.status !== 'done') {
          totalOut += (b.harga_total - b.dp_jumlah);
        }
      }

      if (b.status === 'pending') pending++;
      else if (b.status === 'confirmed') confirmed++;
      else if (b.status === 'done') done++;
      else if (b.status === 'cancelled') cancelled++;
    }

    setFilteredBookings(filtered);
    setStats({
      totalCount: filtered.length,
      totalRevenue: totalRev,
      totalDp: totalDpVal,
      totalOutstanding: totalOut,
      countPending: pending,
      countConfirmed: confirmed,
      countDone: done,
      countCancelled: cancelled
    });

  }, [startDate, endDate, allBookings]);

  // Data untuk Pie Chart Status Booking
  const pieData = [
    { name: 'Pending', value: stats.countPending, color: '#F59E0B' }, // amber-500
    { name: 'Confirmed', value: stats.countConfirmed, color: '#3B82F6' }, // blue-500
    { name: 'Selesai', value: stats.countDone, color: '#10B981' }, // emerald-500
    { name: 'Dibatalkan', value: stats.countCancelled, color: '#EF4444' } // red-500
  ].filter(item => item.value > 0); // Hanya tampilkan status yang ada nilainya

  // Ekspor CSV
  const handleExportCSV = () => {
    const filename = `laporan-mua-${startDate}-to-${endDate}.csv`;
    exportToCSV(filteredBookings, filename);
    showToast('Berhasil mengekspor rekap CSV!', 'success');
  };

  // Cetak PDF Laporan Ringkasan
  const handlePrintPDF = async () => {
    setLoading(true);
    const filename = `laporan-ringkasan-mua-${startDate}-to-${endDate}.pdf`;
    await exportElementToPDF('report-print-area', filename);
    setLoading(false);
    showToast('Laporan PDF berhasil diunduh!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
            <FileBarChart2 className="w-6 h-6 text-rose-500 mr-2 shrink-0" />
            Laporan & Keuangan MUA
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Analisis rekap pendapatan, status DP client, status booking, dan ekspor laporan.
          </p>
        </div>

        {/* Buttons Ekspor */}
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredBookings.length === 0}
            className="px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1.5 focus:outline-none"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          
          <button
            onClick={handlePrintPDF}
            disabled={filteredBookings.length === 0}
            className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center space-x-1.5 transition-all focus:outline-none"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Rentang Tanggal */}
      <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm transition-colors duration-200">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">Tanggal Awal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">Tanggal Akhir:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={fetchAllBookingsData}
            className="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-lg text-[10px] font-bold"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Area Cetak Laporan (Target PDF) */}
      <div id="report-print-area" className="space-y-6 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-sm transition-colors duration-200">
        
        {/* Kop Laporan (Hanya tampil di cetak, dipaksa lewat style print area) */}
        <div className="border-b border-rose-100 dark:border-gray-700 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-black text-rose-500 uppercase tracking-wider">ELLA MAKEUP</h2>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-1">Laporan Ringkasan Booking Bulanan</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Periode Acara: {formatDateIndo(startDate)} s/d {formatDateIndo(endDate)}
            </p>
          </div>
          <div className="text-right text-[10px] text-gray-400 dark:text-gray-500 font-mono">
            Dicetak: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
          </div>
        </div>

        {/* 3 Stat Card Keuangan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total Reservasi Acara */}
          <div className="p-4 bg-rose-50/40 dark:bg-gray-700/35 border border-rose-100/50 dark:border-gray-700 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">TOTAL RESERVASI</span>
              <span className="text-xl font-black text-gray-800 dark:text-white mt-1 block">{stats.totalCount} Acara</span>
            </div>
            <TrendingUp className="w-8 h-8 text-rose-500 opacity-60" />
          </div>

          {/* Uang Masuk DP */}
          <div className="p-4 bg-emerald-50/40 dark:bg-gray-700/35 border border-emerald-100/50 dark:border-gray-700 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">PENDAPATAN (DP)</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">{formatRupiah(stats.totalDp)}</span>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500 opacity-60" />
          </div>

          {/* Sisa Piutang */}
          <div className="p-4 bg-amber-50/40 dark:bg-gray-700/35 border border-amber-100/50 dark:border-gray-700 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">PIUTANG (BELUM LUNAS)</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">{formatRupiah(stats.totalOutstanding)}</span>
            </div>
            <Info className="w-8 h-8 text-amber-500 opacity-60" />
          </div>

        </div>

        {/* Section Tengah: Detail status & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-rose-50 dark:border-gray-700">
          
          {/* Ringkasan Jumlah Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Rekap Status Booking
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 border border-amber-100 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] text-amber-600 font-bold">PENDING</span>
                <span className="text-lg font-black text-gray-800 dark:text-white mt-1">{stats.countPending} Reservasi</span>
              </div>
              <div className="p-3.5 border border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] text-blue-600 font-bold">CONFIRMED</span>
                <span className="text-lg font-black text-gray-800 dark:text-white mt-1">{stats.countConfirmed} Reservasi</span>
              </div>
              <div className="p-3.5 border border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] text-emerald-600 font-bold">SELESAI ACARA</span>
                <span className="text-lg font-black text-gray-800 dark:text-white mt-1">{stats.countDone} Reservasi</span>
              </div>
              <div className="p-3.5 border border-red-100 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] text-red-600 font-bold">DIBATALKAN</span>
                <span className="text-lg font-black text-gray-800 dark:text-white mt-1">{stats.countCancelled} Reservasi</span>
              </div>
            </div>
          </div>

          {/* Pie Chart Visualisasi */}
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 flex flex-col justify-center items-center h-52">
            {pieData.length === 0 ? (
              <span className="text-xs text-gray-400 dark:text-gray-500">Tidak ada data visualisasi untuk ditampilkan.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Acara`, 'Jumlah']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Tabel Ringkasan Booking Terpilih */}
        <div className="pt-6 border-t border-rose-50 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Daftar Lengkap Booking Periode Ini
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase">
                  <th className="py-2">Kode</th>
                  <th className="py-2">Client / WA</th>
                  <th className="py-2">Tanggal & Jam</th>
                  <th className="py-2">Paket</th>
                  <th className="py-2 text-right">Harga Total</th>
                  <th className="py-2 text-right">DP Terbayar</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5 font-bold text-gray-900 dark:text-white">{b.kode_booking}</td>
                    <td className="py-2.5">
                      <span className="font-semibold block">{b.nama_client}</span>
                      <span>{b.no_hp}</span>
                    </td>
                    <td className="py-2.5">
                      <span>{formatDateIndo(b.tanggal_acara)}</span>
                      <span className="block text-gray-400 text-[8px]">{b.jam_acara} WIB</span>
                    </td>
                    <td className="py-2.5">{b.nama_paket || 'Kustom'}</td>
                    <td className="py-2.5 text-right font-semibold">{formatRupiah(b.harga_total)}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-semibold">{formatRupiah(b.dp_jumlah)}</td>
                    <td className="py-2.5 text-center">
                      <span className="uppercase text-[8px] font-bold tracking-wide">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Report;
