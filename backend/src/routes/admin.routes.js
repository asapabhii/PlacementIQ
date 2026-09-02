const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { auditLogger } = require('../middleware/audit');
const admin = require('../controllers/admin.controller');
const analytics = require('../controllers/analytics.controller');
const auditController = require('../controllers/audit.controller');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin, auditLogger);

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', auditController.getLogs);

// ==================== COMPANIES ====================
router.get('/companies', admin.getCompanies);
router.get('/companies/:id', admin.getCompany);
router.post(
  '/companies',
  [
    body('name').trim().notEmpty().withMessage('Company name is required'),
    body('sector').optional().trim(),
    body('hr_contact_email').optional().isEmail().withMessage('Invalid HR email'),
  ],
  validate,
  admin.createCompany
);
router.put('/companies/:id', admin.updateCompany);
router.delete('/companies/:id', admin.deleteCompany);

// ==================== DRIVES ====================
router.get('/drives', admin.getDrives);
router.get('/drives/:id', admin.getDrive);
router.post(
  '/drives',
  [
    body('company_id').isInt().withMessage('Company ID is required'),
    body('role_offered').trim().notEmpty().withMessage('Role is required'),
    body('ctc_offered').isFloat({ min: 0 }).withMessage('CTC must be a positive number'),
    body('drive_date').isISO8601().withMessage('Valid drive date is required'),
    body('min_cgpa').isFloat({ min: 0, max: 10 }).withMessage('Min CGPA must be between 0 and 10'),
    body('max_backlogs').optional().isInt({ min: 0 }).withMessage('Max backlogs must be 0 or more'),
    body('eligible_branches').trim().notEmpty().withMessage('Eligible branches are required'),
  ],
  validate,
  admin.createDrive
);
router.put('/drives/:id', admin.updateDrive);

// ==================== ROUNDS ====================
router.post(
  '/drives/:id/rounds',
  [
    body('round_name').trim().notEmpty().withMessage('Round name is required'),
  ],
  validate,
  admin.addRound
);

// ==================== ELIGIBLE STUDENTS ====================
router.get('/drives/:id/eligible-students', admin.getEligibleStudents);

// ==================== APPLICATIONS ====================
router.get('/drives/:id/applications', admin.getDriveApplications);

// ==================== ROUND RESULTS ====================
router.post(
  '/round-results',
  [
    body('application_id').isInt().withMessage('Application ID is required'),
    body('round_id').isInt().withMessage('Round ID is required'),
    body('result').isIn(['Pending', 'Pass', 'Fail']).withMessage('Result must be Pending, Pass, or Fail'),
  ],
  validate,
  admin.updateRoundResult
);

// ==================== OFFERS ====================
router.get('/offers', admin.getOffers);
router.put('/offers/:id', admin.updateOffer);

// ==================== NOTIFICATIONS ====================
router.post(
  '/notifications',
  [
    body('message').trim().notEmpty().withMessage('Notification message is required'),
    body('student_ids').notEmpty().withMessage('Student IDs or "all" is required'),
  ],
  validate,
  admin.sendNotification
);

// ==================== STUDENTS ====================
router.get('/students', admin.getAllStudents);

// ==================== ANALYTICS ====================
router.get('/analytics/overview', analytics.getOverview);
router.get('/analytics/branch-wise', analytics.getBranchWise);
router.get('/analytics/drive-funnel', analytics.getDriveFunnel);
router.get('/analytics/top-companies', analytics.getTopCompanies);

module.exports = router;
