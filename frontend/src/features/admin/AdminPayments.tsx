export default function AdminPayments() {
  const payments = [
    { id: 1, booking: 'ARN-261104-A1B2', customer: 'Ahmad Rifai', amount: 300000, method: 'transfer', status: 'pending', proof: true },
    { id: 2, booking: 'ARN-261104-C3D4', customer: 'Budi Santoso', amount: 180000, method: 'cash', status: 'verified', proof: false },
    { id: 3, booking: 'ARN-261103-E5F6', customer: 'Citra Dewi', amount: 240000, method: 'transfer', status: 'pending', proof: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
        <p className="text-gray-600">Review dan konfirmasi pembayaran manual</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-amber-800">
            {payments.filter(p => p.status === 'pending').length} pembayaran menunggu verifikasi
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium">{payment.booking}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="capitalize">{payment.method}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {payment.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    {payment.proof && payment.status === 'pending' && (
                      <>
                        <button className="text-primary hover:text-primary-dark font-medium">Lihat Bukti</button>
                        <button className="text-green-600 hover:text-green-700 font-medium">Terima</button>
                        <button className="text-red-600 hover:text-red-700 font-medium">Tolak</button>
                      </>
                    )}
                    {payment.status === 'verified' && (
                      <span className="text-gray-400">Selesai</span>
                    )}
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
