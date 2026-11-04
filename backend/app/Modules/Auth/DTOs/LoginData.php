<?php

namespace App\Modules\Auth\DTOs;

use App\Core\Support\DTO\DataTransferObject;

final readonly class LoginData extends DataTransferObject
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}
}
