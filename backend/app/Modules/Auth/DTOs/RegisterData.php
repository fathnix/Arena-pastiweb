<?php

namespace App\Modules\Auth\DTOs;

use App\Core\Support\DTO\DataTransferObject;

final readonly class RegisterData extends DataTransferObject
{
    public function __construct(
        public string $name,
        public string $email,
        public string $phone,
        public string $password,
    ) {}
}
