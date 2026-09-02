const prisma = require('../lib/prisma');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * GET /api/reports/placement-pdf — Generate placement report as PDF
 */
async function generatePDF(req, res, next) {
  try {
    const { batch_year, branch } = req.query;
    const where = {};
    if (batch_year) where.batch_year = parseInt(batch_year);
    if (branch) where.branch = branch;

    const students = await prisma.student.findMany({
      where,
      include: {
        offers: {
          where: { offer_status: 'Accepted' },
          include: {
            application: {
              include: {
                drive: { include: { company: { select: { name: true } } } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PlacementReport_${batch_year || 'All'}_${branch || 'All'}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('PlacementIQ — Placement Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    if (batch_year) doc.text(`Batch Year: ${batch_year}`, { align: 'center' });
    if (branch) doc.text(`Branch: ${branch}`, { align: 'center' });
    doc.moveDown(1);

    // Summary
    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.offers.length > 0);
    const placementPct = totalStudents > 0 ? ((placedStudents.length / totalStudents) * 100).toFixed(1) : 0;

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Students: ${totalStudents}`);
    doc.text(`Placed Students: ${placedStudents.length}`);
    doc.text(`Placement %: ${placementPct}%`);
    doc.moveDown(1);

    // Table header
    doc.fontSize(14).font('Helvetica-Bold').text('Placed Students');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [30, 120, 60, 130, 80];
    const headers = ['#', 'Name', 'Branch', 'Company', 'CTC (LPA)'];

    // Draw header
    doc.fontSize(10).font('Helvetica-Bold');
    let x = 50;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: colWidths[i] });
      x += colWidths[i];
    });
    doc.moveDown(0.5);

    // Draw rows
    doc.font('Helvetica').fontSize(9);
    placedStudents.forEach((s, idx) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      const y = doc.y;
      x = 50;
      const offer = s.offers[0];
      const row = [
        String(idx + 1),
        s.name,
        s.branch,
        offer?.application?.drive?.company?.name || '-',
        offer?.final_ctc ? `₹${parseFloat(offer.final_ctc).toFixed(2)}` : '-',
      ];
      row.forEach((cell, i) => {
        doc.text(cell, x, y, { width: colWidths[i] });
        x += colWidths[i];
      });
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (error) { next(error); }
}

/**
 * GET /api/reports/placement-excel — Generate placement report as Excel
 */
async function generateExcel(req, res, next) {
  try {
    const { batch_year, branch } = req.query;
    const where = {};
    if (batch_year) where.batch_year = parseInt(batch_year);
    if (branch) where.branch = branch;

    const students = await prisma.student.findMany({
      where,
      include: {
        offers: {
          include: {
            application: {
              include: {
                drive: { include: { company: { select: { name: true } } } },
              },
            },
          },
        },
        applications: {
          include: {
            drive: { include: { company: { select: { name: true } } } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PlacementIQ';

    // Sheet 1: All Students
    const sheet1 = workbook.addWorksheet('All Students');
    sheet1.columns = [
      { header: 'Sl No.', key: 'sl', width: 8 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Branch', key: 'branch', width: 12 },
      { header: 'CGPA', key: 'cgpa', width: 8 },
      { header: 'Backlogs', key: 'backlogs', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'CTC (LPA)', key: 'ctc', width: 12 },
    ];

    // Style header
    sheet1.getRow(1).font = { bold: true };
    sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    students.forEach((s, idx) => {
      const acceptedOffer = s.offers.find(o => o.offer_status === 'Accepted');
      sheet1.addRow({
        sl: idx + 1,
        name: s.name,
        email: s.email,
        branch: s.branch,
        cgpa: parseFloat(s.cgpa),
        backlogs: s.backlogs,
        status: acceptedOffer ? 'Placed' : 'Not Placed',
        company: acceptedOffer?.application?.drive?.company?.name || '-',
        ctc: acceptedOffer?.final_ctc ? parseFloat(acceptedOffer.final_ctc) : '-',
      });
    });

    // Sheet 2: Placed Students Only
    const sheet2 = workbook.addWorksheet('Placed Students');
    sheet2.columns = [
      { header: 'Sl No.', key: 'sl', width: 8 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Branch', key: 'branch', width: 12 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Role', key: 'role', width: 25 },
      { header: 'CTC (LPA)', key: 'ctc', width: 12 },
    ];

    sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let placedIdx = 0;
    students.forEach((s) => {
      const acceptedOffer = s.offers.find(o => o.offer_status === 'Accepted');
      if (acceptedOffer) {
        placedIdx++;
        sheet2.addRow({
          sl: placedIdx,
          name: s.name,
          branch: s.branch,
          company: acceptedOffer.application?.drive?.company?.name || '-',
          role: acceptedOffer.application?.drive?.role_offered || '-',
          ctc: acceptedOffer.final_ctc ? parseFloat(acceptedOffer.final_ctc) : '-',
        });
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=PlacementReport_${batch_year || 'All'}_${branch || 'All'}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
}

module.exports = { generatePDF, generateExcel };
