export default function AdminDashboard() {
  const stats = [
    { label: 'Booking Hari Ini', value: '12', change: '+8%', color: 'primary' },
    { label: 'Pending Payment', value: '5', change: '-2', color: 'amber' },
    { label: 'Revenue Hari Ini', value: 'Rp 2.4jt', change: '+12%', color: 'green' },
    { label: 'Lapangan Aktif', value: '3/3', change: '100%', color: 'blue' },
  ];

  const recentBookings = [
    { id: 1, code: 'ARN-261104-X7Y2', customer: 'Ahmad Rifai', field: 'Lapangan A', time: '15:00-17:00', status: 'confirmed' },
    { id: 2, code: 'ARN-261104-B3C4', customer: 'Budi Santoso', field: 'Lapangan B', time: '19:00-21:00', status: 'pending_payment' },
    { id: 3, code: 'ARN-261104-D5E6', customer: 'Citra Dewi', field: 'Lapangan C', time: '08:00-10:00', status: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan operasional hari ini</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</dd>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500"> dari kemarin</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Booking Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{booking.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.field}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Terkonfirmasi' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
