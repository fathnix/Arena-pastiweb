<?php

namespace App\Services;

use App\BookingStatus;
use App\Models\BookingSlot;
use App\Models\Field;
use App\Models\TimeSlot;
use App\PaymentStatus;
use App\Repositories\BookingRepository;
use Illuminate\Support\Carbon;
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
            $field = Field::findOrFail($data['field_id']);

            if ($field->status !== 'active') {
                throw new \Exception('Lapangan sedang tidak aktif.');
            }

            $timeSlots = TimeSlot::whereIn('id', $data['time_slot_ids'])
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            if ($timeSlots->count() !== count(array_unique($data['time_slot_ids']))) {
                throw new \Exception('Slot waktu tidak valid.');
            }

            $this->validateSlotSequence($field, $data['booking_date'], $timeSlots);

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

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => BookingStatus::Cancelled]);
            $booking->slots()->delete();
        });

        return [
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
        ];
    }

    private function validateSlotSequence(Field $field, string $date, $timeSlots): void
    {
        $bookingDate = Carbon::parse($date);

        $first = $timeSlots->first();
        $firstStart = Carbon::parse($bookingDate->toDateString().' '.$first->start_time);

        if ($bookingDate->isToday() && $firstStart->lessThanOrEqualTo(now())) {
            throw new \Exception('Slot waktu yang dipilih sudah lewat.');
        }

        $openTime = Carbon::parse($bookingDate->toDateString().' '.$field->open_time);
        $closeTime = Carbon::parse($bookingDate->toDateString().' '.$field->close_time);

        if ($firstStart->lessThan($openTime) || Carbon::parse($bookingDate->toDateString().' '.$timeSlots->last()->end_time)->greaterThan($closeTime)) {
            throw new \Exception('Slot waktu di luar jam operasional lapangan.');
        }

        $previousEnd = null;

        foreach ($timeSlots as $slot) {
            $start = Carbon::parse($bookingDate->toDateString().' '.$slot->start_time);
            $end = Carbon::parse($bookingDate->toDateString().' '.$slot->end_time);

            if ($previousEnd && ! $start->equalTo($previousEnd)) {
                throw new \Exception('Slot waktu harus berurutan tanpa jeda.');
            }

            $previousEnd = $end;
        }
    }

    private function generateBookingCode(): string
    {
        do {
            $code = 'BK'.strtoupper(Str::random(8));
        } while (DB::table('bookings')->where('booking_code', $code)->exists());

        return $code;
    }
}
