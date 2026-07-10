const { body, param, validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const loginRules = [
  body('nik')
    .trim()
    .matches(/^\d{16}$/).withMessage('NIK harus 16 digit angka'),
  body('password')
    .notEmpty().withMessage('Password harus diisi'),
  handleErrors,
];

const createResidentRules = [
  body('nik')
    .trim()
    .matches(/^\d{16}$/).withMessage('NIK harus 16 digit angka'),
  body('nama_lengkap')
    .trim()
    .notEmpty().withMessage('Nama lengkap harus diisi'),
  body('tanggal_lahir')
    .notEmpty().withMessage('Tanggal lahir harus diisi'),
  body('jenis_kelamin')
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin harus Laki-laki atau Perempuan'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Format email tidak valid'),
  body('no_hp')
    .optional({ values: 'falsy' })
    .isLength({ max: 15 }).withMessage('No HP maksimal 15 karakter'),
  body('no_kk')
    .optional({ values: 'falsy' })
    .isLength({ max: 20 }).withMessage('No KK maksimal 20 karakter'),
  body('rt')
    .optional({ values: 'falsy' })
    .isLength({ max: 3 }).withMessage('RT maksimal 3 karakter'),
  body('rw')
    .optional({ values: 'falsy' })
    .isLength({ max: 3 }).withMessage('RW maksimal 3 karakter'),
  body('status_keluarga')
    .optional({ values: 'falsy' })
    .isIn(['Kepala Keluarga', 'Istri', 'Anak', 'Famili Lain', 'Lainnya']).withMessage('Status keluarga tidak valid'),
  body('agama')
    .optional({ values: 'falsy' })
    .isIn(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']).withMessage('Agama tidak valid'),
  body('pendidikan_terakhir')
    .optional({ values: 'falsy' })
    .isIn(['Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3']).withMessage('Pendidikan tidak valid'),
  body('status_perkawinan')
    .optional({ values: 'falsy' })
    .isIn(['Kawin', 'Belum Kawin', 'Cerai Hidup', 'Cerai Mati']).withMessage('Status perkawinan tidak valid'),
  body('kewarganegaraan')
    .optional({ values: 'falsy' })
    .isIn(['WNI', 'WNA']).withMessage('Kewarganegaraan harus WNI atau WNA'),
  handleErrors,
];

const updateProfileRules = [
  body('email')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Format email tidak valid'),
  body('no_hp')
    .optional({ values: 'falsy' })
    .isLength({ max: 15 }).withMessage('No HP maksimal 15 karakter'),
  handleErrors,
];

const changePasswordRules = [
  body('password_lama')
    .notEmpty().withMessage('Password lama harus diisi'),
  body('password_baru')
    .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  handleErrors,
];

const submitSmartLetterRules = [
  body('jenis_surat')
    .trim()
    .isIn(['SKD', 'SP', 'SKK', 'SKTM', 'SKU', 'SPN', 'SPORADIK'])
    .withMessage('Jenis surat tidak valid'),
  body('form_data')
    .notEmpty().withMessage('Data form harus diisi'),
  handleErrors,
];

module.exports = {
  loginRules,
  createResidentRules,
  updateProfileRules,
  changePasswordRules,
  submitSmartLetterRules,
};
