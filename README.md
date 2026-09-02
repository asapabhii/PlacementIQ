# PlacementIQ

PlacementIQ is a smart campus recruitment and analytics platform designed to streamline the placement process for students, placement officers (admins), and company recruiters.

## Features
- **Admin Dashboard**: Live analytics for branch-wise placements, top recruiting companies, and drive funnel tracking. Manage companies, drives, and student offers.
- **Audit Logs**: Secure tracking of all mutating actions performed by placement admins.
- **Student Portal**: Auto-filtered eligible drives based on branch, CGPA, and backlogs. Visual tracking for application status and offer management.
- **Recruiter/Company Portal**: Read-only portal for companies to view their drives, applicants, and download resumes.
- **Automated Eligibility**: Database-level PostgreSQL triggers handle complex business rules, like preventing ineligible students from applying and enforcing a single-accepted-offer rule.
- **Exporting**: Export placement data as PDF and Excel reports.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL (Neon Serverless)

## Running Locally

### Backend
1. `cd backend`
2. `npm install`
3. Make sure `.env` has `DATABASE_URL` (Neon Postgres).
4. `npx prisma db push`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Demo Credentials
- **Admin**: `placements@christuniversity.in` / `password123`
- **Company**: `infosys@christuniversity.in` / `password123`
- **Student**: `2343004@christuniversity.in` / `password123` (or any valid seeded student ID)
