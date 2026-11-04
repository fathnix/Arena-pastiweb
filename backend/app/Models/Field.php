<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Field extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'slug',
        'type',
        'capacity',
        'base_hourly_rate',
        'description',
        'open_time',
        'close_time',
        'slot_duration',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'base_hourly_rate' => 'integer',
            'capacity' => 'integer',
            'slot_duration' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingSlots(): HasMany
    {
        return $this->hasMany(BookingSlot::class);
    }
}
