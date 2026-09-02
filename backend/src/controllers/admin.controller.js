const prisma = require('../lib/prisma');
const { checkEligibility } = require('../utils/eligibility');

// ==================== COMPANIES ====================

async function getCompanies(req, res, next) {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { drives: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ companies });
  } catch (error) { next(error); }
}

async function getCompany(req, res, next) {
  try {
    const company = await prisma.company.findUnique({
      where: { company_id: parseInt(req.params.id) },
      include: { drives: { include: { _count: { select: { applications: true } } } } },
    });
    if (!company) return res.status(404).json({ error: 'Company not found.' });
    res.json({ company });
  } catch (error) { next(error); }
}

async function createCompany(req, res, next) {
  try {
    const { name, sector, hr_contact_email, description } = req.body;
    const company = await prisma.company.create({
      data: { name, sector, hr_contact_email, description },
    });
    res.status(201).json({ message: 'Company created', company });
  } catch (error) { next(error); }
}

async function updateCompany(req, res, next) {
  try {
    const { name, sector, hr_contact_email, description } = req.body;
    const company = await prisma.company.update({
      where: { company_id: parseInt(req.params.id) },
      data: { name, sector, hr_contact_email, description },
    });
    res.json({ message: 'Company updated', company });
  } catch (error) { next(error); }
}

async function deleteCompany(req, res, next) {
  try {
    await prisma.company.delete({
      where: { company_id: parseInt(req.params.id) },
    });
    res.json({ message: 'Company deleted' });
  } catch (error) { next(error); }
}

// ==================== DRIVES ====================

async function getDrives(req, res, next) {
  try {
    const drives = await prisma.drive.findMany({
      include: {
        company: { select: { name: true, sector: true } },
        _count: { select: { applications: true, rounds: true } },
      },
      orderBy: { drive_date: 'desc' },
    });
    res.json({ drives });
  } catch (error) { next(error); }
}

async function getDrive(req, res, next) {
  try {
    const drive = await prisma.drive.findUnique({
      where: { drive_id: parseInt(req.params.id) },
      include: {
        company: true,
        rounds: { orderBy: { round_number: 'asc' } },
        applications: {
          include: {
            student: { select: { student_id: true, name: true, email: true, branch: true, cgpa: true, backlogs: true } },
            results: { include: { round: true }, orderBy: { round: { round_number: 'asc' } } },
            offer: true,
          },
        },
        _count: { select: { applications: true } },
      },
    });
    if (!drive) return res.status(404).json({ error: 'Drive not found.' });
    res.json({ drive });
  } catch (error) { next(error); }
}

async function createDrive(req, res, next) {
  try {
    const { company_id, role_offered, ctc_offered, drive_date, min_cgpa, max_backlogs, eligible_branches, rounds } = req.body;

    const drive = await prisma.drive.create({
      data: {
        company_id: parseInt(company_id),
        role_offered,
        ctc_offered: parseFloat(ctc_offered),
        drive_date: new Date(drive_date),
        min_cgpa: parseFloat(min_cgpa),
        max_backlogs: parseInt(max_backlogs) || 0,
        eligible_branches,
        created_by_admin_id: req.user.id,
        rounds: rounds ? {
          create: rounds.map((r, i) => ({
            round_number: i + 1,
            round_name: r.round_name,
            scheduled_date: r.scheduled_date ? new Date(r.scheduled_date) : null,
          })),
        } : undefined,
      },
      include: { rounds: true, company: true },
    });

    // Notify eligible students
    const eligibleStudents = await getEligibleStudentsForDrive(drive);
    if (eligibleStudents.length > 0) {
      await prisma.notification.createMany({
        data: eligibleStudents.map(s => ({
          student_id: s.student_id,
          message: `New drive posted: ${drive.company.name} — ${drive.role_offered} (CTC: ₹${drive.ctc_offered} LPA). Apply now!`,
        })),
      });
    }

    res.status(201).json({ message: 'Drive created', drive });
  } catch (error) { next(error); }
}

async function updateDrive(req, res, next) {
  try {
    const { role_offered, ctc_offered, drive_date, min_cgpa, max_backlogs, eligible_branches, status } = req.body;
    const drive = await prisma.drive.update({
      where: { drive_id: parseInt(req.params.id) },
      data: {
        ...(role_offered && { role_offered }),
        ...(ctc_offered && { ctc_offered: parseFloat(ctc_offered) }),
        ...(drive_date && { drive_date: new Date(drive_date) }),
        ...(min_cgpa && { min_cgpa: parseFloat(min_cgpa) }),
        ...(max_backlogs !== undefined && { max_backlogs: parseInt(max_backlogs) }),
        ...(eligible_branches && { eligible_branches }),
        ...(status && { status }),
      },
      include: { company: true, rounds: true },
    });
    res.json({ message: 'Drive updated', drive });
  } catch (error) { next(error); }
}

// ==================== ROUNDS ====================

async function addRound(req, res, next) {
  try {
    const drive_id = parseInt(req.params.id);
    const { round_name, scheduled_date } = req.body;

    // Get next round number
    const lastRound = await prisma.driveRound.findFirst({
      where: { drive_id },
      orderBy: { round_number: 'desc' },
    });

    const round = await prisma.driveRound.create({
      data: {
        drive_id,
        round_number: (lastRound?.round_number || 0) + 1,
        round_name,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
      },
    });
    res.status(201).json({ message: 'Round added', round });
  } catch (error) { next(error); }
}

// ==================== ELIGIBLE STUDENTS ====================

