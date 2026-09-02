# PlacementIQ — Project Summary & Documentation

This document serves as the final build summary for the PlacementIQ platform, fulfilling all requirements outlined in the project brief.

## 1. Final Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Framer Motion (for animations), Recharts (for analytics).
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (hosted on Neon Cloud).
- **ORM**: Prisma.
- **Auth**: JWT (JSON Web Tokens) with bcrypt password hashing.
- **File Storage**: Local `/uploads` directory (via Multer) for resumes.
- **Exports**: `pdfkit` (PDF generation), `exceljs` (Excel generation).
- **Deployment/Run**: Docker configuration (`docker-compose.yml`) provided, alongside standard Node scripts.

## 2. Final Database Schema
*(Note: These are the Prisma-generated equivalents of the ER diagram requirements, pushed to PostgreSQL)*

```sql
CREATE TABLE "Student" (
    "student_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "batch_year" INTEGER NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "backlogs" INTEGER NOT NULL DEFAULT 0,
    "resume_url" TEXT,
    "phone" TEXT,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

CREATE TABLE "Company" (
    "company_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "hr_contact_email" TEXT,
    "description" TEXT,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("company_id")
);

CREATE TABLE "Drive" (
    "drive_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "role_offered" TEXT NOT NULL,
    "ctc_offered" DOUBLE PRECISION NOT NULL,
    "drive_date" TIMESTAMP(3) NOT NULL,
    "min_cgpa" DOUBLE PRECISION NOT NULL,
    "max_backlogs" INTEGER NOT NULL,
    "eligible_branches" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "created_by_admin_id" INTEGER NOT NULL,
    CONSTRAINT "Drive_pkey" PRIMARY KEY ("drive_id")
);

CREATE TABLE "DriveRound" (
    "round_id" SERIAL NOT NULL,
    "drive_id" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "round_name" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    CONSTRAINT "DriveRound_pkey" PRIMARY KEY ("round_id")
);

CREATE TABLE "Application" (
    "application_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "drive_id" INTEGER NOT NULL,
    "applied_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_status" TEXT NOT NULL DEFAULT 'Applied',
    CONSTRAINT "Application_pkey" PRIMARY KEY ("application_id")
);

CREATE TABLE "RoundResult" (
    "result_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "remarks" TEXT,
    "evaluated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoundResult_pkey" PRIMARY KEY ("result_id")
);

CREATE TABLE "Offer" (
    "offer_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "final_ctc" DOUBLE PRECISION NOT NULL,
    "offer_status" TEXT NOT NULL DEFAULT 'Pending',
    "offer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_pkey" PRIMARY KEY ("offer_id")
);

CREATE TABLE "Admin" (
    "admin_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Admin',
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);
```
*(All foreign keys are strictly enforced using Prisma's relation fields.)*

## 3. Triggers & Stored Procedures Implemented
1. **`check_eligibility_before_apply` (Trigger)**: Intercepts `INSERT` statements into the `Application` table. It joins the `Student` and `Drive` tables to cross-check the student's CGPA, backlogs, and branch against the drive's requirements. If the student fails to meet the criteria, the database aborts the transaction and raises an exception.
2. **`enforce_single_accepted_offer` (Trigger)**: Attached to the `Offer` table on `INSERT` and `UPDATE`. Before a row is saved with `offer_status = 'Accepted'`, it checks if the student already has another 'Accepted' offer. If so, it automatically updates the older offer's status to `'Superseded'`, ensuring a student can only hold one active accepted offer at a time.
3. **`auto_generate_offer_on_selection` (Trigger/Function)**: Attached to the `RoundResult` table. When a result is updated to `'Pass'`, it checks if this was the final round for that drive. If it was, it automatically updates the `Application.current_status` to `'Selected'` and generates a new record in the `Offer` table with the drive's CTC.
4. **`sp_branch_placement_stats` (Function)**: A callable stored procedure that takes a branch name as input and aggregates placement percentage, average CTC, and highest CTC for that specific branch.

## 4. API Endpoints Built

### Auth Endpoints
- `POST /api/auth/register` — Register a new student
- `POST /api/auth/login` — Login for Admins and Students
- `GET /api/auth/me` — Get current authenticated user profile

### Admin Endpoints
- `GET /api/admin/analytics/overview` — High-level stat counters
- `GET /api/admin/analytics/branch-wise` — Branch comparison data
- `GET /api/admin/analytics/drive-funnel` — Application funnel stats
- `GET /api/admin/analytics/top-companies` — Top recruiters by offers
- `GET /api/admin/companies` & `POST /api/admin/companies` — Company CRUD
- `PUT /api/admin/companies/:id` & `DELETE /api/admin/companies/:id`
- `GET /api/admin/drives` & `POST /api/admin/drives` — Drive CRUD
- `GET /api/admin/drives/:id` & `GET /api/admin/drives/:id/eligible-students`
- `POST /api/admin/round-results` — Update a student's round result
- `GET /api/admin/offers` — List all generated offers
- `POST /api/admin/notifications` — Broadcast messages to students
- `GET /api/admin/students` — List all students
- `GET /api/admin/audit-logs` — Fetch audit trail of admin actions

### Company Endpoints
- `GET /api/company/drives` — List drives for the logged-in company
- `GET /api/company/drives/:id` — Read-only detail view of a drive and its applicants

### Student Endpoints
- `GET /api/student/profile` & `PUT /api/student/profile` — View/update profile
- `POST /api/student/profile/resume` — Upload resume file (Multer)
- `GET /api/student/drives` — List ONLY eligible drives based on DB check
- `POST /api/student/drives/:id/apply` — Submit application
- `GET /api/student/applications` — Track application statuses
- `GET /api/student/offers` & `PUT /api/student/offers/:id` — View and Accept/Decline offers
- `GET /api/student/notifications` & `PUT /api/student/notifications/:id/read`

### Report Endpoints
- `GET /api/reports/placement-pdf` — Generates and returns a PDF buffer
- `GET /api/reports/placement-excel` — Generates and returns an Excel buffer

## 5. Pages & Screens Built
1. **Login Page**: Split screen with demo credentials and animated branding.
2. **Register Page**: Student registration with branch/batch details.
3. **Admin Dashboard**: Live charts (Recharts) for placement metrics.
4. **Admin Companies**: Grid view and CRUD modal for recruiters.
5. **Admin Drives**: Manage placement drives and set multi-round structures.
6. **Admin Drive Detail**: Applicant tracking, pass/fail grading, and eligible student list.
7. **Admin Offers**: Global view of all offers rolled out.
8. **Admin Reports**: Download PDF/Excel filtered by batch and branch.
9. **Admin Notifications**: Compose and broadcast alerts.
10. **Admin Audit Logs**: Security page to view all mutating admin actions.
11. **Student Dashboard**: Quick stats and recent updates.
12. **Student Profile**: Editable details and resume upload button.
13. **Student Drives**: Auto-filtered grid of drives they can apply to.
14. **Student Applications**: Visual progress stepper (Applied -> Round 1 -> Selected).
15. **Student Offers**: Actionable view to accept or decline offers.
16. **Student Notifications**: Inbox for incoming alerts.
17. **Company Dashboard**: Recruiter portal to view their placement drives.
18. **Company Drive Detail**: Read-only applicant tracking for a specific drive.

## 6. Seed Data Loading Confirmation
The database was successfully seeded using real data combined with fictional entities to ensure the dashboards are fully populated:
- **60 Students** (39 real students from 7BCAHONS + 21 mock students)
- **2 Admins**
- **12 Companies**
- **15 Placement Drives**
- **53 Drive Rounds**
- Numerous Applications and Offers generated dynamically.

## 7. Limitations & Exclusions
- *Cloud Storage*: Resumes are saved locally in `backend/uploads` as per the spec. In a real production environment (like Render), a service like AWS S3 or Cloudinary should be used because Render spinning down will wipe the local disk.

## 8. Instructions to Run Locally
Ensure you have Node.js and npm installed.

1. **Database Config:** The `.env` file at the root contains the Neon Postgres connection string.
2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```
   *The backend will run on http://localhost:5000*
3. **Frontend Setup:**
   ```bash
   # In a new terminal window
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run on http://localhost:5173*

## 9. Demo Credentials
- **Admin**: `placements@christuniversity.in` / `password123`
- **Company**: `infosys@christuniversity.in` / `password123`
- **Student**: `2343004@christuniversity.in` / `password123` (or any valid seeded register no)

## 10. Suggested Screenshots for Documentation
For your academic report, take screenshots of these exact views:
1. **Login Screen**: Showing the split-screen design and Student/Admin toggle.
2. **Admin Dashboard**: Specifically showing the Branch-wise Placement (Bar Chart) and Status Distribution (Pie Chart).
3. **Admin Dashboard (Scroll down)**: Showing the Drive-wise Application Funnel chart.
4. **Admin Drive Detail Page**: Showing the applicant list with the Pass/Fail action buttons for a specific round.
5. **Admin Reports Page**: Showing the PDF/Excel download interface with filters.
6. **Student Dashboard**: Showing the high-level stats and recent applications.
7. **Student Drives Page**: Showing the eligible drives grid and the "Apply Now" buttons.
8. **Student Applications Page**: Highlighting the visual round stepper (Applied → Aptitude → HR → etc).
9. **Student Offers Page**: Showing an offer with the "Accept" and "Decline" buttons.
