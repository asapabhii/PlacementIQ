# PlacementIQ

PlacementIQ is a smart campus recruitment and analytics platform designed to streamline the placement process for students, placement officers (admins), and company recruiters.

Live: https://placementiq.asapabhi.me

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
