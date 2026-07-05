const { Router } = require('express');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { uploadProfil, uploadBerkas, uploadSmartBerkas } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadPhoto,
  submitLetter, submitQueue, submitComplaint, getHistory,
} = require('../controllers/wargaController');
const {
  submitSmartLetter,
  getSmartLetters,
  getSmartLetterDetail,
} = require('../controllers/smartLetterController');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = Router();
router.use(verifyToken, roleCheck('warga'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', uploadProfil, uploadPhoto);

router.post('/submissions/letters', uploadBerkas, submitLetter);
router.post('/submissions/queues', submitQueue);
router.post('/submissions/complaints', submitComplaint);
router.get('/submissions/history', getHistory);

router.post('/smart-letters', uploadSmartBerkas, submitSmartLetter);
router.get('/smart-letters', getSmartLetters);
router.get('/smart-letters/:id', getSmartLetterDetail);

router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/:id/read', markAsRead);
router.put('/notifications/read-all', markAllAsRead);

module.exports = router;
