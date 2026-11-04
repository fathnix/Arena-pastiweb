import { QRCodeSVG } from 'qrcode.react';

export interface TicketBooking {
  booking_code: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total: number;
  status: string;
  field?: { name: string; type?: string };
}

interface TicketModalProps {
  booking: TicketBooking;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending_payment: 'Menunggu Pembayaran',
  confirmed: 'Terkonfirmasi',
  checked_in: 'Check-in',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Expired',
};

export default function TicketModal({ booking, onClose }: TicketModalProps) {
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 text-center">
          <p className="text-xs uppercase tracking-wider opacity-80">E-Ticket</p>
          <h2 className="text-2xl font-bold mt-1">Arena Pasti</h2>
          <p className="text-xs opacity-80 mt-1">Tunjukkan QR ini di kasir</p>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white border-2 border-slate-100 rounded-xl">
              <QRCodeSVG value={booking.booking_code} size={160} level="M" />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-slate-500">Kode Booking</p>
            <p className="font-mono font-bold text-xl text-slate-900 tracking-wider">{booking.booking_code}</p>
          </div>

          <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Lapangan</span>
              <span className="font-medium text-slate-900">{booking.field?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal</span>
              <span className="font-medium text-slate-900 text-right">{formatDate(booking.booking_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu</span>
              <span className="font-medium text-slate-900">{booking.start_time} - {booking.end_time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-emerald-600">{formatRupiah(booking.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-900">{statusLabels[booking.status] ?? booking.status}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Cetak
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
