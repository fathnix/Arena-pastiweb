<?php

namespace App\Services;

use App\BookingStatus;
use App\Models\BookingSlot;
use App\Models\TimeSlot;
use App\PaymentStatus;
use App\Repositories\BookingRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private PricingService $pricingService
    ) {}

    public function createBooking(array $data): array
    {
        return DB::transaction(function () use ($data) {
            if (! $this->bookingRepository->lockSlotsForBooking(
                $data['field_id'],
                $data['booking_date'],
                $data['time_slot_ids']
            )) {
                throw new \Exception('Slot sudah dibooking. Silakan pilih waktu lain.');
            }

            $pricing = $this->pricingService->calculatePrice(
                $data['field_id'],
                $data['booking_date'],
                $data['time_slot_ids']
            );

            $timeSlots = TimeSlot::whereIn('id', $data['time_slot_ids'])
                ->orderBy('sort_order')
                ->get();

            $booking = $this->bookingRepository->create([
                'booking_code' => $this->generateBookingCode(),
                'user_id' => $data['user_id'] ?? null,
                'branch_id' => $data['branch_id'],
                'field_id' => $data['field_id'],
                'booking_date' => $data['booking_date'],
                'start_time' => $timeSlots->first()->start_time,
                'end_time' => $timeSlots->last()->end_time,
                'subtotal' => $pricing['subtotal'],
                'discount' => $pricing['discount'],
                'total' => $pricing['total'],
                'status' => BookingStatus::PendingPayment,
                'payment_status' => PaymentStatus::Unpaid,
                'source' => $data['source'] ?? 'online',
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'expires_at' => now()->addMinutes(30),
                'created_by' => $data['created_by'] ?? null,
            ]);

            foreach ($timeSlots as $slot) {
                BookingSlot::create([
                    'booking_id' => $booking->id,
                    'field_id' => $data['field_id'],
                    'booking_date' => $data['booking_date'],
                    'time_slot_id' => $slot->id,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'price' => $pricing['slot_prices'][$slot->id] ?? $pricing['subtotal'],
                ]);
            }

            return [
                'success' => true,
                'booking' => $booking->load(['field', 'slots.timeSlot']),
                'pricing' => $pricing,
            ];
        });
    }

    public function checkIn(string $bookingCode, int $adminId): array
    {
        $booking = $this->bookingRepository->findByCode($bookingCode);

        if (! $booking) {
            throw new \Exception('Booking tidak ditemukan.');
        }

        if ($booking->status !== BookingStatus::Confirmed) {
            throw new \Exception('Booking belum confirmed atau sudah check-in.');
        }

        $booking->update([
            'status' => BookingStatus::CheckedIn,
            'checked_in_at' => now(),
        ]);

        return [
            'success' => true,
            'booking' => $booking->fresh()->load(['field', 'user']),
        ];
    }

    public function complete(int $bookingId): bool
    {
        return DB::table('bookings')
            ->where('id', $bookingId)
            ->where('status', BookingStatus::CheckedIn)
            ->update([
                'status' => BookingStatus::Completed->value,
                'completed_at' => now(),
                'updated_at' => now(),
            ]) > 0;
    }

    public function cancel(string $bookingCode, ?int $userId = null): array
    {
        $booking = $this->bookingRepository->findByCode($bookingCode);

        if (! $booking) {
            throw new \Exception('Booking tidak ditemukan.');
        }

        if ($userId && $booking->user_id !== $userId) {
            throw new \Exception('Unauthorized.');
        }

        if (in_array($booking->status, [BookingStatus::Completed, BookingStatus::Cancelled])) {
            throw new \Exception('Booking tidak bisa dibatalkan.');
        }

        $booking->update(['status' => BookingStatus::Cancelled]);

        return [
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
        ];
    }

    private function generateBookingCode(): string
    {
        do {
            $code = 'BK'.strtoupper(Str::random(8));
        } while (DB::table('bookings')->where('booking_code', $code)->exists());

        return $code;
    }
}
