// Nama file: server.js
// Deskripsi: Setup server Express, routing API, scheduler, dan penanganan error

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initScheduler } = require('./scheduler');

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Di production sebaiknya diganti dengan domain frontend tertentu
  credentials: true
}));
app.use(express.json());

// Log request (opsional untuk development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

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

// Start Server
app.listen(PORT, () => {
  // console.log(`[Server] Berjalan di port http://localhost:${PORT}`);
  
  // Jalankan scheduler reminder otomatis
  initScheduler();
});
