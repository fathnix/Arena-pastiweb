<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'booking_date' => $this->booking_date->format('Y-m-d'),
            'start_time' => Carbon::parse($this->start_time)->format('H:i'),
            'end_time' => Carbon::parse($this->end_time)->format('H:i'),
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'total' => $this->total,
            'status' => $this->status->value,
            'payment_status' => $this->payment_status->value,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'field' => new FieldResource($this->whenLoaded('field')),
            'slots' => $this->whenLoaded('slots', function () {
                return $this->slots->map(fn ($slot) => [
                    'time_slot' => new TimeSlotResource($slot->timeSlot),
                    'price' => $slot->price,
                ]);
            }),
            'user' => new UserResource($this->whenLoaded('user')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
