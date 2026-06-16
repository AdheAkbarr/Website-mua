// Nama file: scheduler.js
// Deskripsi: Scheduler menggunakan node-cron untuk mencatat reminder otomatis (H-3, H-1, H-0)

const cron = require('node-cron');
const db = require('./db');

// Fungsi pembantu menghitung selisih hari (d1 - d2)
function getDiffDays(date1Str, date2Str) {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  
  // Set ke jam 12 siang untuk menghindari deviasi timezone/DST
  d1.setHours(12, 0, 0, 0);
  d2.setHours(12, 0, 0, 0);
  
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Fungsi utama pengecekan booking dan pencatatan reminder
function checkAndLogReminders() {
  try {
    const today = new Date();
    // Menggunakan waktu lokal Indonesia Barat (WIB) atau default lokal server
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');

    // Ambil semua booking yang statusnya pending atau confirmed
    const bookings = db.prepare(`
      SELECT b.*, p.nama_paket 
      FROM bookings b
      LEFT JOIN packages p ON b.paket_id = p.id
      WHERE b.status IN ('pending', 'confirmed')
    `).all();

    for (const booking of bookings) {
      const diffEvent = getDiffDays(booking.tanggal_acara, todayStr);
      let tipe = null;
      let templatePesan = '';

      // Tentukan tipe reminder tanggal acara
      if (diffEvent === 3) {
        tipe = 'H-3';
      } else if (diffEvent === 1) {
        tipe = 'H-1';
      } else if (diffEvent === 0) {
        tipe = 'H-0';
      }

      // Tentukan tipe reminder deadline konfirmasi (jika ada deadline & status pending)
      let tipeDeadline = null;
      let pesanDeadline = '';
      if (booking.status === 'pending' && booking.deadline_konfirmasi) {
        const diffDeadline = getDiffDays(booking.deadline_konfirmasi, todayStr);
        if (diffDeadline === 1) {
          tipeDeadline = 'DEADLINE_H-1';
          pesanDeadline = `Halo ${booking.nama_client}, ini adalah pengingat bahwa batas waktu (deadline) konfirmasi untuk booking makeup Anda adalah besok (${booking.deadline_konfirmasi}). Mohon segera konfirmasi agar slot Anda tetap aman. Terima kasih! 🌸`;
        }
      }

      const sisa = booking.harga_total - booking.dp_jumlah;
      const sisaFormat = sisa.toLocaleString('id-ID');

      // Proses reminder tanggal acara
      if (tipe) {
        templatePesan = `Halo ${booking.nama_client}, reminder booking makeup tanggal ${booking.tanggal_acara}.\nPaket: ${booking.nama_paket}, Lokasi: ${booking.lokasi}.\nSisa pembayaran: Rp ${sisaFormat}.\nHubungi kami jika ada perubahan 🌸`;
        
        // Periksa apakah reminder dengan tipe & tanggal hari ini sudah pernah dibuat sebelumnya
        const exists = db.prepare(`
          SELECT id FROM reminder_log 
          WHERE booking_id = ? AND tipe = ? AND date(sent_at) = ?
        `).get(booking.id, tipe, todayStr);

        if (!exists) {
          db.prepare(`
            INSERT INTO reminder_log (booking_id, tipe, pesan)
            VALUES (?, ?, ?)
          `).run(booking.id, tipe, templatePesan);
          // console.log(`[Scheduler] Reminder ${tipe} dicatat untuk Booking ID ${booking.id}`);
        }
      }

      // Proses reminder deadline konfirmasi
      if (tipeDeadline) {
        const existsDeadline = db.prepare(`
          SELECT id FROM reminder_log 
          WHERE booking_id = ? AND tipe = ? AND date(sent_at) = ?
        `).get(booking.id, tipeDeadline, todayStr);

        if (!existsDeadline) {
          db.prepare(`
            INSERT INTO reminder_log (booking_id, tipe, pesan)
            VALUES (?, ?, ?)
          `).run(booking.id, tipeDeadline, pesanDeadline);
          // console.log(`[Scheduler] Reminder ${tipeDeadline} dicatat untuk Booking ID ${booking.id}`);
        }
      }
    }
  } catch (error) {
    // Tampilkan error secara aman tanpa merusak process di production
    console.error('Error saat menjalankan scheduler pencatatan reminder:', error.message);
  }
}

// Inisialisasi scheduler
function initScheduler() {
  // Jalankan setiap jam di menit ke-0: '0 * * * *'
  // Untuk keperluan development / simulasi, kita jalankan sekali saat backend start
  checkAndLogReminders();

  cron.schedule('0 * * * *', () => {
    // console.log('[Scheduler] Memulai pengecekan reminder otomatis...');
    checkAndLogReminders();
  });
}

module.exports = { initScheduler, checkAndLogReminders };
