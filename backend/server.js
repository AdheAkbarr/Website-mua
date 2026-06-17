// Nama file: server.js
// Deskripsi: Setup server Express untuk Vercel Serverless Functions
// PERUBAHAN: Export app (bukan .listen()) agar bisa berjalan di Vercel

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

// Inisialisasi Express
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const packagesRouter = require('./routes/packages');
const dashboardRouter = require('./routes/dashboard');

app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Penanganan Route 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// Penanganan Error Global
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({
    error: 'Terjadi kesalahan internal pada server.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inisialisasi database saat module dimuat (Vercel cold start)
initDatabase().catch(err => {
  console.error('[DB Init Error]:', err.message);
});

// Untuk development lokal: jalankan server biasa
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[Server] Berjalan di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel Serverless
module.exports = app;
