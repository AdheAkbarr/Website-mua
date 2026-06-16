// Nama file: routes/dashboard.js
// Deskripsi: Route Express untuk statistik dashboard ringkasan, upcoming, chart, dan notifikasi

const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/summary -> Mengambil data untuk 4 kartu statistik
router.get('/summary', (req, res) => {
  try {
    const now = new Date();
    const curYearMonth = now.toISOString().slice(0, 7); // Format: YYYY-MM

    // Hitung tanggal awal dan akhir minggu ini (Senin - Minggu)
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(now.setDate(diffToMonday + 6));
    const startOfWeek = monday.toISOString().slice(0, 10);
    const endOfWeek = sunday.toISOString().slice(0, 10);

    // 1. Total booking bulan ini (tanggal_acara di bulan ini)
    const bookingsThisMonth = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'
    `).get(curYearMonth).count;

    // 2. Total pendapatan bulan ini (jumlah DP + pelunasan jika lunas dari booking bulan ini,
    //    atau sederhananya jumlah DP yang terkumpul dari booking bulan ini)
    const revenueThisMonth = db.prepare(`
      SELECT SUM(dp_jumlah) as total 
      FROM bookings 
      WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'
    `).get(curYearMonth).total || 0;

    // 3. Jumlah booking yang DP-nya belum lunas (dp_status = 'belum' & status aktif)
    const unpaidDpCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE dp_status = 'belum' AND status NOT IN ('cancelled', 'done')
    `).get().count;

    const unpaidDpAmount = db.prepare(`
      SELECT SUM(harga_total - dp_jumlah) as total 
      FROM bookings 
      WHERE dp_status = 'belum' AND status NOT IN ('cancelled', 'done')
    `).get().total || 0;

    // 4. Booking minggu ini (tanggal_acara antara senin-minggu)
    const bookingsThisWeek = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE tanggal_acara >= ? AND tanggal_acara <= ? AND status != 'cancelled'
    `).get(startOfWeek, endOfWeek).count;

    return res.status(200).json({
      bookingsThisMonth,
      revenueThisMonth,
      unpaidDpCount,
      unpaidDpAmount,
      bookingsThisWeek
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil ringkasan dashboard: ' + error.message });
  }
});

// GET /api/dashboard/upcoming -> Booking 7 hari ke depan
router.get('/upcoming', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const endDate = next7Days.toISOString().slice(0, 10);

    const upcoming = db.prepare(`
      SELECT b.*, p.nama_paket 
      FROM bookings b
      LEFT JOIN packages p ON b.paket_id = p.id
      WHERE b.tanggal_acara >= ? AND b.tanggal_acara <= ? AND b.status NOT IN ('cancelled', 'done')
      ORDER BY b.tanggal_acara ASC, b.jam_acara ASC
    `).all(today, endDate);

    return res.status(200).json(upcoming);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil upcoming booking: ' + error.message });
  }
});

// GET /api/dashboard/revenue -> Data grafik pendapatan 6 bulan terakhir
router.get('/revenue', (req, res) => {
  try {
    const monthsData = [];
    const now = new Date();

    // Loop 6 bulan ke belakang
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().slice(0, 7); // YYYY-MM
      
      // Nama bulan untuk label (contoh: "Jan", "Feb", dsb)
      const monthLabel = d.toLocaleString('id-ID', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2);

      // Hitung pendapatan (DP terkumpul) di bulan tersebut
      const result = db.prepare(`
        SELECT SUM(dp_jumlah) as income, COUNT(*) as count
        FROM bookings 
        WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'
      `).get(yearMonth);

      monthsData.push({
        name: monthLabel,
        pendapatan: result.income || 0,
        jumlah_booking: result.count || 0
      });
    }

    return res.status(200).json(monthsData);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data pendapatan bulanan: ' + error.message });
  }
});

// GET /api/dashboard/notifications -> Notifikasi reminder terbaru untuk bell icon
router.get('/notifications', (req, res) => {
  try {
    // 10 reminder log terakhir
    const reminders = db.prepare(`
      SELECT r.*, b.kode_booking, b.nama_client, b.tanggal_acara
      FROM reminder_log r
      JOIN bookings b ON r.booking_id = b.id
      ORDER BY r.sent_at DESC
      LIMIT 10
    `).all();

    // Cek booking pending yang terlewat deadline konfirmasi
    const today = new Date().toISOString().slice(0, 10);
    const systemAlerts = db.prepare(`
      SELECT id as booking_id, kode_booking, nama_client, deadline_konfirmasi, status
      FROM bookings
      WHERE status = 'pending' AND deadline_konfirmasi < ?
    `).all(today).map(alert => ({
      id: `alert-${alert.booking_id}`,
      booking_id: alert.booking_id,
      tipe: 'SYSTEM_ALERT',
      pesan: `Deadline konfirmasi MUA ${alert.nama_client} telah terlewat (${alert.deadline_konfirmasi})`,
      sent_at: alert.deadline_konfirmasi + ' 23:59:59'
    }));

    // Gabungkan log reminder dan sistem alert
    const allNotifications = [...systemAlerts, ...reminders.map(r => ({
      id: r.id,
      booking_id: r.booking_id,
      tipe: r.tipe,
      pesan: r.pesan,
      sent_at: r.sent_at,
      nama_client: r.nama_client,
      kode_booking: r.kode_booking
    }))].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

    return res.status(200).json(allNotifications.slice(0, 15));

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil notifikasi: ' + error.message });
  }
});

module.exports = router;
