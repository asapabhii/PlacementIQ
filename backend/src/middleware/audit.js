const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditLogger = async (req, res, next) => {
  // Wait for the response to finish
  res.on('finish', async () => {
    // Only log if the request was successful and it was a mutating action
    if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (req.user && req.user.role === 'admin') {
        try {
          let target = req.originalUrl;
          // Clean up target string for readability
          if (target.includes('/api/admin/')) {
            target = target.replace('/api/admin/', '');
          }
          
          await prisma.auditLog.create({
            data: {
              admin_id: req.user.id,
              action: req.method,
              target: target,
              details: JSON.stringify(req.body)
            }
          });
        } catch (error) {
          console.error('Audit Log Error:', error);
        }
      }
    }
  });
  next();
};

module.exports = { auditLogger };
