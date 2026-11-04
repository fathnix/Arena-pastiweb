export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Analytics</h1>
        <p className="text-gray-600">Statistik dan laporan operasional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Bulanan</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Laporan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left">
            <div className="font-medium text-gray-900">Laporan Harian</div>
            <div className="text-sm text-gray-500 mt-1">Export ke Excel</div>
          </button>
          <button className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left">
            <div className="font-medium text-gray-900">Laporan Bulanan</div>
            <div className="text-sm text-gray-500 mt-1">Export ke PDF</div>
          </button>
          <button className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left">
            <div className="font-medium text-gray-900">Rekap Kasir</div>
            <div className="text-sm text-gray-500 mt-1">Export ke Excel</div>
          </button>
        </div>
      </div>
    </div>
  );
}
