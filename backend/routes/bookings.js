// Nama file: routes/bookings.js
// Deskripsi: Route Express untuk CRUD Booking, update status, riwayat reminder, dan status log
// PERUBAHAN: Diubah dari synchronous better-sqlite3 ke async @libsql/client (Turso)

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/bookings -> List booking dengan search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const { status, bulan, search, sort, order, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let conditions = [];
    let params = [];

    if (status && status !== 'all') {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (bulan) {
      conditions.push("strftime('%Y-%m', b.tanggal_acara) = ?");
      params.push(bulan);
    }

    if (search) {
      conditions.push('(b.nama_client LIKE ? OR b.kode_booking LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Hitung total data untuk pagination
    const countSql = `SELECT COUNT(*) as count FROM bookings b ${whereClause}`;
    const countResult = await db.execute({ sql: countSql, args: params });
    const totalCount = Number(countResult.rows[0].count);

    // Sorting
    let orderBy = 'ORDER BY b.tanggal_acara ASC, b.jam_acara ASC';
    if (sort) {
      const allowedSortFields = ['tanggal_acara', 'created_at', 'harga_total'];
      const sortField = allowedSortFields.includes(sort) ? `b.${sort}` : 'b.tanggal_acara';
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      orderBy = `ORDER BY ${sortField} ${sortOrder}`;
    }

    const querySql = `
      SELECT b.*, p.nama_paket, p.harga_dasar as paket_harga_dasar
      FROM bookings b
      LEFT JOIN packages p ON b.paket_id = p.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const queryResult = await db.execute({ sql: querySql, args: [...params, limitNum, offset] });
    const bookings = queryResult.rows;

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      bookings,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data booking: ' + error.message });
  }
});

// GET /api/bookings/:id -> Detail satu booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookingResult = await db.execute({
      sql: `
        SELECT b.*, p.nama_paket, p.deskripsi as paket_deskripsi, p.harga_dasar as paket_harga_dasar
        FROM bookings b
        LEFT JOIN packages p ON b.paket_id = p.id
        WHERE b.id = ?
      `,
      args: [id],
    });

    const booking = bookingResult.rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    const logsResult = await db.execute({
      sql: `SELECT * FROM status_log WHERE booking_id = ? ORDER BY changed_at DESC`,
      args: [id],
    });

    const remindersResult = await db.execute({
      sql: `SELECT * FROM reminder_log WHERE booking_id = ? ORDER BY sent_at DESC`,
      args: [id],
    });

    return res.status(200).json({
      booking,
      statusLogs: logsResult.rows,
      reminderLogs: remindersResult.rows,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil detail booking: ' + error.message });
  }
});

// POST /api/bookings -> Tambah booking baru
router.post('/', async (req, res) => {
  try {
    const {
      nama_client, no_hp, tanggal_acara, jam_acara, lokasi,
      jumlah_orang, paket_id, catatan, harga_total,
      dp_jumlah, dp_status, deadline_konfirmasi, status
    } = req.body;

    if (!nama_client || !no_hp || !tanggal_acara || !jam_acara || !lokasi || !paket_id) {
      return res.status(400).json({ error: 'Mohon isi semua field wajib.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const kode_booking = `MUA-${todayStr}-${randSuffix}`;

    const final_status = status || 'pending';
    let final_dp_status = 'belum';
    let final_dp_jumlah = 0;
    const parsed_harga_total = parseFloat(harga_total) || 0;

    if (final_status === 'confirmed') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total / 2;
    } else if (final_status === 'done') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total;
    }

    const result = await db.execute({
      sql: `
        INSERT INTO bookings (
          kode_booking, nama_client, no_hp, tanggal_acara, jam_acara,
          lokasi, jumlah_orang, paket_id, catatan, harga_total,
          dp_jumlah, dp_status, deadline_konfirmasi, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        kode_booking, nama_client, no_hp, tanggal_acara, jam_acara,
        lokasi, parseInt(jumlah_orang) || 1, paket_id, catatan || '',
        parsed_harga_total, final_dp_jumlah, final_dp_status,
        deadline_konfirmasi || null, final_status,
      ],
    });

    const newId = Number(result.lastInsertRowid);

    await db.execute({
      sql: `INSERT INTO status_log (booking_id, status_lama, status_baru, catatan) VALUES (?, NULL, 'pending', 'Booking baru berhasil dibuat.')`,
      args: [newId],
    });

    return res.status(201).json({
      message: 'Booking baru berhasil dibuat.',
      bookingId: newId,
      kode_booking,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal membuat booking: ' + error.message });
  }
});

// PUT /api/bookings/:id -> Update detail booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_client, no_hp, tanggal_acara, jam_acara, lokasi,
      jumlah_orang, paket_id, catatan, harga_total,
      dp_jumlah, dp_status, deadline_konfirmasi, status
    } = req.body;

    if (!nama_client || !no_hp || !tanggal_acara || !jam_acara || !lokasi || !paket_id) {
      return res.status(400).json({ error: 'Mohon isi semua field wajib.' });
    }

    const currentResult = await db.execute({ sql: 'SELECT status FROM bookings WHERE id = ?', args: [id] });
    const currentBooking = currentResult.rows[0];
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    const final_status = status || 'pending';
    let final_dp_status = 'belum';
    let final_dp_jumlah = 0;
    const parsed_harga_total = parseFloat(harga_total) || 0;

    if (final_status === 'confirmed') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total / 2;
    } else if (final_status === 'done') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total;
    }

    await db.execute({
      sql: `
        UPDATE bookings SET
          nama_client = ?, no_hp = ?, tanggal_acara = ?, jam_acara = ?,
          lokasi = ?, jumlah_orang = ?, paket_id = ?, catatan = ?,
          harga_total = ?, dp_jumlah = ?, dp_status = ?, deadline_konfirmasi = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        nama_client, no_hp, tanggal_acara, jam_acara,
        lokasi, parseInt(jumlah_orang) || 1, paket_id, catatan || '',
        parsed_harga_total, final_dp_jumlah, final_dp_status,
        deadline_konfirmasi || null, final_status, id,
      ],
    });

    if (final_status && final_status !== currentBooking.status) {
      await db.execute({
        sql: `INSERT INTO status_log (booking_id, status_lama, status_baru, catatan) VALUES (?, ?, ?, 'Diubah secara manual saat update booking.')`,
        args: [id, currentBooking.status, final_status],
      });
    }

    return res.status(200).json({ message: 'Booking berhasil diperbarui.' });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal memperbarui booking: ' + error.message });
  }
});

// DELETE /api/bookings/:id -> Hapus booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existResult = await db.execute({ sql: 'SELECT id FROM bookings WHERE id = ?', args: [id] });
    if (existResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    await db.execute({ sql: 'DELETE FROM status_log WHERE booking_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM reminder_log WHERE booking_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM bookings WHERE id = ?', args: [id] });

    return res.status(200).json({ message: 'Booking berhasil dihapus.' });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghapus booking: ' + error.message });
  }
});

// PATCH /api/bookings/:id/status -> Ubah status booking saja
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status baru wajib disertakan.' });
    }

    const currentResult = await db.execute({ sql: 'SELECT status, harga_total FROM bookings WHERE id = ?', args: [id] });
    const currentBooking = currentResult.rows[0];
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    let final_dp_status = 'belum';
    let final_dp_jumlah = 0;
    const parsed_harga_total = currentBooking.harga_total || 0;

    if (status === 'confirmed') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total / 2;
    } else if (status === 'done') {
      final_dp_status = 'lunas';
      final_dp_jumlah = parsed_harga_total;
    }

    await db.execute({
      sql: `UPDATE bookings SET status = ?, dp_status = ?, dp_jumlah = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [status, final_dp_status, final_dp_jumlah, id],
    });

    await db.execute({
      sql: `INSERT INTO status_log (booking_id, status_lama, status_baru, catatan) VALUES (?, ?, ?, ?)`,
      args: [id, currentBooking.status, status, catatan || 'Status diubah via Quick Action.'],
    });

    return res.status(200).json({
      message: 'Status booking berhasil diperbarui.',
      status_lama: currentBooking.status,
      status_baru: status,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengubah status booking: ' + error.message });
  }
});

// GET /api/bookings/:id/reminder -> Riwayat reminder booking
router.get('/:id/reminder', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: `SELECT * FROM reminder_log WHERE booking_id = ? ORDER BY sent_at DESC`,
      args: [id],
    });
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil riwayat reminder: ' + error.message });
  }
});

// POST /api/bookings/:id/reminder-manual -> Catat log reminder manual
router.post('/:id/reminder-manual', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipe, pesan } = req.body;

    if (!tipe || !pesan) {
      return res.status(400).json({ error: 'Tipe dan pesan wajib diisi.' });
    }

    await db.execute({
      sql: `INSERT INTO reminder_log (booking_id, tipe, pesan) VALUES (?, ?, ?)`,
      args: [id, tipe, pesan],
    });

    return res.status(200).json({ message: 'Log reminder manual berhasil disimpan.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menyimpan log reminder: ' + error.message });
  }
});

module.exports = router;
