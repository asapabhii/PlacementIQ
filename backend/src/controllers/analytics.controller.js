const prisma = require('../lib/prisma');

/**
 * GET /api/admin/analytics/overview — Overall placement stats
 */
async function getOverview(req, res, next) {
  try {
    const { batch_year } = req.query;
    const where = batch_year ? { batch_year: parseInt(batch_year) } : {};

    const totalStudents = await prisma.student.count({ where });
    const placedStudents = await prisma.offer.count({
      where: {
        offer_status: 'Accepted',
        ...(batch_year ? { student: { batch_year: parseInt(batch_year) } } : {}),
      },
    });
    const totalCompanies = await prisma.company.count();
    const totalDrives = await prisma.drive.count();
    const totalApplications = await prisma.application.count();
    const totalOffers = await prisma.offer.count();

    // Average CTC
    const ctcStats = await prisma.offer.aggregate({
      where: { offer_status: 'Accepted' },
      _avg: { final_ctc: true },
      _max: { final_ctc: true },
      _min: { final_ctc: true },
    });

    res.json({
      overview: {
        totalStudents,
        placedStudents,
        placementPercentage: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100 * 100) / 100 : 0,
        totalCompanies,
        totalDrives,
        totalApplications,
        totalOffers,
        avgCTC: ctcStats._avg.final_ctc ? parseFloat(ctcStats._avg.final_ctc).toFixed(2) : 0,
        highestCTC: ctcStats._max.final_ctc ? parseFloat(ctcStats._max.final_ctc).toFixed(2) : 0,
        lowestCTC: ctcStats._min.final_ctc ? parseFloat(ctcStats._min.final_ctc).toFixed(2) : 0,
      },
    });
  } catch (error) { next(error); }
}

/**
 * GET /api/admin/analytics/branch-wise — Branch-wise placement stats
 */
async function getBranchWise(req, res, next) {
  try {
    const branches = await prisma.student.groupBy({
      by: ['branch'],
      _count: { student_id: true },
    });

    const branchStats = await Promise.all(
      branches.map(async (b) => {
        const placed = await prisma.offer.count({
          where: {
            offer_status: 'Accepted',
            student: { branch: b.branch },
          },
        });

        const ctc = await prisma.offer.aggregate({
          where: {
            offer_status: 'Accepted',
            student: { branch: b.branch },
          },
          _avg: { final_ctc: true },
          _max: { final_ctc: true },
          _min: { final_ctc: true },
        });

        return {
          branch: b.branch,
          totalStudents: b._count.student_id,
          placedStudents: placed,
          placementPercentage: b._count.student_id > 0 ? Math.round((placed / b._count.student_id) * 100 * 100) / 100 : 0,
          avgCTC: ctc._avg.final_ctc ? parseFloat(ctc._avg.final_ctc).toFixed(2) : 0,
          highestCTC: ctc._max.final_ctc ? parseFloat(ctc._max.final_ctc).toFixed(2) : 0,
          lowestCTC: ctc._min.final_ctc ? parseFloat(ctc._min.final_ctc).toFixed(2) : 0,
        };
      })
    );

    res.json({ branchStats });
  } catch (error) { next(error); }
}

/**
 * GET /api/admin/analytics/drive-funnel — Drive-wise application funnel
 */
async function getDriveFunnel(req, res, next) {
  try {
    const drives = await prisma.drive.findMany({
      include: {
        company: { select: { name: true } },
        applications: {
          select: { current_status: true },
        },
      },
      orderBy: { drive_date: 'desc' },
      take: 10,
    });

    const funnelData = drives.map(d => {
      const statuses = d.applications.map(a => a.current_status);
      return {
        drive: `${d.company.name} — ${d.role_offered}`,
        drive_id: d.drive_id,
        applied: statuses.length,
        inProgress: statuses.filter(s => s === 'In-Progress').length,
        selected: statuses.filter(s => s === 'Selected').length,
        rejected: statuses.filter(s => s === 'Rejected').length,
      };
    });

    res.json({ funnelData });
  } catch (error) { next(error); }
}

/**
 * GET /api/admin/analytics/top-companies — Companies ranked by offers
 */
async function getTopCompanies(req, res, next) {
  try {
    const companies = await prisma.company.findMany({
      include: {
        drives: {
          include: {
            applications: {
              include: { offer: true },
            },
          },
        },
      },
    });

    const ranked = companies.map(c => {
      const totalOffers = c.drives.reduce((sum, d) =>
        sum + d.applications.filter(a => a.offer).length, 0);
      const acceptedOffers = c.drives.reduce((sum, d) =>
        sum + d.applications.filter(a => a.offer?.offer_status === 'Accepted').length, 0);

      return {
        company: c.name,
        company_id: c.company_id,
        sector: c.sector,
        totalOffers,
        acceptedOffers,
        drives: c.drives.length,
      };
    })
    .filter(c => c.totalOffers > 0)
    .sort((a, b) => b.totalOffers - a.totalOffers)
    .slice(0, 10);

    res.json({ topCompanies: ranked });
  } catch (error) { next(error); }
}

module.exports = { getOverview, getBranchWise, getDriveFunnel, getTopCompanies };
