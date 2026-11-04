import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';

interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface PeakHour {
  label: string;
  bookings: number;
}

interface Stats {
  today_bookings: number;
  today_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  upcoming_bookings: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes, peakRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue', { params: { days } }),
        api.get('/dashboard/peak-hours'),
      ]);
      setStats(statsRes.data);
      setRevenue(revenueRes.data);
      setPeakHours(peakRes.data);
    } catch {
      setError('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const exportRevenueCsv = () => {
    const header = 'Tanggal,Revenue,Booking\n';
    const rows = revenue
      .map((r) => `${r.date},${r.revenue},${r.bookings}`)
      .join('\n');
    downloadCsv(header + rows, `laporan-revenue-${days}hari.csv`);
  };

  const exportPeakCsv = () => {
    const header = 'Slot Waktu,Jumlah Booking\n';
    const rows = peakHours.map((p) => `"${p.label}",${p.bookings}`).join('\n');
    downloadCsv(header + rows, 'laporan-peak-hours.csv');
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = revenue.reduce((sum, r) => sum + r.bookings, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Laporan & Analytics</h1>
            <p className="text-slate-600 mt-2">Statistik pendapatan dan jam sibuk</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          >
            <option value={7}>7 hari terakhir</option>
            <option value={30}>30 hari terakhir</option>
            <option value={90}>90 hari terakhir</option>
          </select>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-slate-500 mb-1">Revenue {days} Hari</p>
                <p className="text-2xl font-bold text-emerald-600">{formatRupiah(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-slate-500 mb-1">Total Booking</p>
                <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-slate-500 mb-1">Revenue Bulan Ini</p>
                <p className="text-2xl font-bold text-slate-900">{formatRupiah(stats?.monthly_revenue ?? 0)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-slate-500 mb-1">Pending Payment</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.pending_payments ?? 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Revenue Harian</h2>
                  <button onClick={exportRevenueCsv} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Export CSV
                  </button>
                </div>
                {revenue.length === 0 ? (
                  <p className="text-slate-500 text-sm">Belum ada data</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {revenue.map((r) => (
                      <div key={r.date} className="flex justify-between text-sm py-1 border-b border-slate-50">
                        <span className="text-slate-600">
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-slate-400">{r.bookings} booking</span>
                        <span className="font-medium text-slate-900">{formatRupiah(r.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Peak Hours (30 hari)</h2>
                  <button onClick={exportPeakCsv} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Export CSV
                  </button>
                </div>
                {peakHours.length === 0 ? (
                  <p className="text-slate-500 text-sm">Belum ada data</p>
                ) : (
                  <div className="space-y-2">
                    {peakHours.map((p) => {
                      const max = Math.max(...peakHours.map((x) => x.bookings), 1);
                      return (
                        <div key={p.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{p.label}</span>
                            <span className="font-medium text-slate-900">{p.bookings}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(p.bookings / max) * 100}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
