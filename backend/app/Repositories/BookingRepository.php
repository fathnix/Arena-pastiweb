<?php

namespace App\Repositories;

use App\BookingStatus;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BookingRepository
{
    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function findByCode(string $code): ?Booking
    {
        return Booking::with(['field', 'slots.timeSlot', 'payments'])
            ->where('booking_code', $code)
            ->first();
    }

    public function checkSlotAvailability(int $fieldId, string $date, array $timeSlotIds): bool
    {
        return DB::table('booking_slots')
            ->join('bookings', 'booking_slots.booking_id', '=', 'bookings.id')
            ->where('booking_slots.field_id', $fieldId)
            ->where('booking_slots.booking_date', $date)
            ->whereIn('booking_slots.time_slot_id', $timeSlotIds)
            ->whereNotIn('bookings.status', [BookingStatus::Cancelled->value, BookingStatus::Expired->value])
            ->where(function ($query) {
                $query->where('bookings.status', '!=', BookingStatus::PendingPayment->value)
                    ->orWhere('bookings.expires_at', '>', now());
            })
            ->doesntExist();
    }

    public function lockSlotsForBooking(int $fieldId, string $date, array $timeSlotIds): bool
    {
        return DB::transaction(function () use ($fieldId, $date, $timeSlotIds) {
            $this->releaseExpiredHolds($fieldId, $date, $timeSlotIds);

            DB::table('booking_slots')
                ->join('bookings', 'booking_slots.booking_id', '=', 'bookings.id')
                ->where('booking_slots.field_id', $fieldId)
                ->where('booking_slots.booking_date', $date)
                ->whereIn('booking_slots.time_slot_id', $timeSlotIds)
                ->whereNotIn('bookings.status', [BookingStatus::Cancelled->value, BookingStatus::Expired->value])
                ->where(function ($query) {
                    $query->where('bookings.status', '!=', BookingStatus::PendingPayment->value)
                        ->orWhere('bookings.expires_at', '>', now());
                })
                ->lockForUpdate()
                ->get();

            return $this->checkSlotAvailability($fieldId, $date, $timeSlotIds);
        });
    }

    /**
     * Remove slot holds from cancelled bookings and unpaid bookings past expiry.
     */
    private function releaseExpiredHolds(int $fieldId, string $date, array $timeSlotIds): void
    {
        $staleBookingIds = DB::table('bookings')
            ->join('booking_slots', 'booking_slots.booking_id', '=', 'bookings.id')
            ->where('booking_slots.field_id', $fieldId)
            ->where('booking_slots.booking_date', $date)
            ->whereIn('booking_slots.time_slot_id', $timeSlotIds)
            ->where(function ($query) {
                $query->whereIn('bookings.status', [
                    BookingStatus::Cancelled->value,
                    BookingStatus::Expired->value,
                ])->orWhere(function ($pendingQuery) {
                    $pendingQuery->where('bookings.status', BookingStatus::PendingPayment->value)
                        ->where('bookings.expires_at', '<=', now());
                });
            })
            ->pluck('bookings.id')
            ->unique();

        if ($staleBookingIds->isEmpty()) {
            return;
        }

        DB::table('booking_slots')->whereIn('booking_id', $staleBookingIds)->delete();
        DB::table('bookings')
            ->whereIn('id', $staleBookingIds)
            ->where('status', BookingStatus::PendingPayment->value)
            ->update([
                'status' => BookingStatus::Expired->value,
                'updated_at' => now(),
            ]);
    }

    public function getUpcomingForUser(int $userId): Collection
    {
        return Booking::with(['field.branch', 'slots.timeSlot', 'payments'])
            ->where('user_id', $userId)
            ->where('booking_date', '>=', now()->toDateString())
            ->whereNotIn('status', [BookingStatus::Cancelled, BookingStatus::Expired, BookingStatus::Completed])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get();
    }

    public function getHistoryForUser(int $userId, int $limit = 20): Collection
    {
        return Booking::with(['field.branch', 'slots.timeSlot'])
            ->where('user_id', $userId)
            ->whereIn('status', [BookingStatus::Completed, BookingStatus::Cancelled])
            ->orderByDesc('booking_date')
            ->limit($limit)
            ->get();
    }

    public function expireUnpaidBookings(): int
    {
        return DB::transaction(function () {
            $bookingIds = Booking::where('status', BookingStatus::PendingPayment)
                ->where('expires_at', '<', now())
                ->pluck('id');

            if ($bookingIds->isEmpty()) {
                return 0;
            }

            DB::table('booking_slots')->whereIn('booking_id', $bookingIds)->delete();

            return Booking::whereIn('id', $bookingIds)
                ->update(['status' => BookingStatus::Expired]);
        });
    }

    public function getDailyBookings(?int $branchId, string $date, ?int $fieldId = null): Collection
    {
        return Booking::with(['field', 'user', 'slots.timeSlot', 'payments'])
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when($fieldId, fn ($query) => $query->where('field_id', $fieldId))
            ->where('booking_date', $date)
            ->whereNotIn('status', [BookingStatus::Cancelled, BookingStatus::Expired])
            ->orderBy('start_time')
            ->get();
    }
}
