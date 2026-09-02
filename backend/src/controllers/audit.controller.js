const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent 100 for performance
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
