<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\DTOs\RegisterData;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(RegisterData $data): User
    {
        return User::create([
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
            'password' => Hash::make($data->password),
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function attemptLogin(string $email, string $password): ?User
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        if (! $user->is_active) {
            return null;
        }

        return $user;
    }
}
