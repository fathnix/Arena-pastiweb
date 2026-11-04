export default function AdminFields() {
  const fields = [
    { id: 1, name: 'Lapangan A', type: 'Vinyl', price: 150000, status: 'active', bookings: 8 },
    { id: 2, name: 'Lapangan B', type: 'Interlock', price: 180000, status: 'active', bookings: 12 },
    { id: 3, name: 'Lapangan C', type: 'Matras', price: 120000, status: 'active', bookings: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lapangan</h1>
          <p className="text-gray-600">Kelola data lapangan</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
          + Tambah Lapangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5"></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-600">{field.type}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga/jam</span>
                  <span className="font-semibold text-gray-900">
                    Rp {field.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking bulan ini</span>
                  <span className="font-semibold text-primary">{field.bookings}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                  Edit
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
