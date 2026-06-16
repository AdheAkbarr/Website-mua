// Nama file: components/dashboard/RevenueChart.jsx
// Deskripsi: Komponen grafik batang Recharts untuk memvisualisasikan pendapatan bulanan

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatRupiah } from '../../utils/dateHelper';

const RevenueChart = ({ data = [] }) => {
  
  // Format angka Y-Axis menjadi ringkas (contoh: 1.5jt, 500rb)
  const formatYAxis = (value) => {
    if (value === 0) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' jt';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + ' rb';
    }
    return value;
  };

  // Kustom Tooltip untuk menampilkan Rupiah secara lengkap
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold text-rose-500">
              Pendapatan: <span className="font-bold text-gray-800 dark:text-white">{formatRupiah(payload[0].value)}</span>
            </p>
            {payload[1] && (
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Booking: <span className="font-bold text-gray-800 dark:text-white">{payload[1].value} Acara</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-colors duration-200">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-5">
        Grafik Pendapatan (6 Bulan Terakhir)
      </h4>
      
      <div className="w-full h-64 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {/* Efek gradien rose-500 ke rose-300 */}
              <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FB7185" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              stroke="#9CA3AF" 
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxis} 
              tickLine={false} 
              axisLine={false} 
              stroke="#9CA3AF" 
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF1F2', opacity: 0.4 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            <Bar 
              name="Pendapatan (DP)" 
              dataKey="pendapatan" 
              fill="url(#colorPendapatan)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={40}
            />
            <Bar 
              name="Jumlah Booking" 
              dataKey="jumlah_booking" 
              fill="#10B981" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={40}
              hide // Sembunyikan bar booking secara default agar grafik pendapatan dominan, tapi data tetap terpakai di tooltip
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
