const prisma = require('../lib/prisma');

/**
 * GET /api/company/drives
 * Get all drives for the logged-in company
 */
exports.getDrives = async (req, res, next) => {
  try {
    const drives = await prisma.drive.findMany({
      where: { company_id: req.user.id },
      include: {
        rounds: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { drive_date: 'desc' }
    });
    res.json(drives);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/drives/:id
 * Get details of a specific drive, including applicants and rounds.
 */
exports.getDriveDetail = async (req, res, next) => {
  try {
    const driveId = parseInt(req.params.id);

    const drive = await prisma.drive.findUnique({
      where: { drive_id: driveId },
      include: {
        rounds: { orderBy: { round_number: 'asc' } },
        applications: {
          include: {
            student: {
              select: { name: true, branch: true, cgpa: true, resume_url: true }
            },
            results: true
          }
        }
      }
    });

    if (!drive || drive.company_id !== req.user.id) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.json(drive);
  } catch (error) {
    next(error);
  }
};
