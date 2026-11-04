<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FieldResource;
use App\Http\Resources\TimeSlotResource;
use App\Models\Branch;
use App\Models\Field;
use App\Models\TimeSlot;
use App\Repositories\FieldRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FieldController extends Controller
{
    public function __construct(
        private FieldRepository $fieldRepository
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->isAdmin() && $user->branch_id) {
            $branchId = $user->branch_id;
        } else {
            $branchId = $request->get('branch_id') ?? Branch::query()->value('id');
        }

        $query = Field::with('branch')->orderBy('name');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($request->get('include_inactive') !== '1') {
            $query->where('status', 'active');
        }

        return FieldResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'base_hourly_rate' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'open_time' => 'nullable|date_format:H:i',
            'close_time' => 'nullable|date_format:H:i',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $branchId = $user->isAdmin() && $user->branch_id
            ? $user->branch_id
            : ($data['branch_id'] ?? Branch::query()->value('id'));

        if (! $branchId) {
            return response()->json(['message' => 'Cabang tidak ditemukan.'], 422);
        }

        $data['branch_id'] = $branchId;
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['open_time'] = $data['open_time'] ?? '08:00';
        $data['close_time'] = $data['close_time'] ?? '23:00';
        $data['status'] = $data['status'] ?? 'active';
        $data['slot_duration'] = 60;

        $field = Field::create($data);

        return response()->json([
            'message' => 'Lapangan dibuat.',
            'data' => new FieldResource($field->load('branch')),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $field = Field::findOrFail($id);
        $user = $request->user();

        if ($user->isAdmin() && $user->branch_id && $field->branch_id !== $user->branch_id) {
            return response()->json(['message' => 'Tidak berhak mengubah lapangan cabang lain.'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'base_hourly_rate' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'open_time' => 'nullable|date_format:H:i',
            'close_time' => 'nullable|date_format:H:i',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        if ($field->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $field->id);
        }

        $field->update($data);

        return response()->json([
            'message' => 'Lapangan diperbarui.',
            'data' => new FieldResource($field->fresh()->load('branch')),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $field = Field::withCount('bookings')->findOrFail($id);

        if ($request->user()->isAdmin() && $request->user()->branch_id && $field->branch_id !== $request->user()->branch_id) {
            return response()->json(['message' => 'Tidak berhak menghapus lapangan cabang lain.'], 403);
        }

        if ($field->bookings_count > 0) {
            $field->update(['status' => 'inactive']);

            return response()->json(['message' => 'Lapangan dinonaktifkan karena memiliki riwayat booking.']);
        }

        $field->delete();

        return response()->json(['message' => 'Lapangan dihapus.']);
    }

    public function show(int $id)
    {
        $field = Field::with('branch')->findOrFail($id);

        return new FieldResource($field);
    }

    public function availability(Request $request, int $id)
    {
        $field = Field::findOrFail($id);
        $date = $request->get('date', now()->toDateString());

        $bookedSlots = \DB::table('booking_slots')
            ->join('bookings', 'booking_slots.booking_id', '=', 'bookings.id')
            ->where('booking_slots.field_id', $id)
            ->where('booking_slots.booking_date', $date)
            ->whereNotIn('bookings.status', ['cancelled', 'expired'])
            ->where(function ($query) {
                $query->where('bookings.status', '!=', 'pending_payment')
                    ->orWhere('bookings.expires_at', '>', now());
            })
            ->pluck('booking_slots.time_slot_id')
            ->toArray();

        $allSlots = TimeSlot::where('is_active', true)
            ->where('start_time', '>=', $field->open_time)
            ->where('end_time', '<=', $field->close_time)
            ->orderBy('sort_order')
            ->get();

        $pastSlotIds = [];

        if ($date === now()->toDateString()) {
            $pastSlotIds = $allSlots
                ->filter(fn (TimeSlot $slot) => $slot->start_time <= now()->format('H:i:s'))
                ->pluck('id')
                ->toArray();
        }

        return response()->json([
            'date' => $date,
            'field_id' => $id,
            'slots' => TimeSlotResource::collection($allSlots),
            'booked_slot_ids' => $bookedSlots,
            'past_slot_ids' => $pastSlotIds,
            'available_slot_ids' => $allSlots
                ->whereNotIn('id', array_merge($bookedSlots, $pastSlotIds))
                ->pluck('id')
                ->values(),
        ]);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (Field::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }
}
