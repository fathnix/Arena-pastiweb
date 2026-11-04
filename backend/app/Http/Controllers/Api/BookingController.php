<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Branch;
use App\Models\Field;
use App\Repositories\BookingRepository;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private BookingRepository $bookingRepository
    ) {}

    public function store(Request $request)
    {
        $data = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'time_slot_ids' => 'required|array|min:1',
            'time_slot_ids.*' => 'exists:time_slots,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $field = Field::findOrFail($data['field_id']);

        $data['branch_id'] = $field->branch_id;
        $data['user_id'] = $request->user()?->id;
        $data['source'] = $request->user() ? 'online' : 'walk_in';
        $data['created_by'] = $request->user()?->id;

        try {
            $result = $this->bookingService->createBooking($data);

            return response()->json([
                'message' => 'Booking berhasil dibuat',
                'booking' => new BookingResource($result['booking']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isCustomer()) {
            $bookings = $this->bookingRepository->getUpcomingForUser($user->id);
        } else {
            $branchId = $user->branch_id ?? Branch::first()->id;
            $date = $request->get('date', now()->toDateString());
            $bookings = $this->bookingRepository->getDailyBookings($branchId, $date);
        }

        return BookingResource::collection($bookings);
    }

    public function show(string $code)
    {
        $booking = $this->bookingRepository->findByCode($code);

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        return new BookingResource($booking);
    }

    public function checkIn(Request $request, string $code)
    {
        try {
            $result = $this->bookingService->checkIn($code, $request->user()->id);

            return response()->json([
                'message' => 'Check-in berhasil',
                'booking' => new BookingResource($result['booking']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Request $request, string $code)
    {
        try {
            $userId = $request->user()->isCustomer() ? $request->user()->id : null;
            $result = $this->bookingService->cancel($code, $userId);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function complete(int $id)
    {
        if (! $this->bookingService->complete($id)) {
            return response()->json(['message' => 'Booking tidak bisa diselesaikan (harus check-in dahulu).'], 422);
        }

        return response()->json(['message' => 'Booking diselesaikan.']);
    }

    public function history(Request $request)
    {
        $bookings = $this->bookingRepository->getHistoryForUser($request->user()->id);

        return BookingResource::collection($bookings);
    }
}
