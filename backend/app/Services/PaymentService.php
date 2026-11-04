<?php

namespace App\Services;

use App\BookingStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\PaymentMethod;
use App\PaymentStatus;
use App\Repositories\PaymentRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private PaymentRepository $paymentRepository
    ) {}

    public function createPayment(int $bookingId, PaymentMethod $method, int $amount): array
    {
        $booking = Booking::findOrFail($bookingId);

        if (in_array($booking->status, [BookingStatus::Cancelled, BookingStatus::Expired, BookingStatus::Completed])) {
            throw new \Exception('Booking tidak dapat dibayar.');
        }

        if ($booking->payment_status === PaymentStatus::Paid) {
            throw new \Exception('Booking sudah dibayar.');
        }

        if ($amount !== $booking->total) {
            throw new \Exception('Nominal pembayaran tidak sesuai total booking.');
        }

        $existingPayment = $this->paymentRepository->findByBookingId($bookingId);

        if ($existingPayment && $existingPayment->status === PaymentStatus::Pending) {
            $existingPayment->update([
                'method' => $method,
                'amount' => $amount,
            ]);

            return [
                'success' => true,
                'payment' => $existingPayment->fresh(),
            ];
        }

        $payment = $this->paymentRepository->create([
            'booking_id' => $bookingId,
            'method' => $method,
            'amount' => $amount,
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
            'expires_at' => now()->addMinutes(30),
        ]);

        return [
            'success' => true,
            'payment' => $payment,
        ];
    }

    public function uploadProof(int $paymentId, UploadedFile $file): array
    {
        $payment = Payment::findOrFail($paymentId);

        if ($payment->status === PaymentStatus::Paid) {
            throw new \Exception('Pembayaran sudah diverifikasi.');
        }

        if (in_array($payment->status, [PaymentStatus::Expired, PaymentStatus::Refunded])) {
            throw new \Exception('Pembayaran tidak dapat diubah.');
        }

        $path = $file->store('payment-proofs', 'public');

        DB::table('payments')
            ->where('id', $paymentId)
            ->update([
                'proof_path' => $path,
                'status' => PaymentStatus::Pending->value,
                'rejection_reason' => null,
                'updated_at' => now(),
            ]);

        return [
            'success' => true,
            'path' => $path,
        ];
    }

    public function verify(int $paymentId, int $verifiedBy): array
    {
        return DB::transaction(function () use ($paymentId, $verifiedBy) {
            $payment = Payment::with('booking')->where('status', PaymentStatus::Pending)->find($paymentId);

            if (! $payment) {
                throw new \Exception('Pembayaran tidak ditemukan atau sudah diproses.');
            }

            if ($payment->booking->status === BookingStatus::Cancelled) {
                throw new \Exception('Booking sudah dibatalkan.');
            }

            $this->paymentRepository->verify($paymentId, $verifiedBy);

            DB::table('bookings')
                ->where('id', $payment->booking_id)
                ->update([
                    'payment_status' => PaymentStatus::Paid->value,
                    'status' => BookingStatus::Confirmed->value,
                    'updated_at' => now(),
                ]);

            return [
                'success' => true,
                'message' => 'Pembayaran berhasil diverifikasi.',
            ];
        });
    }

    public function reject(int $paymentId, int $verifiedBy, string $reason): array
    {
        $payment = Payment::with('booking')->where('status', PaymentStatus::Pending)->find($paymentId);

        if (! $payment) {
            throw new \Exception('Pembayaran tidak ditemukan atau sudah diproses.');
        }

        $this->paymentRepository->reject($paymentId, $verifiedBy, $reason);

        return [
            'success' => true,
            'message' => 'Pembayaran ditolak.',
        ];
    }
}
