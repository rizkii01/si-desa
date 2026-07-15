const { Router } = require('express');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { uploadProfil, uploadBerkas } = require('../middleware/upload');
const { updateProfileRules, changePasswordRules } = require('../middleware/validate');
const {
  getProfile, updateProfile, uploadPhoto,
  submitQueue, submitComplaint, getComplaintDetail, getHistory, changePassword, getActivityHistory,
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
router.put('/profile', updateProfileRules, updateProfile);
router.post('/profile/photo', uploadProfil, uploadPhoto);
router.put('/change-password', changePasswordRules, changePassword);

router.post('/submissions/queues', submitQueue);
router.post('/submissions/complaints', submitComplaint);
router.get('/submissions/complaints/:id', getComplaintDetail);
router.get('/submissions/history', getHistory);
router.get('/activity-history', getActivityHistory);

router.post('/smart-letters', uploadBerkas, submitSmartLetter);
router.get('/smart-letters', getSmartLetters);
router.get('/smart-letters/:id', getSmartLetterDetail);

router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/read-all', markAllAsRead);
router.put('/notifications/:id/read', markAsRead);

module.exports = router;
