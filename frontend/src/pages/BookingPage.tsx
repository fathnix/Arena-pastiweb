import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/Layout';
import { localDate } from '../lib/date';

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface Field {
  id: number;
  name: string;
  type: string;
  capacity: number;
  base_hourly_rate: number;
  description?: string;
  open_time?: string;
  close_time?: string;
  branch: { id: number; name: string };
}

interface TimeSlot {
  id: number;
  label: string;
  start_time: string;
  end_time: string;
}

interface Quote {
  subtotal: number;
  discount: number;
  total: number;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(localDate());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [pastSlots, setPastSlots] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchFields(branchId);
    }
  }, [branchId]);

  useEffect(() => {
    if (selectedField && selectedDate) {
      fetchAvailability();
    }
  }, [selectedField, selectedDate]);

  useEffect(() => {
    if (!selectedField || selectedSlots.length === 0) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);

    api
      .post('/bookings/quote', {
        field_id: selectedField,
        booking_date: selectedDate,
        time_slot_ids: selectedSlots,
      })
      .then(({ data }) => {
        if (!cancelled) setQuote(data);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedField, selectedDate, selectedSlots]);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data);
      if (data.length > 0) {
        setBranchId(data[0].id);
      }
    } catch {
      setError('Gagal memuat cabang');
    }
  };

  const fetchFields = async (selectedBranchId: number) => {
    try {
      const { data } = await api.get('/fields', { params: { branch_id: selectedBranchId } });
      setFields(data.data);
      setSelectedField(data.data.length > 0 ? data.data[0].id : null);
      setSelectedSlots([]);
      setSlots([]);
      setBookedSlots([]);
      setPastSlots([]);
    } catch {
      setError('Gagal memuat lapangan');
    }
  };

  const fetchAvailability = async () => {
    if (!selectedField) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/fields/${selectedField}/availability`, {
        params: { date: selectedDate },
      });
      setSlots(data.slots);
      setBookedSlots(data.booked_slot_ids);
      setPastSlots(data.past_slot_ids ?? []);
      setSelectedSlots([]);
    } catch {
      setError('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const isUnavailable = (slotId: number) => bookedSlots.includes(slotId) || pastSlots.includes(slotId);

  const toggleSlot = (slotId: number) => {
    if (isUnavailable(slotId)) return;
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      setError('Pilih minimal satu slot waktu');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const { data } = await api.post('/bookings', {
        field_id: selectedField,
        booking_date: selectedDate,
        time_slot_ids: selectedSlots,
      });

      navigate('/my-bookings');
      alert(`Booking berhasil! Kode: ${data.booking.booking_code}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat booking');
    } finally {
      setBookingLoading(false);
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

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Booking Lapangan</h1>
          <p className="text-slate-600 mt-2">Pilih cabang, lapangan, tanggal, dan slot waktu yang tersedia</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Pilih Cabang & Lapangan</h2>

              <label className="block text-sm font-medium text-slate-700 mb-0.5">Cabang</label>
              <select
                value={branchId ?? ''}
                onChange={(e) => setBranchId(Number(e.target.value))}
                className="w-full sm:w-72 mb-4 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              {fields.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada lapangan aktif di cabang ini.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => setSelectedField(field.id)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedField === field.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{field.name}</h3>
                          <p className="text-sm text-slate-600">{field.type}</p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {field.capacity} org
                        </span>
                      </div>
                      <p className="text-emerald-600 font-semibold text-sm">
                        {formatRupiah(field.base_hourly_rate)}/jam
                      </p>
                      {field.open_time && field.close_time && (
                        <p className="text-xs text-slate-400 mt-1">
                          {field.open_time} - {field.close_time}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Pilih Tanggal</h2>
              <input
                type="date"
                value={selectedDate}
                min={localDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Pilih Slot Waktu</h2>

              {loading ? (
                <p className="text-slate-500">Memuat jadwal...</p>
              ) : slots.length === 0 ? (
                <p className="text-slate-500">Tidak ada slot tersedia.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const unavailable = isUnavailable(slot.id);
                      const isBooked = bookedSlots.includes(slot.id);
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          onClick={() => toggleSlot(slot.id)}
                          disabled={unavailable}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                            unavailable
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isSelected
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'
                          }`}
                        >
                          {slot.label}
                          {isBooked && <span className="block text-[10px] font-normal">Terisi</span>}
                          {!isBooked && pastSlots.includes(slot.id) && (
                            <span className="block text-[10px] font-normal">Lewat</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span className="text-slate-600">Dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-200 rounded"></div>
                      <span className="text-slate-600">Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-100 border-2 border-slate-200 rounded"></div>
                      <span className="text-slate-600">Terisi / lewat</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Slot yang dipilih harus berurutan (tanpa jeda). Diskon 5% otomatis untuk 3 jam atau lebih.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Ringkasan</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-600">Cabang</span>
                  <span className="font-medium text-slate-900 text-right">
                    {branches.find((b) => b.id === branchId)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-600">Lapangan</span>
                  <span className="font-medium text-slate-900 text-right">
                    {selectedFieldData?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-600">Tanggal</span>
                  <span className="font-medium text-slate-900 text-right">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Slot dipilih</span>
                  <span className="font-medium text-slate-900">{selectedSlots.length} jam</span>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">
                      {quoteLoading ? '...' : formatRupiah(quote?.subtotal ?? 0)}
                    </span>
                  </div>
                  {!!quote?.discount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Diskon 5%</span>
                      <span className="text-emerald-600">-{formatRupiah(quote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {quoteLoading ? '...' : formatRupiah(quote?.total ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || selectedSlots.length === 0 || !quote}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Memproses...' : 'Booking Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
