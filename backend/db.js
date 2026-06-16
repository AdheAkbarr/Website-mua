// Nama file: db.js
// Deskripsi: Inisialisasi database SQLite dan seeding data default menggunakan better-sqlite3

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './booking.db');
const db = new Database(dbPath, { verbose: null });

// Buat tabel jika belum ada
db.exec(`
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

// Seed data awal jika tabel kosong
// 1. Seed User Admin
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const passwordHash = bcrypt.hashSync('adminmua123', 10);
  const pinHash = bcrypt.hashSync('123456', 10); // PIN 6-digit default
  db.prepare(`
    INSERT INTO users (nama, username, password_hash, pin_hash)
    VALUES (?, ?, ?, ?)
  `).run('Admin MUA', 'admin', passwordHash, pinHash);
  // console.log('Seeding user admin selesai.');
}

// 2. Seed Master Paket
// Deactivate old packages if they exist
db.prepare(`
  UPDATE packages SET aktif = 0 
  WHERE nama_paket IN ('Natural', 'Glam', 'Airbrush', 'Pengantin Nasional', 'Pengantin Adat')
`).run();

const newPackages = [
  { nama: 'Basic Makeup', desc: 'Natural makeup, Bulumata regular/request tanpa bulumata, Untuk foto ijazah, kondangan. (Note: ketahan tidak terlalu lama dan tanpa hijabdo)', harga: 80000 },
  { nama: 'Soft Glam Makeup', desc: 'Coverage lebih tinggi, Makeup lebih detail, Untuk acara yearbook, perpisahan, pendamping wisuda, dll.', harga: 100000 },
  { nama: 'Premium Makeup (Standard)', desc: 'Bulumata dan produk premium, Tahan lebih lama, Cocok untuk wisuda, bridesmaid, party, dll.', harga: 150000 },
  { nama: 'Premium Makeup (Premium)', desc: 'Bulumata dan produk premium, Tahan lebih lama, Cocok untuk wisuda, bridesmaid, party, dll. (Paket Eksklusif)', harga: 200000 }
];

for (const pkg of newPackages) {
  const exist = db.prepare('SELECT id FROM packages WHERE nama_paket = ?').get(pkg.nama);
  if (!exist) {
    db.prepare(`
      INSERT INTO packages (nama_paket, deskripsi, harga_dasar, aktif)
      VALUES (?, ?, ?, 1)
    `).run(pkg.nama, pkg.desc, pkg.harga);
  } else {
    // Pastikan jika ada, statusnya aktif
    db.prepare('UPDATE packages SET aktif = 1 WHERE nama_paket = ?').run(pkg.nama);
  }
}


module.exports = db;
