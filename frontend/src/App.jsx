import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CourseOverviewPage from './pages/CourseOverviewPage';
import LessonViewerPage from './pages/LessonViewerPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/Ui/LoadingSpinner';
import DashboardLayout from './Layouts/DashboardLayout';

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
      <Routes>
        {/* Auth routes (no sidebar) */}
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
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HomePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CourseOverviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/lesson/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LessonViewerPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}