// Nama file: routes/dashboard.js
// Deskripsi: Route Express untuk statistik dashboard ringkasan, upcoming, chart, dan notifikasi
// PERUBAHAN: Diubah dari synchronous better-sqlite3 ke async @libsql/client (Turso)

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/summary -> Mengambil data untuk 4 kartu statistik
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const curYearMonth = now.toISOString().slice(0, 7);

    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(now.setDate(diffToMonday + 6));
    const startOfWeek = monday.toISOString().slice(0, 10);
    const endOfWeek = sunday.toISOString().slice(0, 10);

    const [r1, r2, r3, r4, r5] = await Promise.all([
      db.execute({
        sql: `SELECT COUNT(*) as count FROM bookings WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'`,
        args: [curYearMonth],
      }),
      db.execute({
        sql: `SELECT SUM(dp_jumlah) as total FROM bookings WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'`,
        args: [curYearMonth],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM bookings WHERE dp_status = 'belum' AND status NOT IN ('cancelled', 'done')`,
        args: [],
      }),
      db.execute({
        sql: `SELECT SUM(harga_total - dp_jumlah) as total FROM bookings WHERE dp_status = 'belum' AND status NOT IN ('cancelled', 'done')`,
        args: [],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM bookings WHERE tanggal_acara >= ? AND tanggal_acara <= ? AND status != 'cancelled'`,
        args: [startOfWeek, endOfWeek],
      }),
    ]);

    return res.status(200).json({
      bookingsThisMonth: Number(r1.rows[0].count),
      revenueThisMonth: Number(r2.rows[0].total) || 0,
      unpaidDpCount: Number(r3.rows[0].count),
      unpaidDpAmount: Number(r4.rows[0].total) || 0,
      bookingsThisWeek: Number(r5.rows[0].count),
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil ringkasan dashboard: ' + error.message });
  }
});

// GET /api/dashboard/upcoming -> Booking 7 hari ke depan
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const endDate = next7Days.toISOString().slice(0, 10);

    const result = await db.execute({
      sql: `
        SELECT b.*, p.nama_paket
        FROM bookings b
        LEFT JOIN packages p ON b.paket_id = p.id
        WHERE b.tanggal_acara >= ? AND b.tanggal_acara <= ? AND b.status NOT IN ('cancelled', 'done')
        ORDER BY b.tanggal_acara ASC, b.jam_acara ASC
      `,
      args: [today, endDate],
    });

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil upcoming booking: ' + error.message });
  }
});

// GET /api/dashboard/revenue -> Data grafik pendapatan 6 bulan terakhir
router.get('/revenue', async (req, res) => {
  try {
    const monthsData = [];
    const now = new Date();

    const promises = [];
    const labels = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleString('id-ID', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2);

      labels.push(monthLabel);
      promises.push(
        db.execute({
          sql: `SELECT SUM(dp_jumlah) as income, COUNT(*) as count FROM bookings WHERE strftime('%Y-%m', tanggal_acara) = ? AND status != 'cancelled'`,
          args: [yearMonth],
        })
      );
    }

    const results = await Promise.all(promises);

    results.forEach((result, idx) => {
      monthsData.push({
        name: labels[idx],
        pendapatan: Number(result.rows[0].income) || 0,
        jumlah_booking: Number(result.rows[0].count) || 0,
      });
    });

    return res.status(200).json(monthsData);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data pendapatan bulanan: ' + error.message });
  }
});

// GET /api/dashboard/notifications -> Notifikasi reminder terbaru
router.get('/notifications', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [remindersResult, alertsResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT r.*, b.kode_booking, b.nama_client, b.tanggal_acara
          FROM reminder_log r
          JOIN bookings b ON r.booking_id = b.id
          ORDER BY r.sent_at DESC
          LIMIT 10
        `,
        args: [],
      }),
      db.execute({
        sql: `SELECT id as booking_id, kode_booking, nama_client, deadline_konfirmasi, status FROM bookings WHERE status = 'pending' AND deadline_konfirmasi < ?`,
        args: [today],
      }),
    ]);

    const systemAlerts = alertsResult.rows.map(alert => ({
      id: `alert-${alert.booking_id}`,
      booking_id: alert.booking_id,
      tipe: 'SYSTEM_ALERT',
      pesan: `Deadline konfirmasi MUA ${alert.nama_client} telah terlewat (${alert.deadline_konfirmasi})`,
      sent_at: alert.deadline_konfirmasi + ' 23:59:59',
    }));

    const allNotifications = [
      ...systemAlerts,
      ...remindersResult.rows.map(r => ({
        id: r.id,
        booking_id: r.booking_id,
        tipe: r.tipe,
        pesan: r.pesan,
        sent_at: r.sent_at,
        nama_client: r.nama_client,
        kode_booking: r.kode_booking,
      })),
    ].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

    return res.status(200).json(allNotifications.slice(0, 15));

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil notifikasi: ' + error.message });
  }
});

module.exports = router;
