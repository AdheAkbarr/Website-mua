// Nama file: routes/packages.js
// Deskripsi: Route Express untuk CRUD Paket Makeup dan Toggle Status Aktif

const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Gunakan auth middleware untuk semua endpoint paket
router.use(authMiddleware);

// GET /api/packages -> Ambil semua paket (disertai statistik booking per paket)
router.get('/', (req, res) => {
  try {
    const pkgs = db.prepare(`
      SELECT p.*, COUNT(b.id) as total_bookings
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.paket_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `).all();

    return res.status(200).json(pkgs);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data paket: ' + error.message });
  }
});

// POST /api/packages -> Tambah paket baru
router.post('/', (req, res) => {
  try {
    const { nama_paket, deskripsi, harga_dasar } = req.body;

    if (!nama_paket || harga_dasar === undefined) {
      return res.status(400).json({ error: 'Nama paket dan harga dasar wajib diisi.' });
    }

    const result = db.prepare(`
      INSERT INTO packages (nama_paket, deskripsi, harga_dasar, aktif)
      VALUES (?, ?, ?, 1)
    `).run(nama_paket, deskripsi || '', parseFloat(harga_dasar));

    return res.status(201).json({
      message: 'Paket baru berhasil ditambahkan.',
      packageId: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menambahkan paket: ' + error.message });
  }
});

// PUT /api/packages/:id -> Perbarui paket
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nama_paket, deskripsi, harga_dasar } = req.body;

    if (!nama_paket || harga_dasar === undefined) {
      return res.status(400).json({ error: 'Nama paket dan harga dasar wajib diisi.' });
    }

    const exist = db.prepare('SELECT id FROM packages WHERE id = ?').get(id);
    if (!exist) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE packages 
      SET nama_paket = ?, deskripsi = ?, harga_dasar = ?
      WHERE id = ?
    `).run(nama_paket, deskripsi || '', parseFloat(harga_dasar), id);

    return res.status(200).json({ message: 'Paket berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memperbarui paket: ' + error.message });
  }
});

// DELETE /api/packages/:id -> Hapus paket
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const exist = db.prepare('SELECT id FROM packages WHERE id = ?').get(id);
    if (!exist) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    // Cek apakah paket sedang digunakan di data booking
    const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE paket_id = ?').get(id).count;
    if (bookingCount > 0) {
      return res.status(400).json({ 
        error: `Paket tidak bisa dihapus karena sudah digunakan oleh ${bookingCount} booking. Nonaktifkan saja jika tidak ingin digunakan lagi.` 
      });
    }

    db.prepare('DELETE FROM packages WHERE id = ?').run(id);

    return res.status(200).json({ message: 'Paket berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghapus paket: ' + error.message });
  }
});

// PATCH /api/packages/:id/toggle -> Aktifkan / Nonaktifkan paket
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;

    const exist = db.prepare('SELECT aktif FROM packages WHERE id = ?').get(id);
    if (!exist) {
      return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    }

    const statusBaru = exist.aktif === 1 ? 0 : 1;

    db.prepare('UPDATE packages SET aktif = ? WHERE id = ?').run(statusBaru, id);

    return res.status(200).json({ 
      message: statusBaru === 1 ? 'Paket berhasil diaktifkan.' : 'Paket berhasil dinonaktifkan.',
      aktif: statusBaru
    });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal merubah status aktif paket: ' + error.message });
  }
});

module.exports = router;
