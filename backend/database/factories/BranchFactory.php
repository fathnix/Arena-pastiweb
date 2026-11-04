<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->city().' Arena',
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
        ];
    }
}
