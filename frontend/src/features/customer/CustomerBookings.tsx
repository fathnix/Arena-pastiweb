export default function CustomerBookings() {
  const bookings = [
    {
      id: 1,
      code: 'ARN-261104-A7X2',
      field: 'Lapangan A',
      date: '2026-11-05',
      time: '15:00 - 17:00',
      status: 'pending_payment',
      total: 300000,
    },
    {
      id: 2,
      code: 'ARN-261103-B8Y3',
      field: 'Lapangan B',
      date: '2026-11-03',
      time: '19:00 - 21:00',
      status: 'confirmed',
      total: 360000,
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels = {
      pending_payment: 'Menunggu Pembayaran',
      confirmed: 'Terkonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Booking</h1>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Kode Booking</p>
                <p className="font-mono font-bold text-lg text-gray-900">{booking.code}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Lapangan</p>
                <p className="font-semibold text-gray-900">{booking.field}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                <p className="font-semibold text-gray-900">{booking.date}</p>
                <p className="text-sm text-gray-600">{booking.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="font-bold text-lg text-primary">
                  Rp {booking.total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              {booking.status === 'pending_payment' && (
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                  Upload Bukti Bayar
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-colors text-sm font-medium">
                  Lihat Tiket
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
