const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { login, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginRules } = require('../middleware/validate');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Terlalu banyak percobaan login. Coba lagi 15 menit lagi' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/login', loginLimiter, loginRules, login);
router.get('/me', verifyToken, me);

module.exports = router;
