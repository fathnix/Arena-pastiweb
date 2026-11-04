import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { localDate } from '../lib/date';

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

interface Field {
  id: number;
  name: string;
  base_hourly_rate: number;
}

interface Branch {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  label: string;
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
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [date, setDate] = useState(localDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [pastSlots, setPastSlots] = useState<number[]>([]);
  const [walkInBranchId, setWalkInBranchId] = useState('');
  const [walkIn, setWalkIn] = useState({
    customer_name: '',
    customer_phone: '',
    field_id: '',
    booking_date: localDate(),
    time_slot_ids: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isSuperadmin) {
      api
        .get('/branches')
        .then(({ data }) => setBranches(data))
        .catch(() => setBranches([]));
    }
  }, [isSuperadmin]);

  useEffect(() => {
    fetchBookings();
  }, [date, branchFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { date };

      if (isSuperadmin && branchFilter) {
        params.branch_id = branchFilter;
      }

      const { data } = await api.get('/bookings', { params });
      setBookings(data.data);
    } catch {
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

  const openWalkIn = async () => {
    setShowWalkIn(true);
    setWalkIn({
      customer_name: '',
      customer_phone: '',
      field_id: '',
      booking_date: localDate(),
      time_slot_ids: [],
    });
    setWalkInBranchId(isSuperadmin ? branchFilter : '');
    await loadWalkInFields(isSuperadmin && branchFilter ? Number(branchFilter) : undefined);
  };

  const loadWalkInFields = async (branchId?: number) => {
    try {
      const { data } = await api.get('/fields', {
        params: branchId ? { branch_id: branchId } : {},
      });
      setFields(data.data);
      if (data.data.length > 0) {
        setWalkIn((w) => ({ ...w, field_id: String(data.data[0].id), time_slot_ids: [] }));
        fetchSlots(data.data[0].id, localDate());
      } else {
        setWalkIn((w) => ({ ...w, field_id: '', time_slot_ids: [] }));
        setSlots([]);
        setBookedSlots([]);
        setPastSlots([]);
      }
    } catch {
      alert('Gagal memuat lapangan');
    }
  };

  const changeWalkInBranch = async (value: string) => {
    setWalkInBranchId(value);
    setWalkIn((w) => ({ ...w, field_id: '', time_slot_ids: [] }));
    await loadWalkInFields(value ? Number(value) : undefined);
  };

  const fetchSlots = async (fieldId: number | string, bookingDate: string) => {
    try {
      const { data } = await api.get(`/fields/${fieldId}/availability`, { params: { date: bookingDate } });
      setSlots(data.slots);
      setBookedSlots(data.booked_slot_ids);
      setPastSlots(data.past_slot_ids ?? []);
    } catch {
      setSlots([]);
      setBookedSlots([]);
      setPastSlots([]);
    }
  };

  const updateWalkIn = (patch: Partial<typeof walkIn>) => {
    const next = { ...walkIn, ...patch };
    setWalkIn(next);

    if (patch.field_id || patch.booking_date) {
      if (next.field_id) {
        fetchSlots(next.field_id, next.booking_date);
        setWalkIn((w) => ({ ...w, time_slot_ids: [] }));
      }
    }
  };

  const toggleSlot = (id: number) => {
    if (bookedSlots.includes(id) || pastSlots.includes(id)) return;
    setWalkIn((w) => ({
      ...w,
      time_slot_ids: w.time_slot_ids.includes(id)
        ? w.time_slot_ids.filter((s) => s !== id)
        : [...w.time_slot_ids, id],
    }));
  };

  const submitWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (walkIn.time_slot_ids.length === 0) {
      alert('Pilih minimal satu slot.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/bookings', {
        field_id: Number(walkIn.field_id),
        booking_date: walkIn.booking_date,
        time_slot_ids: walkIn.time_slot_ids,
        customer_name: walkIn.customer_name,
        customer_phone: walkIn.customer_phone || null,
      });
      alert(`Walk-in booking dibuat. Kode: ${data.booking.booking_code}`);
      setShowWalkIn(false);
      setDate(walkIn.booking_date);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat walk-in booking');
    } finally {
      setSaving(false);
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
            <p className="text-slate-600 mt-2">Check-in, selesaikan, dan buat walk-in booking</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isSuperadmin && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                <option value="">Semua Cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={openWalkIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Walk-in
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

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
                            <button onClick={() => handleCheckIn(b.booking_code)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                              Check-in
                            </button>
                          )}
                          {b.status === 'checked_in' && (
                            <button onClick={() => handleComplete(b.id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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

      {showWalkIn && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={submitWalkIn} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Walk-in Booking</h2>
            <div className="space-y-3">
              {isSuperadmin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cabang</label>
                  <select
                    value={walkInBranchId}
                    onChange={(e) => changeWalkInBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Pilih cabang</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Customer *</label>
                  <input
                    required
                    value={walkIn.customer_name}
                    onChange={(e) => setWalkIn({ ...walkIn, customer_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                  <input
                    value={walkIn.customer_phone}
                    onChange={(e) => setWalkIn({ ...walkIn, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lapangan</label>
                  <select
                    value={walkIn.field_id}
                    onChange={(e) => updateWalkIn({ field_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={walkIn.booking_date}
                    min={localDate()}
                    onChange={(e) => updateWalkIn({ booking_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slot Waktu</label>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot.id);
                    const isPast = pastSlots.includes(slot.id);
                    const isSelected = walkIn.time_slot_ids.includes(slot.id);
                    const unavailable = isBooked || isPast;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={unavailable}
                        onClick={() => toggleSlot(slot.id)}
                        className={`px-2 py-2 rounded-lg border-2 text-xs font-medium transition ${
                          unavailable
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Buat Booking'}
              </button>
              <button
                type="button"
                onClick={() => setShowWalkIn(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
