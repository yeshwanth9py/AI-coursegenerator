import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import CourseOverviewPage from './pages/CourseOverviewPage';
import CertificatePage from './pages/CertificatePage';
import HomePage from './pages/HomePage';
import LessonViewerPage from './pages/LessonViewerPage';
import LoginPage from './pages/LoginPage';
import SharedCoursePage from './pages/SharedCoursePage';
import SignupPage from './pages/SignupPage';

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function DashboardPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/share/:shareId" element={<SharedCoursePage />} />
        <Route path="/" element={<DashboardPage><HomePage /></DashboardPage>} />
        <Route path="/course/:id" element={<DashboardPage><CourseOverviewPage /></DashboardPage>} />
        <Route path="/course/:id/certificate" element={<DashboardPage><CertificatePage /></DashboardPage>} />
        <Route
          path="/course/:courseId/lesson/:id"
          element={<DashboardPage><LessonViewerPage /></DashboardPage>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
