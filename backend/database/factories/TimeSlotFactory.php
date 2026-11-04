<?php

namespace Database\Factories;

use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimeSlot>
 */
class TimeSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hour = fake()->numberBetween(8, 22);
        $start = sprintf('%02d:00', $hour);
        $end = sprintf('%02d:00', $hour + 1);

        return [
            'label' => $start.' - '.$end,
            'start_time' => $start,
            'end_time' => $end,
            'sort_order' => $hour - 8,
            'is_active' => true,
        ];
    }
}
