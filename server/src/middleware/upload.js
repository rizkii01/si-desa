const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR: uploadDir } = require('../config/uploads');

const profilStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'profil');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profil_${req.user.nik}_${Date.now()}${ext}`);
  },
});

const berkasStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `berkas_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Hanya file JPG/JPEG/PNG yang diizinkan'));
};

const berkasFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Hanya file JPG/JPEG/PNG/PDF yang diizinkan'));
};

const uploadProfil = multer({
  storage: profilStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('foto_profil');

const uploadBerkas = multer({
  storage: berkasStorage,
  fileFilter: berkasFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('berkas', 5);

module.exports = { uploadProfil, uploadBerkas };
