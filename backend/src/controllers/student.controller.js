const prisma = require('../lib/prisma');
const { checkEligibility } = require('../utils/eligibility');

/**
 * GET /api/student/profile — Get own profile
 */
async function getProfile(req, res, next) {
  try {
    const student = await prisma.student.findUnique({
      where: { student_id: req.user.id },
      select: {
        student_id: true, name: true, email: true, branch: true,
        batch_year: true, cgpa: true, backlogs: true, resume_url: true, phone: true,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ student });
  } catch (error) { next(error); }
}

/**
 * PUT /api/student/profile — Update own profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, cgpa, backlogs } = req.body;
    const student = await prisma.student.update({
      where: { student_id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(cgpa && { cgpa: parseFloat(cgpa) }),
        ...(backlogs !== undefined && { backlogs: parseInt(backlogs) }),
      },
    });
    res.json({ message: 'Profile updated', student });
  } catch (error) { next(error); }
}

/**
 * POST /api/student/profile/resume — Upload resume
 */
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const resume_url = `/uploads/${req.file.filename}`;
    await prisma.student.update({
      where: { student_id: req.user.id },
      data: { resume_url },
    });

    res.json({ message: 'Resume uploaded', resume_url });
  } catch (error) { next(error); }
}

/**
 * GET /api/student/drives — Get eligible drives (auto-filtered)
 */
async function getEligibleDrives(req, res, next) {
  try {
    const student = await prisma.student.findUnique({
      where: { student_id: req.user.id },
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Get all open drives
    const allDrives = await prisma.drive.findMany({
      where: { status: 'Open' },
      include: {
        company: { select: { name: true, sector: true } },
        rounds: { orderBy: { round_number: 'asc' } },
        _count: { select: { applications: true } },
      },
      orderBy: { drive_date: 'desc' },
    });

    // Filter eligible drives
    const eligibleDrives = allDrives.filter(drive => {
      const { eligible } = checkEligibility(student, drive);
      return eligible;
    });

    // Check which drives the student already applied to
    const appliedDriveIds = (await prisma.application.findMany({
      where: { student_id: req.user.id },
      select: { drive_id: true },
    })).map(a => a.drive_id);

    const drivesWithApplyStatus = eligibleDrives.map(d => ({
      ...d,
      already_applied: appliedDriveIds.includes(d.drive_id),
    }));

    res.json({ drives: drivesWithApplyStatus });
  } catch (error) { next(error); }
}

/**
 * POST /api/student/drives/:id/apply — Apply to a drive
 */
async function applyToDrive(req, res, next) {
  try {
    const drive_id = parseInt(req.params.id);
    const student_id = req.user.id;

    // Pre-check eligibility at app level (DB trigger is the real enforcer)
    const student = await prisma.student.findUnique({ where: { student_id } });
    const drive = await prisma.drive.findUnique({ where: { drive_id } });

    if (!drive) return res.status(404).json({ error: 'Drive not found.' });
    if (drive.status !== 'Open') {
      return res.status(400).json({ error: 'This drive is no longer accepting applications.' });
    }

    const { eligible, reasons } = checkEligibility(student, drive);
    if (!eligible) {
      return res.status(400).json({ error: 'Not eligible for this drive.', reasons });
    }

    // Create application — DB trigger will also enforce eligibility
    const application = await prisma.application.create({
      data: { student_id, drive_id },
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    // Handle duplicate application
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'You have already applied to this drive.' });
    }
    next(error);
  }
}

/**
 * GET /api/student/applications — Get own applications with round status
 */
async function getMyApplications(req, res, next) {
  try {
    const applications = await prisma.application.findMany({
      where: { student_id: req.user.id },
      include: {
        drive: {
          include: {
            company: { select: { name: true, sector: true } },
            rounds: { orderBy: { round_number: 'asc' } },
          },
        },
        results: {
          include: { round: true },
          orderBy: { round: { round_number: 'asc' } },
        },
        offer: true,
      },
      orderBy: { applied_date: 'desc' },
    });
    res.json({ applications });
  } catch (error) { next(error); }
}

/**
 * GET /api/student/offers — Get own offers
 */
async function getMyOffers(req, res, next) {
  try {
    const offers = await prisma.offer.findMany({
      where: { student_id: req.user.id },
      include: {
        application: {
          include: {
            drive: { include: { company: { select: { name: true, sector: true } } } },
          },
        },
      },
      orderBy: { offer_date: 'desc' },
    });
    res.json({ offers });
  } catch (error) { next(error); }
}

/**
 * PUT /api/student/offers/:id — Accept or decline an offer
 */
async function respondToOffer(req, res, next) {
  try {
    const { offer_status } = req.body;
    if (!['Accepted', 'Declined'].includes(offer_status)) {
      return res.status(400).json({ error: 'Offer status must be Accepted or Declined.' });
    }

    const offer = await prisma.offer.findUnique({
      where: { offer_id: parseInt(req.params.id) },
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    if (offer.student_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only respond to your own offers.' });
    }

    // The DB trigger will handle superseding other accepted offers
    const updated = await prisma.offer.update({
      where: { offer_id: parseInt(req.params.id) },
      data: { offer_status },
    });

    res.json({ message: `Offer ${offer_status.toLowerCase()}`, offer: updated });
  } catch (error) { next(error); }
}

/**
 * GET /api/student/notifications — Get notifications
 */
async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { student_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (error) { next(error); }
}

/**
 * PUT /api/student/notifications/:id/read — Mark notification as read
 */
async function markNotificationRead(req, res, next) {
  try {
    await prisma.notification.update({
      where: { notification_id: parseInt(req.params.id) },
      data: { is_read: true },
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) { next(error); }
}

/**
 * PUT /api/student/notifications/read-all — Mark all notifications as read
 */
async function markAllNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { student_id: req.user.id, is_read: false },
      data: { is_read: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) { next(error); }
}

module.exports = {
  getProfile, updateProfile, uploadResume,
  getEligibleDrives, applyToDrive,
  getMyApplications,
  getMyOffers, respondToOffer,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
