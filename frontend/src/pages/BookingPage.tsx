import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Field {
  id: number;
  name: string;
  type: string;
  capacity: number;
  base_hourly_rate: number;
  description?: string;
  branch: { id: number; name: string };
}

interface TimeSlot {
  id: number;
  label: string;
  start_time: string;
  end_time: string;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (selectedField && selectedDate) {
      fetchAvailability();
    }
  }, [selectedField, selectedDate]);

  const fetchFields = async () => {
    try {
      const { data } = await api.get('/fields');
      setFields(data.data);
      if (data.data.length > 0) {
        setSelectedField(data.data[0].id);
      }
    } catch (err) {
      setError('Gagal memuat lapangan');
    }
  };

  const fetchAvailability = async () => {
    if (!selectedField) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/fields/${selectedField}/availability`, {
        params: { date: selectedDate },
      });
      setSlots(data.slots);
      setBookedSlots(data.booked_slot_ids);
      setSelectedSlots([]);
    } catch (err) {
      setError('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slotId: number) => {
    if (bookedSlots.includes(slotId)) return;
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const calculateTotal = () => {
    const field = fields.find((f) => f.id === selectedField);
    if (!field) return 0;
    return field.base_hourly_rate * selectedSlots.length;
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Booking Lapangan</h1>
          <p className="text-slate-600 mt-2">Pilih lapangan, tanggal, dan slot waktu yang tersedia</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Pilih Lapangan</h2>
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
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Pilih Tanggal</h2>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Pilih Slot Waktu</h2>
              
              {loading ? (
                <p className="text-slate-500">Memuat jadwal...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.id);
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          onClick={() => toggleSlot(slot.id)}
                          disabled={isBooked}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                            isBooked
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm">
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
                      <span className="text-slate-600">Terisi</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Ringkasan</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Lapangan</span>
                  <span className="font-medium text-slate-900">
                    {fields.find((f) => f.id === selectedField)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tanggal</span>
                  <span className="font-medium text-slate-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Slot dipilih</span>
                  <span className="font-medium text-slate-900">{selectedSlots.length} jam</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {formatRupiah(calculateTotal())}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || selectedSlots.length === 0}
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
