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

module.exports = router;
