<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'status' => $this->status,
            'branch' => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ],
        ];
    }
}
