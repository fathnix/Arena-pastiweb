import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard/admin pages are only needed after login, so they are split out of
// the landing bundle. This keeps the first visit tiny and fast.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBookingsPage = lazy(() => import('./pages/AdminBookingsPage'));
const FieldsPage = lazy(() => import('./pages/FieldsPage'));
const PaymentVerificationPage = lazy(() => import('./pages/PaymentVerificationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false, superadminOnly = false }: { children: React.ReactNode; adminOnly?: boolean; superadminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (superadminOnly && user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookingsPage /></ProtectedRoute>} />
            <Route path="/admin/fields" element={<ProtectedRoute adminOnly><FieldsPage /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute adminOnly><PaymentVerificationPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />

            <Route path="/superadmin/branches" element={<ProtectedRoute superadminOnly><BranchesPage /></ProtectedRoute>} />
            <Route path="/superadmin/users" element={<ProtectedRoute superadminOnly><UsersPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
