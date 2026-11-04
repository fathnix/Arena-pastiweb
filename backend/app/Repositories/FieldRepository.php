<?php

namespace App\Repositories;

use App\Models\Field;
use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Collection;

class FieldRepository
{
    public function getActiveByBranch(int $branchId): Collection
    {
        return Field::where('branch_id', $branchId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }

    public function findWithAvailability(int $id, string $date): ?Field
    {
        $field = Field::with('branch')->find($id);

        if (! $field) {
            return null;
        }

        $field->loadAvailability($date);

        return $field;
    }

    public function getAvailableSlots(int $fieldId, string $date): array
    {
        $field = Field::find($fieldId);

        if (! $field) {
            return [];
        }

        $bookedSlots = \DB::table('booking_slots')
            ->join('bookings', 'booking_slots.booking_id', '=', 'bookings.id')
            ->where('booking_slots.field_id', $fieldId)
            ->where('booking_slots.booking_date', $date)
            ->whereNotIn('bookings.status', ['cancelled', 'expired'])
            ->pluck('booking_slots.time_slot_id')
            ->toArray();

        return TimeSlot::where('is_active', true)
            ->whereNotIn('id', $bookedSlots)
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }
}