async function getEligibleStudentsForDrive(drive) {
  const branches = drive.eligible_branches.split(',').map(b => b.trim());
  return prisma.student.findMany({
    where: {
      cgpa: { gte: drive.min_cgpa },
      backlogs: { lte: drive.max_backlogs },
      branch: { in: branches },
    },
    select: {
      student_id: true, name: true, email: true, branch: true,
      cgpa: true, backlogs: true, phone: true,
    },
    orderBy: { name: 'asc' },
  });
}

async function getEligibleStudents(req, res, next) {
  try {
    const drive = await prisma.drive.findUnique({
      where: { drive_id: parseInt(req.params.id) },
    });
    if (!drive) return res.status(404).json({ error: 'Drive not found.' });

    const students = await getEligibleStudentsForDrive(drive);
    res.json({ students, count: students.length });
  } catch (error) { next(error); }
}

// ==================== APPLICATIONS ====================

async function getDriveApplications(req, res, next) {
  try {
    const applications = await prisma.application.findMany({
      where: { drive_id: parseInt(req.params.id) },
      include: {
        student: { select: { student_id: true, name: true, email: true, branch: true, cgpa: true } },
        results: { include: { round: true }, orderBy: { round: { round_number: 'asc' } } },
        offer: true,
      },
      orderBy: { applied_date: 'asc' },
    });
    res.json({ applications });
  } catch (error) { next(error); }
}

// ==================== ROUND RESULTS ====================

async function updateRoundResult(req, res, next) {
  try {
    const { application_id, round_id, result, remarks } = req.body;

    // Check if result already exists
    const existing = await prisma.roundResult.findUnique({
      where: {
        application_id_round_id: {
          application_id: parseInt(application_id),
          round_id: parseInt(round_id),
        },
      },
    });

    let roundResult;
    if (existing) {
      roundResult = await prisma.roundResult.update({
        where: { result_id: existing.result_id },
        data: {
          result,
          remarks: remarks || null,
          evaluated_date: new Date(),
        },
      });
    } else {
      roundResult = await prisma.roundResult.create({
        data: {
          application_id: parseInt(application_id),
          round_id: parseInt(round_id),
          result,
          remarks: remarks || null,
          evaluated_date: new Date(),
        },
      });
    }

    // Update application status to In-Progress if it was Applied
    if (result === 'Pass') {
      await prisma.application.updateMany({
        where: {
          application_id: parseInt(application_id),
          current_status: 'Applied',
        },
        data: { current_status: 'In-Progress' },
      });
    }

    // Notify student
    const app = await prisma.application.findUnique({
      where: { application_id: parseInt(application_id) },
      include: { drive: { include: { company: true } } },
    });
    if (app) {
      const roundInfo = await prisma.driveRound.findUnique({ where: { round_id: parseInt(round_id) } });
      await prisma.notification.create({
        data: {
          student_id: app.student_id,
          message: `${app.drive.company.name} — ${app.drive.role_offered}: Your ${roundInfo?.round_name || 'round'} result is ${result}.${result === 'Pass' ? ' Congratulations!' : ''}`,
        },
      });
    }

    res.json({ message: 'Round result updated', roundResult });
  } catch (error) { next(error); }
}

// ==================== OFFERS ====================

async function getOffers(req, res, next) {
  try {
    const offers = await prisma.offer.findMany({
      include: {
        student: { select: { name: true, email: true, branch: true } },
        application: {
          include: {
            drive: { include: { company: { select: { name: true } } } },
          },
        },
      },
      orderBy: { offer_date: 'desc' },
    });
    res.json({ offers });
  } catch (error) { next(error); }
}

async function updateOffer(req, res, next) {
  try {
    const { offer_status, final_ctc } = req.body;
    const offer = await prisma.offer.update({
      where: { offer_id: parseInt(req.params.id) },
      data: {
        ...(offer_status && { offer_status }),
        ...(final_ctc && { final_ctc: parseFloat(final_ctc) }),
      },
    });
    res.json({ message: 'Offer updated', offer });
  } catch (error) { next(error); }
}

// ==================== NOTIFICATIONS ====================

async function sendNotification(req, res, next) {
  try {
    const { student_ids, message } = req.body;

    // If student_ids is 'all', send to all students
    let targetIds = student_ids;
    if (student_ids === 'all') {
      const allStudents = await prisma.student.findMany({ select: { student_id: true } });
      targetIds = allStudents.map(s => s.student_id);
    }

    await prisma.notification.createMany({
      data: targetIds.map(id => ({
        student_id: parseInt(id),
        message,
      })),
    });

    res.status(201).json({ message: `Notification sent to ${targetIds.length} student(s)` });
  } catch (error) { next(error); }
}

// ==================== STUDENTS LIST (Admin) ====================

async function getAllStudents(req, res, next) {
  try {
    const { branch, batch_year } = req.query;
    const where = {};
    if (branch) where.branch = branch;
    if (batch_year) where.batch_year = parseInt(batch_year);

    const students = await prisma.student.findMany({
      where,
      select: {
        student_id: true, name: true, email: true, branch: true,
        batch_year: true, cgpa: true, backlogs: true, phone: true,
        _count: { select: { applications: true, offers: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ students });
  } catch (error) { next(error); }
}

module.exports = {
  getCompanies, getCompany, createCompany, updateCompany, deleteCompany,
  getDrives, getDrive, createDrive, updateDrive,
  addRound,
  getEligibleStudents,
  getDriveApplications,
  updateRoundResult,
  getOffers, updateOffer,
  sendNotification,
  getAllStudents,
};
