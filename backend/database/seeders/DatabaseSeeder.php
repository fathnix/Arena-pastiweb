<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Field;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $pusat = Branch::updateOrCreate(
            ['code' => 'ARP'],
            [
                'name' => 'Arena Pasti Pusat',
                'address' => 'Jl. Olahraga No. 123, Jakarta',
                'phone' => '021-12345678',
                'timezone' => 'Asia/Jakarta',
                'is_active' => true,
            ]
        );

        $selatan = Branch::updateOrCreate(
            ['code' => 'ARS'],
            [
                'name' => 'Arena Pasti Cabang Selatan',
                'address' => 'Jl. Raya Selatan No. 45, Jakarta',
                'phone' => '021-87654321',
                'timezone' => 'Asia/Jakarta',
                'is_active' => true,
            ]
        );

        $users = [
            [
                'email' => 'superadmin@arenapasti.test',
                'name' => 'Superadmin',
                'phone' => '081234567890',
                'role' => 'superadmin',
                'branch_id' => null,
            ],
            [
                'email' => 'admin@arenapasti.test',
                'name' => 'Admin Pusat',
                'phone' => '081234567891',
                'role' => 'admin',
                'branch_id' => $pusat->id,
            ],
            [
                'email' => 'kasir@arenapasti.test',
                'name' => 'Kasir Pusat',
                'phone' => '081234567893',
                'role' => 'admin',
                'branch_id' => $pusat->id,
            ],
            [
                'email' => 'admin.selatan@arenapasti.test',
                'name' => 'Admin Cabang Selatan',
                'phone' => '081234567894',
                'role' => 'admin',
                'branch_id' => $selatan->id,
            ],
            [
                'email' => 'customer@arenapasti.test',
                'name' => 'Customer Demo',
                'phone' => '081234567892',
                'role' => 'customer',
                'branch_id' => null,
            ],
            [
                'email' => 'customer2@arenapasti.test',
                'name' => 'Customer Demo 2',
                'phone' => '081234567895',
                'role' => 'customer',
                'branch_id' => null,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    ...$user,
                    'password' => $password,
                    'is_active' => true,
                ]
            );
        }

        for ($hour = 8; $hour < 23; $hour++) {
            $start = sprintf('%02d:00', $hour);
            $end = sprintf('%02d:00', $hour + 1);

            TimeSlot::updateOrCreate(
                ['start_time' => $start, 'end_time' => $end],
                [
                    'label' => $start.' - '.$end,
                    'sort_order' => $hour - 8,
                    'is_active' => true,
                ]
            );
        }

        $fields = [
            [
                'branch_id' => $pusat->id,
                'name' => 'Lapangan A',
                'slug' => 'lapangan-a',
                'type' => 'Vinyl',
                'capacity' => 14,
                'base_hourly_rate' => 150000,
                'description' => 'Lapangan vinyl ukuran standar dengan pencahayaan LED',
            ],
            [
                'branch_id' => $pusat->id,
                'name' => 'Lapangan B',
                'slug' => 'lapangan-b',
                'type' => 'Interlock',
                'capacity' => 14,
                'base_hourly_rate' => 180000,
                'description' => 'Lapangan interlock premium dengan rumput sintetis',
            ],
            [
                'branch_id' => $pusat->id,
                'name' => 'Lapangan C',
                'slug' => 'lapangan-c',
                'type' => 'Matras',
                'capacity' => 10,
                'base_hourly_rate' => 120000,
                'description' => 'Lapangan matras untuk futsal indoor',
            ],
            [
                'branch_id' => $selatan->id,
                'name' => 'Lapangan Selatan 1',
                'slug' => 'lapangan-selatan-1',
                'type' => 'Sintetis',
                'capacity' => 12,
                'base_hourly_rate' => 130000,
                'description' => 'Lapangan sintetis cabang selatan',
            ],
        ];

        foreach ($fields as $fieldData) {
            Field::updateOrCreate(
                ['slug' => $fieldData['slug']],
                [
                    ...$fieldData,
                    'open_time' => '08:00',
                    'close_time' => '23:00',
                    'slot_duration' => 60,
                    'status' => 'active',
                ]
            );
        }
    }
}
