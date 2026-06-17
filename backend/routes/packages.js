// Nama file: routes/packages.js
// Deskripsi: Route Express untuk CRUD Paket Makeup dan Toggle Status Aktif
// PERUBAHAN: Diubah dari synchronous better-sqlite3 ke async @libsql/client (Turso)

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/packages -> Ambil semua paket
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT p.*, COUNT(b.id) as total_bookings
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.paket_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data paket: ' + error.message });
  }
});

// POST /api/packages -> Tambah paket baru
router.post('/', async (req, res) => {
  try {
    const { nama_paket, deskripsi, harga_dasar } = req.body;

    if (!nama_paket || harga_dasar === undefined) {
      return res.status(400).json({ error: 'Nama paket dan harga dasar wajib diisi.' });
    }

    const result = await db.execute({
      sql: `INSERT INTO packages (nama_paket, deskripsi, harga_dasar, aktif) VALUES (?, ?, ?, 1)`,
      args: [nama_paket, deskripsi || '', parseFloat(harga_dasar)],
    });

    return res.status(201).json({
      message: 'Paket baru berhasil ditambahkan.',
      packageId: Number(result.lastInsertRowid),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menambahkan paket: ' + error.message });
  }
});

// PUT /api/packages/:id -> Perbarui paket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_paket, deskripsi, harga_dasar } = req.body;

    if (!nama_paket || harga_dasar === undefined) {
      return res.status(400).json({ error: 'Nama paket dan harga dasar wajib diisi.' });
    }

    const existResult = await db.execute({ sql: 'SELECT id FROM packages WHERE id = ?', args: [id] });
    if (existResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    await db.execute({
      sql: `UPDATE packages SET nama_paket = ?, deskripsi = ?, harga_dasar = ? WHERE id = ?`,
      args: [nama_paket, deskripsi || '', parseFloat(harga_dasar), id],
    });

    return res.status(200).json({ message: 'Paket berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memperbarui paket: ' + error.message });
  }
});

// DELETE /api/packages/:id -> Hapus paket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existResult = await db.execute({ sql: 'SELECT id FROM packages WHERE id = ?', args: [id] });
    if (existResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    const bookingCountResult = await db.execute({ sql: 'SELECT COUNT(*) as count FROM bookings WHERE paket_id = ?', args: [id] });
    const bookingCount = Number(bookingCountResult.rows[0].count);
    if (bookingCount > 0) {
      return res.status(400).json({
        error: `Paket tidak bisa dihapus karena sudah digunakan oleh ${bookingCount} booking. Nonaktifkan saja jika tidak ingin digunakan lagi.`
      });
    }

    await db.execute({ sql: 'DELETE FROM packages WHERE id = ?', args: [id] });
    return res.status(200).json({ message: 'Paket berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghapus paket: ' + error.message });
  }
});

// PATCH /api/packages/:id/toggle -> Aktifkan / Nonaktifkan paket
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const existResult = await db.execute({ sql: 'SELECT aktif FROM packages WHERE id = ?', args: [id] });
    const exist = existResult.rows[0];
    if (!exist) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    const statusBaru = Number(exist.aktif) === 1 ? 0 : 1;

    await db.execute({ sql: 'UPDATE packages SET aktif = ? WHERE id = ?', args: [statusBaru, id] });

    return res.status(200).json({
      message: statusBaru === 1 ? 'Paket berhasil diaktifkan.' : 'Paket berhasil dinonaktifkan.',
      aktif: statusBaru,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal merubah status aktif paket: ' + error.message });
  }
});

module.exports = router;
