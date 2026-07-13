const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'uploads');
const PDF_DIR = path.join(UPLOAD_DIR, 'smart', 'pdfs');
const PROFIL_DIR = path.join(UPLOAD_DIR, 'profil');

module.exports = { UPLOAD_DIR, PDF_DIR, PROFIL_DIR };
