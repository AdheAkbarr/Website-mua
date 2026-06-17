// Nama file: routes/auth.js
// Deskripsi: Route Express untuk autentikasi login (Password / PIN 6-digit) dan logout
// PERUBAHAN: Diubah dari synchronous better-sqlite3 ke async @libsql/client (Turso)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, pin } = req.body;

    let user;

    // Alur 1: Login menggunakan PIN 6-digit
    if (pin) {
      if (pin.length !== 6 || isNaN(Number(pin))) {
        return res.status(400).json({ error: 'PIN harus berupa 6 digit angka.' });
      }

      const result = await db.execute('SELECT * FROM users ORDER BY id LIMIT 1');
      user = result.rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      }

      const pinValid = bcrypt.compareSync(pin, user.pin_hash);
      if (!pinValid) {
        return res.status(401).json({ error: 'PIN yang Anda masukkan salah.' });
      }
    }
    // Alur 2: Login menggunakan Username & Password biasa
    else {
      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan Password wajib diisi.' });
      }

      const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
      user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Username atau Password salah.' });
      }

      const passwordValid = bcrypt.compareSync(password, user.password_hash);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Username atau Password salah.' });
      }
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username
      }
    });

  } catch (error) {
    return res.status(500).json({ error: 'Terjadi kesalahan sistem saat login: ' + error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.status(200).json({ message: 'Logout berhasil.' });
});

// POST /api/auth/register
router.post('/register', authMiddleware, async (req, res) => {
  try {
    if (req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin utama yang dapat membuat akun.' });
    }

    const { nama, username, password, pin } = req.body;

    if (!nama || !username || !password || !pin) {
      return res.status(400).json({ error: 'Semua field (nama, username, password, PIN) wajib diisi.' });
    }

    if (pin.length !== 6 || isNaN(Number(pin))) {
      return res.status(400).json({ error: 'PIN harus berupa 6 digit angka.' });
    }

    const existResult = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
    if (existResult.rows.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const pinHash = bcrypt.hashSync(pin, 10);

    await db.execute({
      sql: `INSERT INTO users (nama, username, password_hash, pin_hash) VALUES (?, ?, ?, ?)`,
      args: [nama, username.toLowerCase(), passwordHash, pinHash],
    });

    return res.status(201).json({ message: 'Akun pengguna baru berhasil dibuat.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal membuat akun: ' + error.message });
  }
});

// GET /api/auth/users -> List semua user/staff selain admin utama
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }
    const result = await db.execute({ sql: 'SELECT id, nama, username FROM users WHERE username != ? ORDER BY id DESC', args: ['admin'] });
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil data staff: ' + error.message });
  }
});

// PUT /api/auth/users/:id -> Edit user/staff
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }
    const { id } = req.params;
    const { nama, username, password, pin } = req.body;

    if (!nama || !username) {
      return res.status(400).json({ error: 'Nama dan Username wajib diisi.' });
    }

    const existResult = await db.execute({ sql: 'SELECT id FROM users WHERE username = ? AND id != ?', args: [username, id] });
    if (existResult.rows.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan.' });
    }

    const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Staff tidak ditemukan.' });
    }

    if (user.username === 'admin') {
      return res.status(400).json({ error: 'Akun admin utama tidak dapat diedit lewat sini.' });
    }

    let passwordHash = user.password_hash;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Kata sandi minimal 6 karakter.' });
      }
      passwordHash = bcrypt.hashSync(password, 10);
    }

    let pinHash = user.pin_hash;
    if (pin) {
      if (pin.length !== 6 || isNaN(Number(pin))) {
        return res.status(400).json({ error: 'PIN harus berupa 6 digit angka.' });
      }
      pinHash = bcrypt.hashSync(pin, 10);
    }

    await db.execute({
      sql: `UPDATE users SET nama = ?, username = ?, password_hash = ?, pin_hash = ? WHERE id = ?`,
      args: [nama, username.toLowerCase(), passwordHash, pinHash, id],
    });

    return res.status(200).json({ message: 'Data staff berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memperbarui data staff: ' + error.message });
  }
});

// DELETE /api/auth/users/:id -> Hapus user/staff
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }
    const { id } = req.params;

    const userResult = await db.execute({ sql: 'SELECT username FROM users WHERE id = ?', args: [id] });
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Staff tidak ditemukan.' });
    }
    if (user.username === 'admin') {
      return res.status(400).json({ error: 'Akun admin utama tidak dapat dihapus.' });
    }

    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    return res.status(200).json({ message: 'Staff berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghapus staff: ' + error.message });
  }
});

module.exports = router;
