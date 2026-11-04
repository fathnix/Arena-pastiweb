<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class FieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,
            'capacity' => $this->capacity,
            'base_hourly_rate' => $this->base_hourly_rate,
            'description' => $this->description,
            'open_time' => $this->open_time ? Carbon::parse($this->open_time)->format('H:i') : null,
            'close_time' => $this->close_time ? Carbon::parse($this->close_time)->format('H:i') : null,
            'status' => $this->status,
            'branch' => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ],
        ];
    }
}
