const router = require('express').Router();
const { authenticate, requireCompany } = require('../middleware/auth');
const company = require('../controllers/company.controller');

// All company routes require authentication + company role
router.use(authenticate, requireCompany);

// ==================== DRIVES ====================
router.get('/drives', company.getDrives);
router.get('/drives/:id', company.getDriveDetail);

module.exports = router;
