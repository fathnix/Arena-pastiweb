import { useState } from 'react';

export default function CustomerHome() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedField, setSelectedField] = useState<number | null>(null);

  const fields = [
    { id: 1, name: 'Lapangan A', type: 'Vinyl', price: 150000, status: 'available' },
    { id: 2, name: 'Lapangan B', type: 'Interlock', price: 180000, status: 'available' },
    { id: 3, name: 'Lapangan C', type: 'Matras', price: 120000, status: 'available' },
  ];

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return {
      id: i + 1,
      label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
      status: Math.random() > 0.3 ? 'available' : 'booked',
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Booking Lapangan Olahraga</h1>
        <p className="text-primary/80">Pilih lapangan dan jadwal yang tersedia untuk booking Anda</p>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Tanggal</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Field Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Lapangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map((field) => (
            <button
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                selectedField === field.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{field.name}</h3>
              <p className="text-sm text-gray-600">{field.type}</p>
              <p className="text-lg font-bold text-primary mt-2">
                Rp {field.price.toLocaleString('id-ID')}/jam
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedField && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jam</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={slot.status === 'booked'}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  slot.status === 'available'
                    ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white border-2 border-primary'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary/10 border-2 border-primary rounded"></div>
                <span className="text-gray-600">Tersedia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                <span className="text-gray-600">Sudah Dibooking</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
