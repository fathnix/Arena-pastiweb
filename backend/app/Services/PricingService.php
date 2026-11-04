<?php

namespace App\Services;

use App\Models\Field;
use App\Models\TimeSlot;
use Carbon\Carbon;

class PricingService
{
    public function calculatePrice(int $fieldId, string $date, array $timeSlotIds): array
    {
        $field = Field::findOrFail($fieldId);
        $slots = TimeSlot::whereIn('id', $timeSlotIds)->get();
        $bookingDate = Carbon::parse($date);

        $slotPrices = [];
        $subtotal = 0;

        foreach ($slots as $slot) {
            $price = $this->getSlotPrice($field, $bookingDate, $slot);
            $slotPrices[$slot->id] = $price;
            $subtotal += $price;
        }

        $discount = 0;

        if (count($timeSlotIds) >= 3) {
            $discount = (int) ($subtotal * 0.05);
        }

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $subtotal - $discount,
            'slot_prices' => $slotPrices,
        ];
    }

    private function getSlotPrice(Field $field, Carbon $date, TimeSlot $slot): int
    {
        $baseRate = $field->base_hourly_rate;

        if ($date->isWeekend()) {
            $baseRate = (int) ($baseRate * 1.2);
        }

        $hour = (int) Carbon::parse($slot->start_time)->format('H');
        if ($hour >= 18 && $hour < 22) {
            $baseRate = (int) ($baseRate * 1.15);
        }

        return $baseRate;
    }
}
