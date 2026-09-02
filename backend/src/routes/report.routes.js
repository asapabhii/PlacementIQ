const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { generatePDF, generateExcel } = require('../controllers/report.controller');

// All report routes require admin auth
router.use(authenticate, requireAdmin);

// GET /api/reports/placement-pdf?batch_year=2024&branch=CSE
router.get('/placement-pdf', generatePDF);

// GET /api/reports/placement-excel?batch_year=2024&branch=CSE
router.get('/placement-excel', generateExcel);

module.exports = router;
