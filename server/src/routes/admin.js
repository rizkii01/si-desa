const { Router } = require('express');
const { verifyToken, roleCheck } = require('../middleware/auth');
const {
  getDashboard,
  getResidents, getResident, createResident, updateResident, deleteResident,
  getAdmins, createAdmin, deleteAdmin,
  getLetters, updateLetterStatus,
  getQueues, updateQueue,
  getComplaints, updateComplaint,
} = require('../controllers/adminController');
const {
  getAdminSmartLetters, getAdminSmartLetterDetail, approveSmartLetter, rejectSmartLetter,
} = require('../controllers/smartLetterController');
const {
  getNotifications, getUnreadCount, markAsRead,
} = require('../controllers/notificationController');

const router = Router();
router.use(verifyToken, roleCheck('admin'));

router.get('/dashboard', getDashboard);

router.get('/residents', getResidents);
router.get('/residents/:id', getResident);
router.post('/residents', createResident);
router.put('/residents/:id', updateResident);
router.delete('/residents/:id', deleteResident);

router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.delete('/admins/:id', deleteAdmin);

router.get('/submissions/letters', getLetters);
router.put('/submissions/letters/:id/status', updateLetterStatus);

router.get('/submissions/queues', getQueues);
router.put('/submissions/queues/:id', updateQueue);

router.get('/submissions/complaints', getComplaints);
router.put('/submissions/complaints/:id/reply', updateComplaint);

router.get('/smart-letters', getAdminSmartLetters);
router.get('/smart-letters/:id', getAdminSmartLetterDetail);
router.put('/smart-letters/:id/approve', approveSmartLetter);
router.put('/smart-letters/:id/reject', rejectSmartLetter);

router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/:id/read', markAsRead);

module.exports = router;
