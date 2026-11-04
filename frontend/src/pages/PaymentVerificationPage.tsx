import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  proof_path?: string;
  booking: {
    booking_code: string;
    customer_name?: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    field?: { name: string };
    user?: { name: string };
  };
}

const methodLabels: Record<string, string> = {
  cash: 'Tunai',
  bank_transfer: 'Transfer Bank',
  qris: 'QRIS',
  virtual_account: 'Virtual Account',
  ewallet: 'E-Wallet',
};

export default function PaymentVerificationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments/pending');
      setPayments(data.data);
    } catch (err) {
      setError('Gagal memuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await api.post(`/payments/${id}/verify`);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal verifikasi');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;
    try {
      await api.post(`/payments/${id}/reject`, { reason });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak');
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Verifikasi Pembayaran</h1>
          <p className="text-slate-600 mt-2">Review bukti transfer dan konfirmasi pembayaran</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-slate-500">Tidak ada pembayaran yang menunggu verifikasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-500">Kode Booking</div>
                    <div className="font-mono font-bold text-lg text-slate-900">
                      {payment.booking.booking_code}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Jumlah</div>
                    <div className="font-bold text-emerald-600 text-lg">{formatRupiah(payment.amount)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-500">Customer</div>
                    <div className="font-medium text-slate-900">
                      {payment.booking.customer_name || payment.booking.user?.name || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Lapangan</div>
                    <div className="font-medium text-slate-900">{payment.booking.field?.name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Jadwal</div>
                    <div className="font-medium text-slate-900">
                      {new Date(`${payment.booking.booking_date}T00:00:00`).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-slate-600">
                      {payment.booking.start_time} - {payment.booking.end_time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Metode</div>
                    <div className="font-medium text-slate-900">
                      {methodLabels[payment.method] ?? payment.method}
                    </div>
                  </div>
                </div>

                {!payment.proof_path && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                    Pembayaran tunai — terima uang di kasir terlebih dahulu, lalu klik Terima.
                  </div>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  {payment.proof_path && (
                    <a
                      href={payment.proof_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition"
                    >
                      Lihat Bukti
                    </a>
                  )}
                  <button
                    onClick={() => handleVerify(payment.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
