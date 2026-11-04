<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Http\Responses\ApiResponse;
use App\Core\Support\Enums\ApiCode;
use App\Modules\Auth\DTOs\LoginData;
use App\Modules\Auth\DTOs\RegisterData;
use App\Modules\Auth\Handlers\LoginHandler;
use App\Modules\Auth\Handlers\RegisterHandler;
use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Http\Requests\RegisterRequest;
use App\Modules\Auth\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        private readonly RegisterHandler $registerHandler,
        private readonly LoginHandler $loginHandler,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->registerHandler->handle(
            RegisterData::fromArray($request->validated())
        );

        Auth::login($user);

        return ApiResponse::success(
            new UserResource($user),
            'Registrasi berhasil.',
            ApiCode::CREATED,
            201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->loginHandler->handle(
            LoginData::fromArray($request->validated())
        );

        Auth::login($user);

        return ApiResponse::success(
            new UserResource($user),
            'Login berhasil.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new UserResource($request->user()->load('branch'))
        );
    }
}
