require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const wargaRoutes = require('./routes/warga');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi di file .env');
}

// Security headers
app.use(helmet());

// CORS - restrict to allowed origins
app.use(cors({
  origin: [
    'https://si-desa.my.id',
    'https://www.si-desa.my.id',
    'https://si-desa-roan.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
});
app.use(globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Layanan Desa Cemara API' });
});

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  const isDev = process.env.NODE_ENV !== 'production';
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar' });
  }
  if (err.message?.includes('Hanya file')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Terjadi kesalahan server',
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
