// Nama file: routes/bookings.js
// Deskripsi: Route Express untuk CRUD Booking, update status, riwayat reminder, dan status log

const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Gunakan auth middleware untuk semua endpoint booking
router.use(authMiddleware);

// GET /api/bookings -> List booking dengan search, filter, sort, pagination
router.get('/', (req, res) => {
  try {
    const { status, bulan, search, sort, order, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let conditions = [];
    let params = [];

    // Filter status
    if (status && status !== 'all') {
      conditions.push('b.status = ?');
      params.push(status);
    }

    // Filter bulan (Format: YYYY-MM)
    if (bulan) {
      conditions.push("strftime('%Y-%m', b.tanggal_acara) = ?");
      params.push(bulan);
    }

    // Search nama client / kode booking
    if (search) {
      conditions.push('(b.nama_client LIKE ? OR b.kode_booking LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Hitung total data untuk pagination
    const countSql = `
      SELECT COUNT(*) as count 
      FROM bookings b 
      ${whereClause}
    `;
    const totalCount = db.prepare(countSql).get(...params).count;

    // Sorting
    let orderBy = 'ORDER BY b.tanggal_acara ASC, b.jam_acara ASC';
    if (sort) {
      const allowedSortFields = ['tanggal_acara', 'created_at', 'harga_total'];
      const sortField = allowedSortFields.includes(sort) ? `b.${sort}` : 'b.tanggal_acara';
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      orderBy = `ORDER BY ${sortField} ${sortOrder}`;
    }

    // Query data
    const querySql = `
      SELECT b.*, p.nama_paket, p.harga_dasar as paket_harga_dasar
      FROM bookings b
      LEFT JOIN packages p ON b.paket_id = p.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limitNum, offset];
    const bookings = db.prepare(querySql).all(...queryParams);

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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const booking = db.prepare(`
      SELECT b.*, p.nama_paket, p.deskripsi as paket_deskripsi, p.harga_dasar as paket_harga_dasar
      FROM bookings b
      LEFT JOIN packages p ON b.paket_id = p.id
      WHERE b.id = ?
    `).get(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    // Ambil log status
    const logs = db.prepare(`
      SELECT * FROM status_log 
      WHERE booking_id = ? 
      ORDER BY changed_at DESC
    `).all(id);

    // Ambil log reminder
    const reminders = db.prepare(`
      SELECT * FROM reminder_log 
      WHERE booking_id = ? 
      ORDER BY sent_at DESC
    `).all(id);

    return res.status(200).json({
      booking,
      statusLogs: logs,
      reminderLogs: reminders
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil detail booking: ' + error.message });
  }
});

// POST /api/bookings -> Tambah booking baru
router.post('/', (req, res) => {
  try {
    const {
      nama_client,
      no_hp,
      tanggal_acara,
      jam_acara,
      lokasi,
      jumlah_orang,
      paket_id,
      catatan,
      harga_total,
      dp_jumlah,
      dp_status,
      deadline_konfirmasi,
      status
    } = req.body;

    // Validasi input wajib
    if (!nama_client || !no_hp || !tanggal_acara || !jam_acara || !lokasi || !paket_id) {
      return res.status(400).json({ error: 'Mohon isi semua field wajib.' });
    }

    // Auto-generate kode booking: MUA-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit angka acak
    const kode_booking = `MUA-${todayStr}-${randSuffix}`;

    // Jalankan transaksi
    const insertBooking = db.transaction(() => {
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

      const result = db.prepare(`
        INSERT INTO bookings (
          kode_booking, nama_client, no_hp, tanggal_acara, jam_acara, 
          lokasi, jumlah_orang, paket_id, catatan, harga_total, 
          dp_jumlah, dp_status, deadline_konfirmasi, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        kode_booking,
        nama_client,
        no_hp,
        tanggal_acara,
        jam_acara,
        lokasi,
        parseInt(jumlah_orang) || 1,
        paket_id,
        catatan || '',
        parsed_harga_total,
        final_dp_jumlah,
        final_dp_status,
        deadline_konfirmasi || null,
        final_status
      );


      const bookingId = result.lastInsertRowid;

      // Catat log status awal
      db.prepare(`
        INSERT INTO status_log (booking_id, status_lama, status_baru, catatan)
        VALUES (?, NULL, 'pending', 'Booking baru berhasil dibuat.')
      `).run(bookingId);

      return bookingId;
    });

    const newId = insertBooking();

    return res.status(201).json({
      message: 'Booking baru berhasil dibuat.',
      bookingId: newId,
      kode_booking
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal membuat booking: ' + error.message });
  }
});

// PUT /api/bookings/:id -> Update detail booking
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_client,
      no_hp,
      tanggal_acara,
      jam_acara,
      lokasi,
      jumlah_orang,
      paket_id,
      catatan,
      harga_total,
      dp_jumlah,
      dp_status,
      deadline_konfirmasi,
      status
    } = req.body;

    if (!nama_client || !no_hp || !tanggal_acara || !jam_acara || !lokasi || !paket_id) {
      return res.status(400).json({ error: 'Mohon isi semua field wajib.' });
    }

    const currentBooking = db.prepare('SELECT status FROM bookings WHERE id = ?').get(id);
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    const updateTx = db.transaction(() => {
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

      db.prepare(`
        UPDATE bookings SET
          nama_client = ?, no_hp = ?, tanggal_acara = ?, jam_acara = ?, 
          lokasi = ?, jumlah_orang = ?, paket_id = ?, catatan = ?, 
          harga_total = ?, dp_jumlah = ?, dp_status = ?, deadline_konfirmasi = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        nama_client,
        no_hp,
        tanggal_acara,
        jam_acara,
        lokasi,
        parseInt(jumlah_orang) || 1,
        paket_id,
        catatan || '',
        parsed_harga_total,
        final_dp_jumlah,
        final_dp_status,
        deadline_konfirmasi || null,
        final_status,
        id
      );

      // Jika status berubah, catat ke log
      if (final_status && final_status !== currentBooking.status) {
        db.prepare(`
          INSERT INTO status_log (booking_id, status_lama, status_baru, catatan)
          VALUES (?, ?, ?, 'Diubah secara manual saat update booking.')
        `).run(id, currentBooking.status, final_status);
      }
    });

    updateTx();

    return res.status(200).json({ message: 'Booking berhasil diperbarui.' });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal memperbarui booking: ' + error.message });
  }
});

// DELETE /api/bookings/:id -> Hapus booking
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const exist = db.prepare('SELECT id FROM bookings WHERE id = ?').get(id);
    if (!exist) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    // Transaksi hapus
    const deleteTx = db.transaction(() => {
      // Hapus status log terkait
      db.prepare('DELETE FROM status_log WHERE booking_id = ?').run(id);
      // Hapus reminder log terkait
      db.prepare('DELETE FROM reminder_log WHERE booking_id = ?').run(id);
      // Hapus booking utama
      db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    });

    deleteTx();

    return res.status(200).json({ message: 'Booking berhasil dihapus.' });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghapus booking: ' + error.message });
  }
});

// PATCH /api/bookings/:id/status -> Ubah status booking saja
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status baru wajib disertakan.' });
    }

    const currentBooking = db.prepare('SELECT status, harga_total FROM bookings WHERE id = ?').get(id);
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    const statusTx = db.transaction(() => {
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

      db.prepare(`
        UPDATE bookings SET status = ?, dp_status = ?, dp_jumlah = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, final_dp_status, final_dp_jumlah, id);

      db.prepare(`
        INSERT INTO status_log (booking_id, status_lama, status_baru, catatan)
        VALUES (?, ?, ?, ?)
      `).run(id, currentBooking.status, status, catatan || 'Status diubah via Quick Action.');
    });

    statusTx();

    return res.status(200).json({
      message: 'Status booking berhasil diperbarui.',
      status_lama: currentBooking.status,
      status_baru: status
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengubah status booking: ' + error.message });
  }
});

// GET /api/bookings/:id/reminder -> Riwayat reminder booking ini
router.get('/:id/reminder', (req, res) => {
  try {
    const { id } = req.params;
    const reminders = db.prepare(`
      SELECT * FROM reminder_log 
      WHERE booking_id = ? 
      ORDER BY sent_at DESC
    `).all(id);

    return res.status(200).json(reminders);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil riwayat reminder: ' + error.message });
  }
});

// POST /api/bookings/:id/reminder-manual -> Mencatat log reminder yang dikirim secara manual
router.post('/:id/reminder-manual', (req, res) => {
  try {
    const { id } = req.params;
    const { tipe, pesan } = req.body;

    if (!tipe || !pesan) {
      return res.status(400).json({ error: 'Tipe dan pesan wajib diisi.' });
    }

    db.prepare(`
      INSERT INTO reminder_log (booking_id, tipe, pesan)
      VALUES (?, ?, ?)
    `).run(id, tipe, pesan);

    return res.status(200).json({ message: 'Log reminder manual berhasil disimpan.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menyimpan log reminder: ' + error.message });
  }
});

module.exports = router;
