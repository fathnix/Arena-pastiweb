import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  today_bookings: number;
  today_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  upcoming_bookings: number;
}

interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface PeakHour {
  label: string;
  bookings: number;
}

interface BranchPerf {
  id: number;
  name: string;
  code: string;
  fields: number;
  bookings: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [branches, setBranches] = useState<BranchPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const results = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue'),
        api.get('/dashboard/peak-hours'),
        isSuperadmin ? api.get('/dashboard/branches') : Promise.resolve(null),
      ]);
      setStats(results[0].data);
      setRevenue(results[1].data);
      setPeakHours(results[2].data);
      if (results[3]) {
        setBranches(results[3].data);
      }
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-slate-500">Memuat dashboard...</div>
      </Layout>
    );
  }

  const statCards = stats
    ? [
        { label: 'Booking Hari Ini', value: stats.today_bookings.toString(), color: 'emerald' },
        { label: 'Revenue Hari Ini', value: formatRupiah(stats.today_revenue), color: 'blue' },
        { label: 'Revenue Bulan Ini', value: formatRupiah(stats.monthly_revenue), color: 'amber' },
        { label: 'Pending Payment', value: stats.pending_payments.toString(), color: 'red' },
      ]
    : [];

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);
  const maxPeak = Math.max(...peakHours.map((p) => p.bookings), 1);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isSuperadmin ? 'Dashboard Global' : 'Dashboard Cabang'}
            </h1>
            <p className="text-slate-600 mt-2">Statistik dan performa operasional</p>
          </div>
          <Link
            to="/admin/payments"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Verifikasi Pembayaran
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-slate-500 mb-2">{card.label}</div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue 7 Hari Terakhir</h2>
            {revenue.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {revenue.map((point) => (
                  <div key={point.date}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {new Date(point.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-medium text-slate-900">{formatRupiah(point.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${(point.revenue / maxRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Peak Hours (30 Hari)</h2>
            {peakHours.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {peakHours.map((peak) => (
                  <div key={peak.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{peak.label}</span>
                      <span className="font-medium text-slate-900">{peak.bookings} booking</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${(peak.bookings / maxPeak) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isSuperadmin && branches.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Performa Cabang</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cabang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lapangan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{b.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{b.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{b.fields}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{b.bookings}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{formatRupiah(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
