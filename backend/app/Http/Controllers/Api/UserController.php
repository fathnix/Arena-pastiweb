<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('branch')->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->get('role'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->get('branch_id'));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return response()->json($query->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'role_label' => $user->role->label(),
            'branch_id' => $user->branch_id,
            'branch' => $user->branch?->only(['id', 'name']),
            'is_active' => $user->is_active,
            'created_at' => $user->created_at?->toIso8601String(),
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(6)],
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::enum(UserRole::class)],
            'branch_id' => 'nullable|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        if ($data['role'] === UserRole::Admin->value && empty($data['branch_id'])) {
            return response()->json(['message' => 'Admin / kasir wajib memiliki cabang.'], 422);
        }

        $data['is_active'] = $data['is_active'] ?? true;

        $user = User::create($data);

        return response()->json([
            'message' => 'Pengguna dibuat.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::min(6)],
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::enum(UserRole::class)],
            'branch_id' => 'nullable|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        if ($data['role'] === UserRole::Admin->value && empty($data['branch_id'])) {
            return response()->json(['message' => 'Admin / kasir wajib memiliki cabang.'], 422);
        }

        if ($request->user()->id === $user->id && $data['role'] !== UserRole::Superadmin->value) {
            return response()->json(['message' => 'Tidak bisa mengubah role akun sendiri.'], 422);
        }

        if ($request->user()->id === $user->id && ($data['is_active'] ?? true) === false) {
            return response()->json(['message' => 'Tidak bisa menonaktifkan akun sendiri.'], 422);
        }

        $user->update($data);

        if (isset($data['password'])) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Pengguna diperbarui.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        if ($request->user()->id === $id) {
            return response()->json(['message' => 'Tidak bisa menonaktifkan akun sendiri.'], 422);
        }

        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Pengguna dinonaktifkan.']);
    }
}
