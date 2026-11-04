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

class FieldController extends Controller
{
    public function __construct(
        private FieldRepository $fieldRepository
    ) {}

    public function index(Request $request)
    {
        $branchId = $request->get('branch_id') ?? Branch::first()->id;
        $fields = $this->fieldRepository->getActiveByBranch($branchId);

        return FieldResource::collection($fields);
    }

    public function show(int $id)
    {
        $field = Field::with('branch')->findOrFail($id);

        return new FieldResource($field);
    }

    public function availability(Request $request, int $id)
    {
        $date = $request->get('date', now()->toDateString());

        $bookedSlots = \DB::table('booking_slots')
            ->join('bookings', 'booking_slots.booking_id', '=', 'bookings.id')
            ->where('booking_slots.field_id', $id)
            ->where('booking_slots.booking_date', $date)
            ->whereNotIn('bookings.status', ['cancelled', 'expired'])
            ->pluck('booking_slots.time_slot_id')
            ->toArray();

        $allSlots = TimeSlot::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'date' => $date,
            'field_id' => $id,
            'slots' => TimeSlotResource::collection($allSlots),
            'booked_slot_ids' => $bookedSlots,
            'available_slot_ids' => $allSlots->whereNotIn('id', $bookedSlots)->pluck('id'),
        ]);
    }
}
