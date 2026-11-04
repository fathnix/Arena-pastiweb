import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

interface MenuCard {
  to: string;
  title: string;
  description: string;
  icon: string;
  color: 'emerald' | 'amber' | 'blue' | 'slate' | 'violet';
}

const colorClasses: Record<MenuCard['color'], { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'hover:border-emerald-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'hover:border-amber-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'hover:border-blue-500' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'hover:border-slate-500' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'hover:border-violet-500' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'customer';

  const cards: MenuCard[] =
    role === 'customer'
      ? [
          {
            to: '/booking',
            title: 'Booking Lapangan',
            description: 'Pilih lapangan, tanggal, dan jam main yang tersedia.',
            icon: 'M12 4v16m8-8H4',
            color: 'emerald',
          },
          {
            to: '/my-bookings',
            title: 'Booking Saya',
            description: 'Lihat status booking, bayar, dan buka e-ticket QR.',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            color: 'amber',
          },
          {
            to: '/profile',
            title: 'Profil Saya',
            description: 'Perbarui data diri, kontak, dan password akun.',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            color: 'blue',
          },
        ]
      : role === 'superadmin'
        ? [
            {
              to: '/admin',
              title: 'Dashboard Global',
              description: 'Statistik semua cabang, revenue, dan jam sibuk.',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              color: 'emerald',
            },
            {
              to: '/superadmin/branches',
              title: 'Manajemen Cabang',
              description: 'Tambah, ubah, dan atur status semua cabang.',
              icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4',
              color: 'violet',
            },
            {
              to: '/superadmin/users',
              title: 'Manajemen Pengguna',
              description: 'Kelola akun admin, kasir, dan customer.',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              color: 'blue',
            },
            {
              to: '/admin/bookings',
              title: 'Manajemen Booking',
              description: 'Check-in, selesaikan booking, dan walk-in.',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              color: 'amber',
            },
            {
              to: '/admin/payments',
              title: 'Verifikasi Pembayaran',
              description: 'Periksa bukti transfer dan verifikasi pembayaran.',
              icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
              color: 'slate',
            },
            {
              to: '/admin/reports',
              title: 'Laporan & Analytics',
              description: 'Revenue harian, peak hours, dan export CSV.',
              icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
              color: 'emerald',
            },
          ]
        : [
            {
              to: '/admin',
              title: 'Dashboard Cabang',
              description: 'Statistik, revenue, dan performa cabang Anda.',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              color: 'emerald',
            },
            {
              to: '/admin/bookings',
              title: 'Manajemen Booking',
              description: 'Check-in, selesaikan booking, dan walk-in.',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              color: 'blue',
            },
            {
              to: '/admin/fields',
              title: 'Manajemen Lapangan',
              description: 'Atur lapangan, harga sewa, dan status aktif.',
              icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm0 5h18M7 7v0m0 10v0',
              color: 'amber',
            },
            {
              to: '/admin/payments',
              title: 'Verifikasi Pembayaran',
              description: 'Periksa bukti transfer dan verifikasi pembayaran.',
              icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
              color: 'slate',
            },
            {
              to: '/admin/reports',
              title: 'Laporan & Analytics',
              description: 'Revenue harian, peak hours, dan export CSV.',
              icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
              color: 'emerald',
            },
            {
              to: '/profile',
              title: 'Profil Saya',
              description: 'Perbarui data diri dan password akun.',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              color: 'violet',
            },
          ];

  const subtitle =
    role === 'customer'
      ? 'Booking lapangan favoritmu sekarang'
      : role === 'superadmin'
        ? 'Pantau dan kelola seluruh operasional Arena Pasti'
        : 'Kelola operasional cabang Arena Pasti';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-8 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
            {user?.role_label}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Selamat datang, {user?.name}
          </h1>
          <p className="text-slate-300 mt-2">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const colors = colorClasses[card.color];
            return (
              <Link
                key={`${card.to}-${card.title}`}
                to={card.to}
                className={`group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent ${colors.border}`}
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <svg
                    className={`w-6 h-6 ${colors.text}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-slate-600 text-sm">{card.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 mt-4 group-hover:gap-2 transition-all">
                  Buka
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
