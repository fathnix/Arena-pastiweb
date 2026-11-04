<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Field;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create main branch
        $branch = Branch::create([
            'name' => 'Arena Pasti Pusat',
            'code' => 'ARP',
            'address' => 'Jl. Olahraga No. 123, Jakarta',
            'phone' => '021-12345678',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
        ]);

        // Create users
        $superadmin = User::create([
            'branch_id' => null,
            'name' => 'Superadmin',
            'email' => 'superadmin@arenapasti.test',
            'phone' => '081234567890',
            'role' => 'superadmin',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $admin = User::create([
            'branch_id' => $branch->id,
            'name' => 'Admin Pusat',
            'email' => 'admin@arenapasti.test',
            'phone' => '081234567891',
            'role' => 'admin',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $customer = User::create([
            'branch_id' => null,
            'name' => 'Customer Demo',
            'email' => 'customer@arenapasti.test',
            'phone' => '081234567892',
            'role' => 'customer',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        // Create time slots (08:00 - 23:00)
        for ($hour = 8; $hour < 23; $hour++) {
            $start = sprintf('%02d:00', $hour);
            $end = sprintf('%02d:00', $hour + 1);

            TimeSlot::create([
                'label' => $start.' - '.$end,
                'start_time' => $start,
                'end_time' => $end,
                'sort_order' => $hour - 8,
                'is_active' => true,
            ]);
        }

        // Create fields
        $fields = [
            [
                'name' => 'Lapangan A',
                'slug' => 'lapangan-a',
                'type' => 'Vinyl',
                'capacity' => 14,
                'base_hourly_rate' => 150000,
                'description' => 'Lapangan vinyl ukuran standar dengan pencahayaan LED',
            ],
            [
                'name' => 'Lapangan B',
                'slug' => 'lapangan-b',
                'type' => 'Interlock',
                'capacity' => 14,
                'base_hourly_rate' => 180000,
                'description' => 'Lapangan interlock premium dengan rumput sintetis',
            ],
            [
                'name' => 'Lapangan C',
                'slug' => 'lapangan-c',
                'type' => 'Matras',
                'capacity' => 10,
                'base_hourly_rate' => 120000,
                'description' => 'Lapangan matras untuk futsal indoor',
            ],
        ];

        foreach ($fields as $fieldData) {
            Field::create(array_merge($fieldData, [
                'branch_id' => $branch->id,
                'open_time' => '08:00',
                'close_time' => '23:00',
                'slot_duration' => 60,
                'status' => 'active',
            ]));
        }
    }
}
