const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PlacementIQ database...\n');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.roundResult.deleteMany();
  await prisma.application.deleteMany();
  await prisma.driveRound.deleteMany();
  await prisma.drive.deleteMany();
  await prisma.company.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();

  const hash = await bcrypt.hash('password123', 12);

  // ==================== ADMINS ====================
  const admin = await prisma.admin.create({
    data: { name: 'Placements Admin', email: 'placements@christuniversity.in', password_hash: hash, role: 'placement_officer' },
  });
  const admin2 = await prisma.admin.create({
    data: { name: 'TPO Coordinator', email: 'tpo@christuniversity.in', password_hash: hash, role: 'placement_officer' },
  });
  console.log('✅ 2 admins created');

  // ==================== STUDENTS (39 real + 21 fictional = 60) ====================
  const studentData = [
    // 7B CA HONS — real classmates (branch: BCA)
    { name: 'ALLAMPALLY ABHINAV', email: '2343004@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.5, backlogs: 0 },
    { name: 'ALLEN PINTO', email: '2343005@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.8, backlogs: 0 },
    { name: 'ANEES MOIDHEEN M M', email: '2343007@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.2, backlogs: 0 },
    { name: 'ASHMIT KIRAN BHANDARY', email: '2343011@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.1, backlogs: 0 },
    { name: 'DEVDATT RAJESH', email: '2343020@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.5, backlogs: 1 },
    { name: 'HARSHITA BISHT', email: '2343024@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.9, backlogs: 0 },
    { name: 'KAVYA NAGAR', email: '2343027@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.3, backlogs: 0 },
    { name: 'LAKSH D', email: '2343031@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 6.8, backlogs: 2 },
    { name: 'MOHAMMED SOHAIL S', email: '2343036@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.6, backlogs: 0 },
    { name: 'NILA PRASAD', email: '2343037@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.7, backlogs: 0 },
    { name: 'NIVEA SEBASTIAN', email: '2343039@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 9.1, backlogs: 0 },
    { name: 'PRAGYA MISHRA', email: '2343041@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.4, backlogs: 0 },
    { name: 'PRAJNA M', email: '2343042@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.9, backlogs: 0 },
    { name: 'PRANAY ASOPA', email: '2343044@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.3, backlogs: 1 },
    { name: 'SRI HARSHA PITANI', email: '2343059@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.0, backlogs: 0 },
    { name: 'SUKHMANI KAUR BHATIA', email: '2343060@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.6, backlogs: 0 },
    { name: 'TRISTEN MANUS D SOUZA', email: '2343063@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.1, backlogs: 0 },
    { name: 'UDHAV DHANDIA', email: '2343065@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.7, backlogs: 0 },
    { name: 'P B JEEVAN', email: '2343069@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 6.5, backlogs: 2 },
    { name: 'PRIYANGSHU PROTIM GOGOI', email: '2343070@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.2, backlogs: 0 },
    { name: 'AARON KOSHY PARAYIL', email: '2343101@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.4, backlogs: 0 },
    { name: 'ABHAY K', email: '2343102@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.0, backlogs: 1 },
    { name: 'AKSHAT MAHESHWARI', email: '2343104@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.8, backlogs: 0 },
    { name: 'ARCHIT RAJ', email: '2343113@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.6, backlogs: 0 },
    { name: 'CHIRANJEEVI P', email: '2343016@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 6.9, backlogs: 1 },
    { name: 'ATHUL B M', email: '2343122@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.8, backlogs: 0 },
    { name: 'CHARITHA VENKATADRI', email: '2343125@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.5, backlogs: 0 },
    { name: 'DYLAN FERNANDES', email: '2343128@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.2, backlogs: 0 },
    { name: 'KARTHIK SANKAR R', email: '2343138@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.0, backlogs: 0 },
    { name: 'NITYANAND K G', email: '2343144@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.5, backlogs: 0 },
    { name: 'POORNIMA A', email: '2343148@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 9.0, backlogs: 0 },
    { name: 'PRIYANSHY VERMA', email: '2343149@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.3, backlogs: 0 },
    { name: 'SAMARTH GHAG', email: '2343151@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.1, backlogs: 0 },
    { name: 'SANGEETA ARJUNSINGH DHAMI', email: '2343052@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.7, backlogs: 0 },
    { name: 'SHASHWAT', email: '2343156@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.9, backlogs: 0 },
    { name: 'SHRESTH ROUT', email: '2343157@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.3, backlogs: 0 },
    { name: 'TRACY ROSEMEYER', email: '2343162@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 8.6, backlogs: 0 },
    { name: 'TUSHAR JANA', email: '2343163@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.4, backlogs: 0 },
    { name: 'MERRILL MATHEWS VADAKKAERIKKAL', email: '2343171@students.edu', branch: 'BCA', batch_year: 2026, cgpa: 7.8, backlogs: 0 },
    // Fictional students — CSE branch
    { name: 'RAHUL SHARMA', email: 'rahul.s@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 8.4, backlogs: 0 },
    { name: 'PRIYA PATEL', email: 'priya.p@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 9.2, backlogs: 0 },
    { name: 'ARJUN NAIR', email: 'arjun.n@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 7.6, backlogs: 1 },
    { name: 'SNEHA REDDY', email: 'sneha.r@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 8.8, backlogs: 0 },
    { name: 'VIKRAM JOSHI', email: 'vikram.j@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 7.1, backlogs: 0 },
    { name: 'ANANYA GUPTA', email: 'ananya.g@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 8.0, backlogs: 0 },
    { name: 'ROHAN MEHTA', email: 'rohan.m@students.edu', branch: 'CSE', batch_year: 2026, cgpa: 6.7, backlogs: 2 },
    // Fictional students — ECE branch
    { name: 'DIVYA KRISHNAN', email: 'divya.k@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 8.5, backlogs: 0 },
    { name: 'ADITYA RAO', email: 'aditya.r@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 7.9, backlogs: 0 },
    { name: 'MEERA IYER', email: 'meera.i@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 8.1, backlogs: 0 },
    { name: 'KARAN SINGH', email: 'karan.s@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 7.3, backlogs: 1 },
    { name: 'TANVI DESAI', email: 'tanvi.d@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 8.7, backlogs: 0 },
    { name: 'SIDDHARTH MENON', email: 'sid.m@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 7.0, backlogs: 0 },
    { name: 'ISHITA BHATT', email: 'ishita.b@students.edu', branch: 'ECE', batch_year: 2026, cgpa: 9.0, backlogs: 0 },
    // Fictional students — ME branch
    { name: 'AMIT KUMAR', email: 'amit.k@students.edu', branch: 'ME', batch_year: 2026, cgpa: 7.8, backlogs: 0 },
    { name: 'NEHA SAXENA', email: 'neha.s@students.edu', branch: 'ME', batch_year: 2026, cgpa: 8.2, backlogs: 0 },
    { name: 'VARUN TIWARI', email: 'varun.t@students.edu', branch: 'ME', batch_year: 2026, cgpa: 6.5, backlogs: 3 },
    { name: 'POOJA CHAUHAN', email: 'pooja.c@students.edu', branch: 'ME', batch_year: 2026, cgpa: 7.4, backlogs: 0 },
    { name: 'DEEPAK YADAV', email: 'deepak.y@students.edu', branch: 'ME', batch_year: 2026, cgpa: 8.6, backlogs: 0 },
    { name: 'RITU AGARWAL', email: 'ritu.a@students.edu', branch: 'ME', batch_year: 2026, cgpa: 7.9, backlogs: 0 },
    { name: 'MANISH PANDEY', email: 'manish.p@students.edu', branch: 'ME', batch_year: 2026, cgpa: 8.0, backlogs: 1 },
  ];

  const students = [];
  for (const s of studentData) {
    const email = s.email.replace('@students.edu', '@christuniversity.in');
    const student = await prisma.student.create({
      data: { ...s, email, password_hash: hash, phone: `98${Math.floor(10000000 + Math.random() * 90000000)}` },
    });
    students.push(student);
  }
  console.log(`✅ ${students.length} students created (39 real + 21 fictional)`);

  // ==================== COMPANIES ====================
  const companyData = [
    { name: 'Infosys', sector: 'IT Services', hr_contact_email: 'hr@infosys.com', description: 'Global leader in next-generation digital services and consulting.' },
    { name: 'TCS', sector: 'IT Services', hr_contact_email: 'hr@tcs.com', description: 'Tata Consultancy Services — IT services, consulting, and business solutions.' },
    { name: 'Wipro', sector: 'IT Services', hr_contact_email: 'hr@wipro.com', description: 'Leading global information technology, consulting and outsourcing company.' },
    { name: 'Google', sector: 'Technology', hr_contact_email: 'recruit@google.com', description: 'Multinational tech company specializing in search, cloud, and AI.' },
    { name: 'Microsoft', sector: 'Technology', hr_contact_email: 'recruit@microsoft.com', description: 'Technology corporation producing software, hardware, and cloud services.' },
    { name: 'Amazon', sector: 'E-commerce/Cloud', hr_contact_email: 'jobs@amazon.com', description: 'Multinational technology company focusing on e-commerce and cloud computing.' },
    { name: 'Deloitte', sector: 'Consulting', hr_contact_email: 'hr@deloitte.com', description: 'Global professional services network providing audit, consulting, and advisory.' },
    { name: 'Accenture', sector: 'Consulting', hr_contact_email: 'hr@accenture.com', description: 'Global professional services company specializing in IT and consulting.' },
    { name: 'Zoho', sector: 'SaaS', hr_contact_email: 'careers@zoho.com', description: 'Indian multinational technology company making web-based business tools.' },
    { name: 'Flipkart', sector: 'E-commerce', hr_contact_email: 'careers@flipkart.com', description: 'Indian e-commerce company headquartered in Bangalore.' },
    { name: 'Razorpay', sector: 'Fintech', hr_contact_email: 'hr@razorpay.com', description: 'Indian fintech company providing payment gateway solutions.' },
    { name: 'PhonePe', sector: 'Fintech', hr_contact_email: 'hr@phonepe.com', description: 'Digital payments platform based in India.' },
  ];

  const companies = [];
  for (const c of companyData) {
    const companyEmail = `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@christuniversity.in`;
    const company = await prisma.company.create({ data: { ...c, hr_contact_email: companyEmail, password_hash: hash } });
    companies.push(company);
  }
  console.log(`✅ ${companies.length} companies created`);

  // ==================== DRIVES ====================
  const driveData = [
    { company_id: companies[0].company_id, role_offered: 'Systems Engineer', ctc_offered: 3.6, drive_date: '2026-01-15', min_cgpa: 6.0, max_backlogs: 1, eligible_branches: 'BCA,CSE,ECE', status: 'Completed' },
    { company_id: companies[1].company_id, role_offered: 'Assistant System Engineer', ctc_offered: 3.36, drive_date: '2026-01-22', min_cgpa: 6.0, max_backlogs: 0, eligible_branches: 'BCA,CSE,ECE,ME', status: 'Completed' },
    { company_id: companies[2].company_id, role_offered: 'Project Engineer', ctc_offered: 3.5, drive_date: '2026-02-05', min_cgpa: 6.5, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Completed' },
    { company_id: companies[3].company_id, role_offered: 'SDE Intern', ctc_offered: 12.0, drive_date: '2026-02-20', min_cgpa: 8.0, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Completed' },
    { company_id: companies[4].company_id, role_offered: 'SDE 1', ctc_offered: 15.0, drive_date: '2026-03-01', min_cgpa: 8.5, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Completed' },
    { company_id: companies[5].company_id, role_offered: 'SDE Intern', ctc_offered: 10.0, drive_date: '2026-03-10', min_cgpa: 7.5, max_backlogs: 0, eligible_branches: 'BCA,CSE,ECE', status: 'Completed' },
    { company_id: companies[6].company_id, role_offered: 'Analyst', ctc_offered: 7.5, drive_date: '2026-03-20', min_cgpa: 7.0, max_backlogs: 0, eligible_branches: 'BCA,CSE,ECE,ME', status: 'Completed' },
    { company_id: companies[7].company_id, role_offered: 'Associate Software Engineer', ctc_offered: 4.5, drive_date: '2026-04-01', min_cgpa: 6.5, max_backlogs: 1, eligible_branches: 'BCA,CSE,ECE', status: 'Completed' },
    { company_id: companies[8].company_id, role_offered: 'Software Developer', ctc_offered: 6.0, drive_date: '2026-04-15', min_cgpa: 7.0, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Completed' },
    { company_id: companies[9].company_id, role_offered: 'SDE 1', ctc_offered: 8.0, drive_date: '2026-05-01', min_cgpa: 7.5, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Open' },
    { company_id: companies[10].company_id, role_offered: 'Backend Engineer', ctc_offered: 9.0, drive_date: '2026-05-15', min_cgpa: 7.0, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Open' },
    { company_id: companies[11].company_id, role_offered: 'Full Stack Developer', ctc_offered: 7.0, drive_date: '2026-05-25', min_cgpa: 7.0, max_backlogs: 1, eligible_branches: 'BCA,CSE,ECE', status: 'Open' },
    { company_id: companies[0].company_id, role_offered: 'Digital Specialist Engineer', ctc_offered: 5.0, drive_date: '2026-06-01', min_cgpa: 7.0, max_backlogs: 0, eligible_branches: 'BCA,CSE,ECE', status: 'Open' },
    { company_id: companies[3].company_id, role_offered: 'Cloud Engineer', ctc_offered: 14.0, drive_date: '2026-06-15', min_cgpa: 8.0, max_backlogs: 0, eligible_branches: 'BCA,CSE', status: 'Open' },
    { company_id: companies[5].company_id, role_offered: 'Data Analyst', ctc_offered: 8.5, drive_date: '2026-06-20', min_cgpa: 7.5, max_backlogs: 0, eligible_branches: 'BCA,CSE,ECE,ME', status: 'Open' },
  ];

  const drives = [];
  for (const d of driveData) {
    const drive = await prisma.drive.create({
      data: { ...d, drive_date: new Date(d.drive_date), created_by_admin_id: admin.admin_id },
    });
    drives.push(drive);
  }
  console.log(`✅ ${drives.length} drives created`);

  // ==================== DRIVE ROUNDS ====================
  const roundTemplates = [
    ['Aptitude Test', 'Group Discussion', 'Technical Interview', 'HR Interview'],
    ['Online Test', 'Technical Round', 'HR Round'],
    ['Coding Test', 'Technical Interview 1', 'Technical Interview 2', 'HR Interview'],
    ['Aptitude Test', 'Technical Interview', 'HR Interview'],
  ];

  const allRounds = [];
  for (const drive of drives) {
    const template = roundTemplates[Math.floor(Math.random() * roundTemplates.length)];
    for (let i = 0; i < template.length; i++) {
      const round = await prisma.driveRound.create({
        data: {
          drive_id: drive.drive_id,
          round_number: i + 1,
          round_name: template[i],
          scheduled_date: new Date(drive.drive_date.getTime() + i * 86400000),
        },
      });
      allRounds.push(round);
    }
  }
  console.log(`✅ ${allRounds.length} drive rounds created`);

  // ==================== APPLICATIONS (for completed drives) ====================
  // We create applications directly without triggers (seed bypass)
  const completedDrives = drives.filter(d => d.status === 'Completed');
  let appCount = 0;
  let offerCount = 0;

  for (const drive of completedDrives) {
    const branches = drive.eligible_branches.split(',').map(b => b.trim());
    const eligible = students.filter(s =>
      parseFloat(s.cgpa) >= parseFloat(drive.min_cgpa) &&
      s.backlogs <= drive.max_backlogs &&
      branches.includes(s.branch)
    );

    // ~60-80% of eligible students apply
    const applicants = eligible.filter(() => Math.random() < 0.7);

    for (const student of applicants) {
      try {
        const app = await prisma.application.create({
          data: {
            student_id: student.student_id,
            drive_id: drive.drive_id,
            applied_date: new Date(drive.drive_date),
          },
        });
        appCount++;

        // Get rounds for this drive
        const rounds = allRounds.filter(r => r.drive_id === drive.drive_id).sort((a, b) => a.round_number - b.round_number);

        let passed = true;
        for (const round of rounds) {
          if (!passed) break;
          // 60% pass rate per round
          const result = Math.random() < 0.6 ? 'Pass' : 'Fail';
          await prisma.roundResult.create({
            data: {
              application_id: app.application_id,
              round_id: round.round_id,
              result,
              remarks: result === 'Pass' ? 'Good performance' : 'Did not meet requirements',
              evaluated_date: new Date(round.scheduled_date),
            },
          });

          if (result === 'Fail') {
            passed = false;
            await prisma.application.update({
              where: { application_id: app.application_id },
              data: { current_status: 'Rejected' },
            });
          }
        }

        // If passed all rounds, the trigger handles offer generation!
        if (passed && rounds.length > 0) {
          // Just increment count (trigger handled the rest)
          offerCount++;
        }
      } catch (e) {
        // Skip duplicates or trigger errors during seeding
      }
    }
  }

  console.log(`✅ ${appCount} applications created`);
  console.log(`✅ ${offerCount} offers created`);

  // Accept some offers
  const pendingOffers = await prisma.offer.findMany({ where: { offer_status: 'Pending' } });
  const acceptedStudents = new Set();
  let acceptCount = 0;

  for (const offer of pendingOffers) {
    if (!acceptedStudents.has(offer.student_id) && Math.random() < 0.7) {
      await prisma.offer.update({
        where: { offer_id: offer.offer_id },
        data: { offer_status: 'Accepted' },
      });
      acceptedStudents.add(offer.student_id);
      acceptCount++;
    }
  }
  console.log(`✅ ${acceptCount} offers accepted`);

  // ==================== NOTIFICATIONS ====================
  const notifMessages = [
    'Welcome to PlacementIQ! Update your profile to get started.',
    'New drive posted: Check eligible drives for opportunities.',
    'Reminder: Update your resume before the next placement drive.',
  ];

  for (const student of students.slice(0, 20)) {
    for (const msg of notifMessages) {
      await prisma.notification.create({
        data: { student_id: student.student_id, message: msg },
      });
    }
  }
  console.log('✅ Notifications created');

  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Login credentials:');
  console.log('   Admin:   placements@christuniversity.in / password123');
  console.log('   Company: infosys@christuniversity.in / password123');
  console.log('   Student: 2343004@christuniversity.in / password123 (or any student register no)');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
