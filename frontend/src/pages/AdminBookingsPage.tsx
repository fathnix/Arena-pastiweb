import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Booking {
  id: number;
  booking_code: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total: number;
  status: string;
  payment_status: string;
  customer_name?: string;
  field?: { name: string };
  user?: { name: string };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Terkonfirmasi', color: 'bg-emerald-100 text-emerald-700' },
  checked_in: { label: 'Check-in', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Selesai', color: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', color: 'bg-slate-100 text-slate-500' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [date]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings', { params: { date } });
      setBookings(data.data);
    } catch (err) {
      setError('Gagal memuat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (code: string) => {
    try {
      await api.post(`/bookings/${code}/check-in`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal check-in');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.post(`/bookings/${id}/complete`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan booking');
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Booking</h1>
            <p className="text-slate-600 mt-2">Check-in dan selesaikan booking customer</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-slate-500">
            Tidak ada booking pada tanggal ini
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Waktu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => {
                    const status = statusLabels[b.status] || { label: b.status, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-mono text-slate-900">{b.booking_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {b.customer_name || b.user?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.field?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.start_time} - {b.end_time}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatRupiah(b.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleCheckIn(b.booking_code)}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              Check-in
                            </button>
                          )}
                          {b.status === 'checked_in' && (
                            <button
                              onClick={() => handleComplete(b.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Selesai
                            </button>
                          )}
                          {!['confirmed', 'checked_in'].includes(b.status) && (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
