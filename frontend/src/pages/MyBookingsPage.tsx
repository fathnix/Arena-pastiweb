import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/Layout';
import TicketModal from '../components/TicketModal';

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  proof_path?: string | null;
  rejection_reason?: string | null;
}

interface Booking {
  id: number;
  booking_code: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total: number;
  status: string;
  payment_status: string;
  field: { name: string; type: string };
  payments?: Payment[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Terkonfirmasi', color: 'bg-emerald-100 text-emerald-700' },
  checked_in: { label: 'Check-in', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Selesai', color: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', color: 'bg-slate-100 text-slate-500' },
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payFor, setPayFor] = useState<Booking | null>(null);
  const [method, setMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [file, setFile] = useState<File | null>(null);
  const [paying, setPaying] = useState(false);
  const [ticket, setTicket] = useState<Booking | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/history'),
      ]);
      setBookings(activeRes.data.data);
      setHistory(historyRes.data.data);
    } catch {
      setError('Gagal memuat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (code: string) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    try {
      await api.post(`/bookings/${code}/cancel`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membatalkan booking');
    }
  };

  const openPay = (booking: Booking) => {
    setPayFor(booking);
    setMethod('bank_transfer');
    setFile(null);
  };

  const handlePay = async () => {
    if (!payFor) return;

    if (method === 'bank_transfer' && !file) {
      alert('Silakan pilih file bukti transfer terlebih dahulu.');
      return;
    }

    setPaying(true);
    try {
      const { data } = await api.post('/payments', {
        booking_id: payFor.id,
        method,
        amount: payFor.total,
      });

      const paymentId = data.payment.id;

      if (method === 'bank_transfer' && file) {
        const formData = new FormData();
        formData.append('proof', file);
        await api.post(`/payments/${paymentId}/upload-proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert(
        method === 'cash'
          ? 'Pembayaran tunai dicatat. Silakan bayar di kasir agar booking dikonfirmasi.'
          : 'Bukti transfer terkirim. Menunggu verifikasi admin.'
      );
      setPayFor(null);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setPaying(false);
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Belum dibayar',
    pending: 'Menunggu verifikasi',
    paid: 'Lunas',
    failed: 'Ditolak',
    expired: 'Kedaluwarsa',
    refunded: 'Dikembalikan',
  };

  const list = tab === 'active' ? bookings : history;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Booking Saya</h1>
            <p className="text-slate-600 mt-2">Kelola dan pantau status booking Anda</p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                tab === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Aktif ({bookings.length})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                tab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Riwayat ({history.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-slate-500 mb-4">
              {tab === 'active' ? 'Belum ada booking aktif' : 'Belum ada riwayat booking'}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/booking')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Buat Booking
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((booking) => {
              const status = statusLabels[booking.status] || { label: booking.status, color: 'bg-slate-100 text-slate-700' };
              const lastPayment = booking.payments && booking.payments.length > 0
                ? booking.payments[booking.payments.length - 1]
                : null;

              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-500">Kode Booking</div>
                      <div className="font-mono font-bold text-lg text-slate-900">{booking.booking_code}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-500">Lapangan</div>
                      <div className="font-semibold text-slate-900">{booking.field?.name}</div>
                      <div className="text-sm text-slate-600">{booking.field?.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Tanggal & Waktu</div>
                      <div className="font-semibold text-slate-900">{formatDate(booking.booking_date)}</div>
                      <div className="text-sm text-slate-600">{booking.start_time} - {booking.end_time}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Total</div>
                      <div className="font-bold text-emerald-600 text-lg">{formatRupiah(booking.total)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending_payment' && tab === 'active' && (
                      <>
                        <button
                          onClick={() => openPay(booking)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Bayar Sekarang
                        </button>
                        <button
                          onClick={() => handleCancel(booking.booking_code)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                    {['confirmed', 'checked_in', 'completed'].includes(booking.status) && (
                      <button
                        onClick={() => setTicket(booking)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition"
                      >
                        Lihat Tiket
                      </button>
                    )}
                    {lastPayment && (
                      <div className="text-sm text-slate-500 self-center">
                        Pembayaran: {paymentStatusLabels[lastPayment.status] ?? lastPayment.status}
                        {lastPayment.status === 'failed' && lastPayment.rejection_reason && (
                          <span className="block text-xs text-red-500">
                            Alasan: {lastPayment.rejection_reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ticket && <TicketModal booking={ticket} onClose={() => setTicket(null)} />}

      {payFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Pembayaran</h2>
            <p className="text-sm text-slate-500 mb-4">
              {payFor.booking_code} — {formatRupiah(payFor.total)}
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-2">Metode Pembayaran</label>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'bank_transfer'}
                  onChange={() => setMethod('bank_transfer')}
                />
                <span className="text-sm text-slate-800">Transfer Bank (upload bukti)</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'cash'}
                  onChange={() => setMethod('cash')}
                />
                <span className="text-sm text-slate-800">Tunai (bayar di kasir)</span>
              </label>
            </div>

            {method === 'bank_transfer' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bukti Transfer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {paying ? 'Memproses...' : 'Konfirmasi'}
              </button>
              <button
                onClick={() => setPayFor(null)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
