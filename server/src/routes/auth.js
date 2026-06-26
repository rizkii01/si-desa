const { Router } = require('express');
const { login, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;
