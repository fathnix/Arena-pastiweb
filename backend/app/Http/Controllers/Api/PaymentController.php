<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Branch;
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

        $method = PaymentMethod::from($data['method']);

        $result = $this->paymentService->createPayment(
            $data['booking_id'],
            $method,
            $data['amount']
        );

        return response()->json([
            'message' => 'Payment created',
            'payment' => new PaymentResource($result['payment']),
        ], 201);
    }

    public function uploadProof(Request $request, int $id)
    {
        $request->validate([
            'proof' => 'required|image|max:5120',
        ]);

        $result = $this->paymentService->uploadProof($id, $request->file('proof'));

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diupload',
            'path' => $result['path'],
        ]);
    }

    public function pending(Request $request)
    {
        $branchId = $request->user()->branch_id ?? Branch::first()->id;
        $payments = $this->paymentRepository->getPendingVerifications($branchId);

        return PaymentResource::collection($payments);
    }

    public function verify(Request $request, int $id)
    {
        $result = $this->paymentService->verify($id, $request->user()->id);

        return response()->json($result);
    }

    public function reject(Request $request, int $id)
    {
        $data = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $result = $this->paymentService->reject($id, $request->user()->id, $data['reason']);

        return response()->json($result);
    }
}
