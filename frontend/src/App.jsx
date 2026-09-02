import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Admin pages
import AdminDashboard from './pages/admin/DashboardPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import DrivesPage from './pages/admin/DrivesPage';
import DriveDetailPage from './pages/admin/DriveDetailPage';
import OffersPage from './pages/admin/OffersPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminNotificationsPage from './pages/admin/NotificationsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Student pages
import StudentDashboard from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import StudentDrivesPage from './pages/student/DrivesPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import StudentOffersPage from './pages/student/OffersPage';
import StudentNotificationsPage from './pages/student/NotificationsPage';

// Company pages
import CompanyLayout from './components/layout/CompanyLayout';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyDriveDetail from './pages/company/CompanyDriveDetail';

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen bg-surface-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRole && user?.role !== allowedRole) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'company') return <Navigate to="/company" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="drives" element={<DrivesPage />} />
          <Route path="drives/:id" element={<DriveDetailPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Company routes */}
        <Route path="/company" element={<ProtectedRoute allowedRole="company"><CompanyLayout /></ProtectedRoute>}>
          <Route index element={<CompanyDashboard />} />
          <Route path="drives/:id" element={<CompanyDriveDetail />} />
        </Route>

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="drives" element={<StudentDrivesPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="offers" element={<StudentOffersPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
