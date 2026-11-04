<?php

namespace App\Services;

use App\BookingStatus;
use App\Models\Payment;
use App\PaymentMethod;
use App\PaymentStatus;
use App\Repositories\PaymentRepository;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private PaymentRepository $paymentRepository
    ) {}

    public function createPayment(int $bookingId, PaymentMethod $method, int $amount): array
    {
        $payment = $this->paymentRepository->create([
            'booking_id' => $bookingId,
            'method' => $method,
            'amount' => $amount,
            'status' => $method === PaymentMethod::Cash ? PaymentStatus::Paid : PaymentStatus::Pending,
            'paid_at' => $method === PaymentMethod::Cash ? now() : null,
            'expires_at' => now()->addMinutes(30),
        ]);

        if ($method === PaymentMethod::Cash) {
            DB::table('bookings')
                ->where('id', $bookingId)
                ->update([
                    'payment_status' => PaymentStatus::Paid->value,
                    'status' => BookingStatus::Confirmed->value,
                    'updated_at' => now(),
                ]);
        }

        return [
            'success' => true,
            'payment' => $payment,
        ];
    }

    public function uploadProof(int $paymentId, $file): array
    {
        $path = $file->store('payment-proofs', 'public');

        DB::table('payments')
            ->where('id', $paymentId)
            ->update([
                'proof_path' => $path,
                'status' => PaymentStatus::Pending->value,
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
            $payment = Payment::with('booking')->findOrFail($paymentId);

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
        $this->paymentRepository->reject($paymentId, $verifiedBy, $reason);

        return [
            'success' => true,
            'message' => 'Pembayaran ditolak.',
        ];
    }
}
