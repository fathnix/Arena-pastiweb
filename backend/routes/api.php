<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FieldController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TimeSlotController;
use App\Http\Controllers\Api\UserController;
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
    Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
});

Route::get('/branches', [TimeSlotController::class, 'branches']);
Route::get('/time-slots', [TimeSlotController::class, 'index']);

Route::get('/fields', [FieldController::class, 'index']);
Route::get('/fields/{id}', [FieldController::class, 'show']);
Route::get('/fields/{id}/availability', [FieldController::class, 'availability']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bookings/quote', [BookingController::class, 'quote']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/history', [BookingController::class, 'history']);
    Route::get('/bookings/{code}', [BookingController::class, 'show']);
    Route::post('/bookings/{code}/check-in', [BookingController::class, 'checkIn'])->middleware('can:admin');
    Route::post('/bookings/{id}/complete', [BookingController::class, 'complete'])->middleware('can:admin');
    Route::post('/bookings/{code}/cancel', [BookingController::class, 'cancel']);

    Route::post('/payments', [PaymentController::class, 'store']);
    Route::post('/payments/{id}/upload-proof', [PaymentController::class, 'uploadProof']);

    Route::middleware('can:admin')->group(function () {
        Route::post('/fields', [FieldController::class, 'store']);
        Route::put('/fields/{id}', [FieldController::class, 'update']);
        Route::delete('/fields/{id}', [FieldController::class, 'destroy']);

        Route::get('/payments/pending', [PaymentController::class, 'pending']);
        Route::post('/payments/{id}/verify', [PaymentController::class, 'verify']);
        Route::post('/payments/{id}/reject', [PaymentController::class, 'reject']);

        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/revenue', [DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/peak-hours', [DashboardController::class, 'peakHours']);
    });

    Route::middleware('can:superadmin')->group(function () {
        Route::get('/dashboard/branches', [DashboardController::class, 'branchPerformance']);

        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    Route::get('/branches/all', [BranchController::class, 'index'])->middleware('can:superadmin');
});
