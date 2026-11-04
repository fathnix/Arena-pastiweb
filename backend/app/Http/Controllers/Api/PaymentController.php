<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use App\PaymentMethod;
use App\Repositories\PaymentRepository;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private PaymentRepository $paymentRepository
    ) {}

    public function store(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'method' => 'required|string',
            'amount' => 'required|integer|min:0',
        ]);

        $booking = Booking::findOrFail($data['booking_id']);
        $user = $request->user();

        if (! $this->canManageBooking($user, $booking)) {
            return response()->json(['message' => 'Anda tidak berhak membayar booking ini.'], 403);
        }

        $method = PaymentMethod::from($data['method']);

        try {
            $result = $this->paymentService->createPayment(
                $data['booking_id'],
                $method,
                $data['amount']
            );

            return response()->json([
                'message' => 'Payment created',
                'payment' => new PaymentResource($result['payment']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function uploadProof(Request $request, int $id)
    {
        $request->validate([
            'proof' => 'required|image|max:5120',
        ]);

        $payment = Payment::with('booking')->findOrFail($id);

        if (! $this->canManageBooking($request->user(), $payment->booking)) {
            return response()->json(['message' => 'Anda tidak berhak mengubah pembayaran ini.'], 403);
        }

        try {
            $result = $this->paymentService->uploadProof($id, $request->file('proof'));

            return response()->json([
                'message' => 'Bukti pembayaran berhasil diupload',
                'path' => $result['path'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        $branchId = $user->isSuperadmin() ? null : $user->branch_id;
        $payments = $this->paymentRepository->getPendingVerifications($branchId);

        return PaymentResource::collection($payments);
    }

    public function verify(Request $request, int $id)
    {
        $payment = Payment::with('booking')->findOrFail($id);

        if (! $this->canVerifyPayment($request->user(), $payment)) {
            return response()->json(['message' => 'Anda tidak berhak memverifikasi pembayaran ini.'], 403);
        }

        try {
            $result = $this->paymentService->verify($id, $request->user()->id);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, int $id)
    {
        $data = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $payment = Payment::with('booking')->findOrFail($id);

        if (! $this->canVerifyPayment($request->user(), $payment)) {
            return response()->json(['message' => 'Anda tidak berhak menolak pembayaran ini.'], 403);
        }

        try {
            $result = $this->paymentService->reject($id, $request->user()->id, $data['reason']);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function canManageBooking($user, Booking $booking): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return (int) $user->branch_id === (int) $booking->branch_id;
        }

        return (int) $booking->user_id === (int) $user->id;
    }

    private function canVerifyPayment($user, Payment $payment): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        return (int) $user->branch_id === (int) $payment->booking->branch_id;
    }
}
