const { validationResult } = require('express-validator');

/**
 * Express middleware that checks for validation errors
 * from express-validator and returns 400 with detailed messages.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }
  next();
}

module.exports = { validate };
