import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookingsPage from './pages/AdminBookingsPage';
import FieldsPage from './pages/FieldsPage';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import ReportsPage from './pages/ReportsPage';
import BranchesPage from './pages/BranchesPage';
import UsersPage from './pages/UsersPage';

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
  if (superadminOnly && user?.role !== 'superadmin') return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
