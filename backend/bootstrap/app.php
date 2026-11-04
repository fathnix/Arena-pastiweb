<?php

use App\Core\Exceptions\ApiException;
use App\Core\Http\Middleware\AssignRequestId;
use App\Core\Http\Responses\ApiResponse;
use App\Core\Support\Enums\ApiCode;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->append(AssignRequestId::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (ApiException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $e->render();
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    'Data yang diberikan tidak valid.',
                    ApiCode::VALIDATION_ERROR,
                    422,
                    $e->errors()
                );
            }
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    'Data tidak ditemukan.',
                    ApiCode::NOT_FOUND,
                    404
                );
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $code = match ($e->getStatusCode()) {
                    401 => ApiCode::UNAUTHENTICATED,
                    403 => ApiCode::FORBIDDEN,
                    404 => ApiCode::NOT_FOUND,
                    429 => ApiCode::RATE_LIMITED,
                    default => ApiCode::SERVER_ERROR,
                };

                return ApiResponse::error(
                    $e->getMessage() ?: 'Terjadi kesalahan.',
                    $code,
                    $e->getStatusCode()
                );
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $message = app()->environment('production')
                    ? 'Terjadi kesalahan server.'
                    : $e->getMessage();

                return ApiResponse::error($message, ApiCode::SERVER_ERROR, 500);
            }
        });
    })->create();
