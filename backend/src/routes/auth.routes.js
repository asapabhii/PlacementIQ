const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/auth.controller');

// POST /api/auth/register — Student registration
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('branch').trim().notEmpty().withMessage('Branch is required'),
    body('batch_year').isInt({ min: 2000, max: 2100 }).withMessage('Valid batch year is required'),
    body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
    body('backlogs').optional().isInt({ min: 0 }).withMessage('Backlogs must be 0 or more'),
  ],
  validate,
  register
);

// POST /api/auth/login — Login (Admin or Student)
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['admin', 'student']).withMessage('Role must be admin or student'),
  ],
  validate,
  login
);

// GET /api/auth/me — Get current user (requires auth)
router.get('/me', authenticate, getMe);

module.exports = router;
