<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Field;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Field>
 */
class FieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['Vinyl', 'Interlock', 'Matras', 'Sintetis'];

        return [
            'branch_id' => Branch::factory(),
            'name' => 'Lapangan '.fake()->randomLetter(),
            'slug' => fake()->unique()->slug(2),
            'type' => fake()->randomElement($types),
            'capacity' => fake()->numberBetween(10, 22),
            'base_hourly_rate' => fake()->randomElement([100000, 120000, 150000, 180000, 200000]),
            'description' => fake()->sentence(),
            'open_time' => '08:00',
            'close_time' => '23:00',
            'slot_duration' => 60,
            'status' => 'active',
        ];
    }
}
