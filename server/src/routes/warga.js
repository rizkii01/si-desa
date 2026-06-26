const { Router } = require('express');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { uploadProfil, uploadBerkas } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadPhoto,
  submitLetter, submitQueue, submitComplaint, getHistory,
} = require('../controllers/wargaController');

const router = Router();
router.use(verifyToken, roleCheck('warga'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', uploadProfil, uploadPhoto);

router.post('/submissions/letters', uploadBerkas, submitLetter);
router.post('/submissions/queues', submitQueue);
router.post('/submissions/complaints', submitComplaint);
router.get('/submissions/history', getHistory);

module.exports = router;
