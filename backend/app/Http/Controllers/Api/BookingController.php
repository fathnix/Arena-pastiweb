<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Field;
use App\Repositories\BookingRepository;
use App\Services\BookingService;
use App\Services\PricingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private BookingRepository $bookingRepository,
        private PricingService $pricingService
    ) {}

    public function quote(Request $request)
    {
        $data = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'time_slot_ids' => 'required|array|min:1',
            'time_slot_ids.*' => 'distinct|exists:time_slots,id',
        ]);

        $pricing = $this->pricingService->calculatePrice(
            $data['field_id'],
            $data['booking_date'],
            $data['time_slot_ids']
        );

        return response()->json($pricing);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'time_slot_ids' => 'required|array|min:1',
            'time_slot_ids.*' => 'distinct|exists:time_slots,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $field = Field::findOrFail($data['field_id']);
        $user = $request->user();

        if ($field->status !== 'active') {
            return response()->json(['message' => 'Lapangan sedang tidak aktif.'], 422);
        }

        if ($user->isAdmin() && (int) $user->branch_id !== (int) $field->branch_id) {
            return response()->json(['message' => 'Anda hanya dapat membuat booking untuk cabang Anda.'], 403);
        }

        $data['branch_id'] = $field->branch_id;

        if ($user->isCustomer()) {
            $data['user_id'] = $user->id;
            $data['source'] = 'online';
            $data['created_by'] = $user->id;
            $data['customer_name'] = $user->name;
            $data['customer_phone'] = $data['customer_phone'] ?? $user->phone;
        } else {
            if (empty($data['customer_name'])) {
                return response()->json(['message' => 'Nama customer wajib untuk walk-in booking.'], 422);
            }

            $data['user_id'] = null;
            $data['source'] = 'walk_in';
            $data['created_by'] = $user->id;
        }

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
            $branchId = $user->isSuperadmin()
                ? ($request->filled('branch_id') ? (int) $request->get('branch_id') : null)
                : $user->branch_id;

            $date = $request->get('date', now()->toDateString());
            $fieldId = $request->filled('field_id') ? (int) $request->get('field_id') : null;

            $bookings = $this->bookingRepository->getDailyBookings($branchId, $date, $fieldId);
        }

        return BookingResource::collection($bookings);
    }

    public function show(Request $request, string $code)
    {
        $booking = $this->bookingRepository->findByCode($code);

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        if (! $this->canViewBooking($request, $booking)) {
            return response()->json(['message' => 'Anda tidak berhak melihat booking ini.'], 403);
        }

        return new BookingResource($booking);
    }

    public function checkIn(Request $request, string $code)
    {
        $booking = $this->bookingRepository->findByCode($code);

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        if (! $this->canManageBooking($request, $booking)) {
            return response()->json(['message' => 'Anda tidak berhak check-in booking ini.'], 403);
        }

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
        $booking = $this->bookingRepository->findByCode($code);

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        $userId = $request->user()->isCustomer() ? $request->user()->id : null;

        if ($userId === null && ! $this->canManageBooking($request, $booking)) {
            return response()->json(['message' => 'Anda tidak berhak membatalkan booking ini.'], 403);
        }

        try {
            $result = $this->bookingService->cancel($code, $userId);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function complete(Request $request, int $id)
    {
        $booking = Booking::findOrFail($id);

        if (! $this->canManageBooking($request, $booking)) {
            return response()->json(['message' => 'Anda tidak berhak menyelesaikan booking ini.'], 403);
        }

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

    private function canViewBooking(Request $request, Booking $booking): bool
    {
        $user = $request->user();

        if ($user->isSuperadmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return (int) $user->branch_id === (int) $booking->branch_id;
        }

        return (int) $booking->user_id === (int) $user->id;
    }

    private function canManageBooking(Request $request, Booking $booking): bool
    {
        $user = $request->user();

        if ($user->isSuperadmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return (int) $user->branch_id === (int) $booking->branch_id;
        }

        return false;
    }
}
