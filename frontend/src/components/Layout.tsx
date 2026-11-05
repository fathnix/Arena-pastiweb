import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-700'
      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-base font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-700'
      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
  }`;

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role ?? 'customer';

  const navItems: NavItem[] =
    role === 'customer'
      ? [
          { to: '/dashboard', label: 'Dashboard', end: true },
          { to: '/booking', label: 'Booking' },
          { to: '/my-bookings', label: 'Booking Saya' },
          { to: '/profile', label: 'Profil' },
        ]
      : role === 'superadmin'
        ? [
            { to: '/admin', label: 'Dashboard' },
            { to: '/superadmin/branches', label: 'Cabang' },
            { to: '/superadmin/users', label: 'Pengguna' },
            { to: '/admin/bookings', label: 'Booking' },
            { to: '/admin/payments', label: 'Pembayaran' },
            { to: '/admin/reports', label: 'Laporan' },
            { to: '/profile', label: 'Profil' },
          ]
        : [
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/bookings', label: 'Booking' },
            { to: '/admin/fields', label: 'Lapangan' },
            { to: '/admin/payments', label: 'Pembayaran' },
            { to: '/admin/reports', label: 'Laporan' },
            { to: '/profile', label: 'Profil' },
          ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link to={role === 'customer' ? '/dashboard' : '/admin'} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                  AP
                </span>
                <span className="text-xl font-bold text-slate-900">
                  Arena<span className="text-emerald-600">Pasti</span>
                </span>
              </Link>

              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <Link to="/profile" className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.role_label}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="leading-tight">
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role_label}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
