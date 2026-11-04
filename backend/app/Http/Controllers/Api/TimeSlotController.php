<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimeSlotResource;
use App\Models\Branch;
use App\Models\TimeSlot;

class TimeSlotController extends Controller
{
    public function index()
    {
        return TimeSlotResource::collection(
            TimeSlot::where('is_active', true)->orderBy('sort_order')->get()
        );
    }

    public function branches()
    {
        return response()->json(
            Branch::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code'])
        );
    }
}
