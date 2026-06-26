require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar' });
  }
  if (err.message?.includes('Hanya file')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
