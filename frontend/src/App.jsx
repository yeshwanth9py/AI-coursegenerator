import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const CourseOverviewPage = lazy(() => import('./pages/CourseOverviewPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LessonViewerPage = lazy(() => import('./pages/LessonViewerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SharedCoursePage = lazy(() => import('./pages/SharedCoursePage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 20, 38, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            borderRadius: '14px',
            boxShadow: '0 18px 50px rgba(0, 0, 0, 0.35)',
            color: '#e2e8f0',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner text="Opening your learning space..." />}>
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
      </Suspense>
    </>
  );
}
