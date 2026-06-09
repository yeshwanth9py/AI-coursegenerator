import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/Ui/LoadingSpinner';
import DashboardLayout from './Layouts/DashboardLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseOverviewPage = lazy(() => import('./pages/CourseOverviewPage'));
const LessonViewerPage = lazy(() => import('./pages/LessonViewerPage'));

function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />

      <Suspense fallback={<FullPageLoader text="Loading page..." />}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedPage>
                <HomePage />
              </ProtectedPage>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedPage>
                <CoursesPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedPage>
                <CourseOverviewPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/course/:courseId/lesson/:id"
            element={
              <ProtectedPage>
                <LessonViewerPage />
              </ProtectedPage>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
