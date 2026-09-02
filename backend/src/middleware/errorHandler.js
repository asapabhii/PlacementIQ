/**
 * Global error handler middleware.
 * Catches all errors and returns clean JSON responses.
 * Never exposes raw stack traces in production.
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }

  // Multer general error
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Prisma known request error
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      return res.status(409).json({
        error: `A record with this ${target ? target.join(', ') : 'value'} already exists.`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot perform this action due to related records.' });
    }
  }

  // PostgreSQL trigger error (eligibility, offer constraints)
  if (err.message && err.message.includes('Student does not meet')) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.includes('branch') && err.message.includes('not eligible')) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.includes('backlogs')) {
    return res.status(400).json({ error: err.message });
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
