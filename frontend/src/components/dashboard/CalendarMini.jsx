// Nama file: components/dashboard/CalendarMini.jsx
// Deskripsi: Komponen kalender mini untuk dasbor utama, menyoroti tanggal-tanggal dengan booking MUA

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarMini = ({ bookings = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nama-nama bulan dalam bahasa Indonesia
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Cari tanggal awal dan akhir bulan
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Kembalikan tanggal ke bulan sebelumnya/selanjutnya
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Kumpulkan booking berdasarkan tanggal acara (Format: YYYY-MM-DD)
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateStr = booking.tanggal_acara; // format: 'YYYY-MM-DD'
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(booking);
    return acc;
  }, {});

  // Generate baris hari
  const cells = [];
  
  // Kosongkan sel sebelum tanggal 1
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }

  // Isi sel hari dalam sebulan
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = bookingsByDate[dayStr] || [];
    const hasBooking = dayBookings.length > 0;
    
    const isToday = 
      new Date().getDate() === day && 
      new Date().getMonth() === month && 
      new Date().getFullYear() === year;

    cells.push(
      <div 
        key={`day-${day}`}
        className="relative flex flex-col items-center justify-center h-8 w-8 text-xs font-semibold rounded-full select-none"
      >
        <span className={`
          flex items-center justify-center w-7 h-7 rounded-full transition-all duration-150
          ${isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-200'}
          ${hasBooking && !isToday ? 'bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold' : ''}
        `}>
          {day}
        </span>
        
        {/* Dot indikator booking */}
        {hasBooking && (
          <span className={`
            absolute bottom-0.5 w-1.5 h-1.5 rounded-full
            ${isToday ? 'bg-white' : 'bg-rose-500'}
          `} 
          title={`${dayBookings.length} booking pada hari ini`}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-colors duration-200">
      
      {/* Header Kalender */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-rose-50 dark:border-gray-700">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white">
          {monthNames[month]} {year}
        </h4>
        <div className="flex space-x-1">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Baris Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
        {daysOfWeek.map(d => (
          <div key={d} className="h-5 flex items-center justify-center">{d}</div>
        ))}
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
        {cells}
      </div>

      {/* Keterangan */}
      <div className="mt-4 pt-3 border-t border-rose-50 dark:border-gray-700 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Ada Booking</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-500 flex items-center justify-center text-white text-[8px]">*</span>
          <span>Hari Ini</span>
        </div>
      </div>

    </div>
  );
};

export default CalendarMini;
