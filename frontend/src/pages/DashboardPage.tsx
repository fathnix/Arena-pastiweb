import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-slate-600 mt-2">
            {isAdmin ? 'Panel Admin Arena Pasti' : 'Booking lapangan favoritmu sekarang'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isAdmin && (
            <>
              <Link
                to="/booking"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-emerald-500"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Booking Baru</h3>
                <p className="text-slate-600 text-sm">Pilih lapangan dan jadwal yang tersedia</p>
              </Link>

              <Link
                to="/my-bookings"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-emerald-500"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Booking Saya</h3>
                <p className="text-slate-600 text-sm">Lihat riwayat dan status booking</p>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-emerald-500"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Admin</h3>
                <p className="text-slate-600 text-sm">Statistik dan laporan</p>
              </Link>

              <Link
                to="/admin/payments"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-amber-500"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Verifikasi Pembayaran</h3>
                <p className="text-slate-600 text-sm">Verifikasi transfer manual</p>
              </Link>

              <Link
                to="/admin/bookings"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-blue-500"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Manajemen Booking</h3>
                <p className="text-slate-600 text-sm">Check-in & selesaikan booking</p>
              </Link>

              <Link
                to="/booking"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-slate-500"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Walk-in Booking</h3>
                <p className="text-slate-600 text-sm">Booking untuk customer datang langsung</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
