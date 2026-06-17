// Nama file: db.js
// Deskripsi: Inisialisasi database Turso (libSQL - SQLite cloud) menggunakan @libsql/client
// Diubah dari better-sqlite3 (sync) ke @libsql/client (async) untuk kompatibilitas Vercel

const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Buat koneksi ke Turso (atau SQLite lokal untuk development)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./booking.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

// Inisialisasi tabel dan seed data
async function initDatabase() {
  // Buat semua tabel jika belum ada
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_paket TEXT NOT NULL,
      deskripsi TEXT,
      harga_dasar REAL NOT NULL DEFAULT 0,
      aktif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_booking TEXT UNIQUE,
      nama_client TEXT NOT NULL,
      no_hp TEXT NOT NULL,
      tanggal_acara TEXT NOT NULL,
      jam_acara TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      jumlah_orang INTEGER DEFAULT 1,
      paket_id INTEGER REFERENCES packages(id),
      catatan TEXT,
      harga_total REAL DEFAULT 0,
      dp_jumlah REAL DEFAULT 0,
      dp_status TEXT DEFAULT 'belum',
      deadline_konfirmasi TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reminder_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      tipe TEXT,
      pesan TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS status_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      status_lama TEXT,
      status_baru TEXT,
      catatan TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed user admin jika belum ada
  const userResult = await db.execute('SELECT COUNT(*) as count FROM users');
  const userCount = userResult.rows[0].count;
  if (Number(userCount) === 0) {
    const passwordHash = bcrypt.hashSync('adminmua123', 10);
    const pinHash = bcrypt.hashSync('123456', 10);
    await db.execute({
      sql: `INSERT INTO users (nama, username, password_hash, pin_hash) VALUES (?, ?, ?, ?)`,
      args: ['Admin MUA', 'admin', passwordHash, pinHash],
    });
  }

  // Nonaktifkan paket lama jika ada
  await db.execute({
    sql: `UPDATE packages SET aktif = 0 WHERE nama_paket IN ('Natural', 'Glam', 'Airbrush', 'Pengantin Nasional', 'Pengantin Adat')`,
    args: [],
  });

  // Seed paket baru
  const newPackages = [
    { nama: 'Basic Makeup', desc: 'Natural makeup, Bulumata regular/request tanpa bulumata, Untuk foto ijazah, kondangan. (Note: ketahan tidak terlalu lama dan tanpa hijabdo)', harga: 80000 },
    { nama: 'Soft Glam Makeup', desc: 'Coverage lebih tinggi, Makeup lebih detail, Untuk acara yearbook, perpisahan, pendamping wisuda, dll.', harga: 100000 },
    { nama: 'Premium Makeup (Standard)', desc: 'Bulumata dan produk premium, Tahan lebih lama, Cocok untuk wisuda, bridesmaid, party, dll.', harga: 150000 },
    { nama: 'Premium Makeup (Premium)', desc: 'Bulumata dan produk premium, Tahan lebih lama, Cocok untuk wisuda, bridesmaid, party, dll. (Paket Eksklusif)', harga: 200000 },
  ];

  for (const pkg of newPackages) {
    const exist = await db.execute({ sql: 'SELECT id FROM packages WHERE nama_paket = ?', args: [pkg.nama] });
    if (exist.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO packages (nama_paket, deskripsi, harga_dasar, aktif) VALUES (?, ?, ?, 1)`,
        args: [pkg.nama, pkg.desc, pkg.harga],
      });
    } else {
      await db.execute({ sql: 'UPDATE packages SET aktif = 1 WHERE nama_paket = ?', args: [pkg.nama] });
    }
  }
}

module.exports = { db, initDatabase };
