<?php

namespace App\Core\Http\Responses;

use App\Core\Support\Enums\ApiCode;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = '',
        ApiCode $code = ApiCode::OK,
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'code' => $code->value,
            'message' => $message,
            'data' => $data,
            'meta' => null,
            'trace_id' => request()->header('X-Request-ID') ?? uniqid('req_', true),
        ], $status);
    }

    public static function error(
        string $message,
        ApiCode $code = ApiCode::SERVER_ERROR,
        int $status = 500,
        array $errors = []
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'code' => $code->value,
            'message' => $message,
            'errors' => $errors,
            'trace_id' => request()->header('X-Request-ID') ?? uniqid('req_', true),
        ], $status);
    }

    public static function paginated(
        LengthAwarePaginator $paginator,
        string $message = '',
        ApiCode $code = ApiCode::OK
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'code' => $code->value,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'trace_id' => request()->header('X-Request-ID') ?? uniqid('req_', true),
        ]);
    }
}
