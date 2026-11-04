<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::get('/fields', [FieldController::class, 'index']);
Route::get('/fields/{id}', [FieldController::class, 'show']);
Route::get('/fields/{id}/availability', [FieldController::class, 'availability']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/history', [BookingController::class, 'history']);
    Route::get('/bookings/{code}', [BookingController::class, 'show']);
    Route::post('/bookings/{code}/check-in', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{code}/cancel', [BookingController::class, 'cancel']);

    Route::post('/payments', [PaymentController::class, 'store']);
    Route::post('/payments/{id}/upload-proof', [PaymentController::class, 'uploadProof']);

    Route::middleware('can:admin')->group(function () {
        Route::post('/bookings/{id}/complete', [BookingController::class, 'complete']);

        Route::get('/payments/pending', [PaymentController::class, 'pending']);
        Route::post('/payments/{id}/verify', [PaymentController::class, 'verify']);
        Route::post('/payments/{id}/reject', [PaymentController::class, 'reject']);

        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/revenue', [DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/peak-hours', [DashboardController::class, 'peakHours']);
        Route::get('/dashboard/branches', [DashboardController::class, 'branchPerformance']);
    });
});
