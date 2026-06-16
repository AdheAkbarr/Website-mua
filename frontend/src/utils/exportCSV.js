// Nama file: utils/exportCSV.js
// Deskripsi: Utilitas untuk mengubah data array booking menjadi file CSV yang siap diunduh

/**
 * Mengekspor daftar booking menjadi file CSV dan memicu unduhan di browser
 * @param {Array} bookingsData - Array berisi objek booking
 * @param {string} filename - Nama file output CSV
 */
export const exportToCSV = (bookingsData, filename = 'rekap-booking.csv') => {
  if (!bookingsData || bookingsData.length === 0) {
    alert('Tidak ada data booking untuk diekspor.');
    return;
  }

  // Header kolom CSV
  const headers = [
    'Kode Booking',
    'Nama Client',
    'No HP',
    'Tanggal Acara',
    'Jam Acara',
    'Lokasi',
    'Jumlah Orang',
    'Paket Makeup',
    'Harga Total (IDR)',
    'DP Jumlah (IDR)',
    'Status DP',
    'Deadline Konfirmasi',
    'Status Booking',
    'Catatan',
    'Tanggal Dibuat'
  ];

  // Map data objek ke dalam array baris
  const rows = bookingsData.map((booking) => {
    return [
      booking.kode_booking || '',
      booking.nama_client || '',
      booking.no_hp || '',
      booking.tanggal_acara || '',
      booking.jam_acara || '',
      // Bersihkan lokasi dari karakter baris baru agar tidak merusak format CSV
      (booking.lokasi || '').replace(/\r?\n|\r/g, ' '),
      booking.jumlah_orang || 1,
      booking.nama_paket || 'Kustom',
      booking.harga_total || 0,
      booking.dp_jumlah || 0,
      booking.dp_status || 'belum',
      booking.deadline_konfirmasi || '-',
      booking.status || 'pending',
      // Bersihkan catatan dari karakter baris baru
      (booking.catatan || '').replace(/\r?\n|\r/g, ' '),
      booking.created_at || ''
    ];
  });

  // Gabungkan header dan baris dengan pembatas koma
  // Gunakan pembatas koma (,) dan bungkus nilai dengan tanda kutip ganda (") untuk mencegah error escape karakter
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(val => {
        const strVal = String(val);
        // Jika ada koma, kutip ganda, atau baris baru di dalam nilai, bungkus dengan kutip ganda dan escape kutip ganda aslinya
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',')
    )
  ].join('\n');

  // Tambahkan Byte Order Mark (BOM) untuk karakter UTF-8 agar Excel mendeteksi encoding dengan benar
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Buat link download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export default exportToCSV;
