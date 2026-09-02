const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireStudent } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const student = require('../controllers/student.controller');

// All student routes require authentication + student role
router.use(authenticate, requireStudent);

// ==================== PROFILE ====================
router.get('/profile', student.getProfile);
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty(),
    body('cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
    body('backlogs').optional().isInt({ min: 0 }).withMessage('Backlogs must be 0 or more'),
  ],
  validate,
  student.updateProfile
);
router.post('/profile/resume', upload.single('resume'), student.uploadResume);

// ==================== DRIVES ====================
router.get('/drives', student.getEligibleDrives);
router.post('/drives/:id/apply', student.applyToDrive);

// ==================== APPLICATIONS ====================
router.get('/applications', student.getMyApplications);

// ==================== OFFERS ====================
router.get('/offers', student.getMyOffers);
router.put(
  '/offers/:id',
  [
    body('offer_status').isIn(['Accepted', 'Declined']).withMessage('Status must be Accepted or Declined'),
  ],
  validate,
  student.respondToOffer
);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', student.getNotifications);
router.put('/notifications/:id/read', student.markNotificationRead);
router.put('/notifications/read-all', student.markAllNotificationsRead);

module.exports = router;
