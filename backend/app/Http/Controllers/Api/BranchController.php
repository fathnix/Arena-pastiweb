<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::withCount(['fields', 'users'])
            ->orderBy('name')
            ->get();

        return response()->json($branches->map(fn (Branch $branch) => [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'address' => $branch->address,
            'phone' => $branch->phone,
            'timezone' => $branch->timezone,
            'is_active' => $branch->is_active,
            'fields_count' => $branch->fields_count,
            'users_count' => $branch->users_count,
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:branches,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $branch = Branch::create($data);

        return response()->json(['message' => 'Cabang dibuat.', 'data' => $branch], 201);
    }

    public function update(Request $request, int $id)
    {
        $branch = Branch::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:10', Rule::unique('branches', 'code')->ignore($branch->id)],
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $branch->update($data);

        return response()->json(['message' => 'Cabang diperbarui.', 'data' => $branch]);
    }

    public function destroy(int $id)
    {
        $branch = Branch::withCount(['fields', 'users'])->findOrFail($id);

        if ($branch->fields_count > 0) {
            return response()->json(['message' => 'Cabang masih memiliki lapangan. Hapus lapangan terlebih dahulu.'], 422);
        }

        if ($branch->users_count > 0) {
            return response()->json(['message' => 'Cabang masih memiliki pengguna. Pindahkan pengguna terlebih dahulu.'], 422);
        }

        $branch->delete();

        return response()->json(['message' => 'Cabang dihapus.']);
    }
}
