require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

app.use(cors());
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
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar', error: err.message });
  }
  if (err.message?.includes('Hanya file')) {
    return res.status(400).json({ message: err.message, error: err.message });
  }
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Terjadi kesalahan server',
    ...(isDev && { error: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') }),
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
