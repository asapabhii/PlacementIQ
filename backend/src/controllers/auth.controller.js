const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../utils/jwt');

/**
 * POST /api/auth/register — Student registration
 */
async function register(req, res, next) {
  try {
    const { name, email, password, branch, batch_year, cgpa, backlogs, phone } = req.body;

    // Check if email already exists
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const student = await prisma.student.create({
      data: {
        name,
        email,
        password_hash,
        branch,
        batch_year: parseInt(batch_year),
        cgpa: parseFloat(cgpa),
        backlogs: parseInt(backlogs) || 0,
        phone: phone || null,
      },
    });

    const token = signToken({ id: student.student_id, role: 'student' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: student.student_id,
        name: student.name,
        email: student.email,
        role: 'student',
        branch: student.branch,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login — Login for both Admin and Student
 */
async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    let user;
    let userId;

    if (role === 'admin') {
      user = await prisma.admin.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      userId = user.admin_id;
    } else if (role === 'company') {
      user = await prisma.company.findFirst({ where: { hr_contact_email: email } });
      if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid email or password.' });
      userId = user.company_id;
    } else {
      user = await prisma.student.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      userId = user.student_id;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: userId, role });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: role === 'company' ? user.hr_contact_email : user.email,
        role: role,
        ...(role === 'student' && { branch: user.branch }),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me — Get current user profile
 */
async function getMe(req, res, next) {
  try {
    const { id, role } = req.user;

    let user;
    if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: { admin_id: id },
        select: { admin_id: true, name: true, email: true, role: true },
      });
    } else if (role === 'company') {
      user = await prisma.company.findUnique({
        where: { company_id: id },
        select: { company_id: true, name: true, hr_contact_email: true, sector: true },
      });
    } else {
      user = await prisma.student.findUnique({
        where: { student_id: id },
        select: {
          student_id: true, name: true, email: true, branch: true,
          batch_year: true, cgpa: true, backlogs: true, resume_url: true, phone: true,
        },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: { ...user, role } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe };
