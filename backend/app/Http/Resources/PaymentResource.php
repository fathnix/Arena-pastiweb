<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'method' => $this->method->value,
            'amount' => $this->amount,
            'status' => $this->status->value,
            'proof_path' => $this->proof_path ? url("storage/{$this->proof_path}") : null,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
