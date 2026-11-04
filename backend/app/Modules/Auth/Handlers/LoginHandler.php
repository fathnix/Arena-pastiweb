<?php

namespace App\Modules\Auth\Handlers;

use App\Core\Exceptions\ApiException;
use App\Core\Support\Enums\ApiCode;
use App\Models\User;
use App\Modules\Auth\DTOs\LoginData;
use App\Modules\Auth\Services\AuthService;

final readonly class LoginHandler
{
    public function __construct(private AuthService $authService) {}

    public function handle(LoginData $data): User
    {
        $user = $this->authService->attemptLogin($data->email, $data->password);

        if (! $user) {
            throw new ApiException(
                'Email atau password salah.',
                ApiCode::UNAUTHENTICATED,
                401
            );
        }

        return $user;
    }
}
