const { verifyToken } = require('../utils/jwt');
const prisma = require('../lib/prisma');

/**
 * Authenticate JWT token from Authorization header.
 * Attaches user info to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Require the authenticated user to have 'admin' role.
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

/**
 * Require the authenticated user to have 'student' role.
 */
function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student access only.' });
  }
  next();
}

/**
 * Require the authenticated user to have 'company' role.
 */
function requireCompany(req, res, next) {
  if (req.user.role !== 'company') {
    return res.status(403).json({ error: 'Access denied. Company access only.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireStudent, requireCompany };
