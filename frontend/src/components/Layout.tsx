import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-emerald-600">Arena Pasti</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                {!isAdmin && (
                  <>
                    <Link
                      to="/booking"
                      className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      Booking
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      My Bookings
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      Admin
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      Bookings
                    </Link>
                    <Link
                      to="/admin/payments"
                      className="text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      Payments
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role_label}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
