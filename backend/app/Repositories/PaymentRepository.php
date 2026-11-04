<?php

namespace App\Repositories;

use App\Models\Payment;
use App\PaymentStatus;
use Illuminate\Database\Eloquent\Collection;

class PaymentRepository
{
    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function findByBookingId(int $bookingId): ?Payment
    {
        return Payment::where('booking_id', $bookingId)
            ->latest()
            ->first();
    }

    public function getPendingVerifications(int $branchId, int $limit = 50): Collection
    {
        return Payment::with(['booking.field', 'booking.user'])
            ->whereHas('booking', fn ($q) => $q->where('branch_id', $branchId))
            ->where('status', PaymentStatus::Pending)
            ->whereNotNull('proof_path')
            ->orderBy('created_at')
            ->limit($limit)
            ->get();
    }

    public function verify(int $paymentId, int $verifiedBy): bool
    {
        return Payment::where('id', $paymentId)
            ->update([
                'status' => PaymentStatus::Paid,
                'verified_by' => $verifiedBy,
                'verified_at' => now(),
                'paid_at' => now(),
            ]);
    }

    public function reject(int $paymentId, int $verifiedBy, string $reason): bool
    {
        return Payment::where('id', $paymentId)
            ->update([
                'status' => PaymentStatus::Failed,
                'verified_by' => $verifiedBy,
                'verified_at' => now(),
                'rejection_reason' => $reason,
            ]);
    }
}
