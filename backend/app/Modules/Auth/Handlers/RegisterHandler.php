<?php

namespace App\Modules\Auth\Handlers;

use App\Models\User;
use App\Modules\Auth\DTOs\RegisterData;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Support\Facades\DB;

final readonly class RegisterHandler
{
    public function __construct(private AuthService $authService) {}

    public function handle(RegisterData $data): User
    {
        return DB::transaction(fn () => $this->authService->register($data));
    }
}
