<?php

namespace App\Core\Exceptions;

use App\Core\Http\Responses\ApiResponse;
use App\Core\Support\Enums\ApiCode;
use Exception;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    public function __construct(
        string $message,
        public readonly ApiCode $code = ApiCode::SERVER_ERROR,
        public readonly int $statusCode = 500,
        public readonly array $errors = []
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return ApiResponse::error(
            $this->message,
            $this->code,
            $this->statusCode,
            $this->errors
        );
    }
}
