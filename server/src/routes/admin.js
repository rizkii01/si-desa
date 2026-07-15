const { Router } = require('express');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { createResidentRules } = require('../middleware/validate');
const {
  getDashboard,
  getResidents, getResident, createResident, updateResident, deactivateResident, activateResident,
  getAdmins, createAdmin, deactivateAdmin,
  getQueues, updateQueue,
  getComplaints, getComplaintDetail, updateComplaint,
} = require('../controllers/adminController');
const {
  getAdminSmartLetters, getAdminSmartLetterDetail, approveSmartLetter, rejectSmartLetter,
} = require('../controllers/smartLetterController');
const {
  getNotifications, getUnreadCount, markAsRead, markAllAsRead,
} = require('../controllers/notificationController');

const router = Router();
router.use(verifyToken, roleCheck('admin'));

router.get('/dashboard', getDashboard);

router.get('/residents', getResidents);
router.get('/residents/:id', getResident);
router.post('/residents', createResidentRules, createResident);
router.put('/residents/:id', updateResident);
router.put('/residents/:id/deactivate', deactivateResident);
router.put('/residents/:id/activate', activateResident);

router.get('/admins', getAdmins);
router.post('/admins', createResidentRules, createAdmin);
router.put('/admins/:id/deactivate', deactivateAdmin);

router.get('/submissions/queues', getQueues);
router.put('/submissions/queues/:id', updateQueue);

router.get('/submissions/complaints', getComplaints);
router.get('/submissions/complaints/:id', getComplaintDetail);
router.put('/submissions/complaints/:id/reply', updateComplaint);

router.get('/smart-letters', getAdminSmartLetters);
router.get('/smart-letters/:id', getAdminSmartLetterDetail);
router.put('/smart-letters/:id/approve', approveSmartLetter);
router.put('/smart-letters/:id/reject', rejectSmartLetter);

router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/read-all', markAllAsRead);
router.put('/notifications/:id/read', markAsRead);

module.exports = router;
