<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingSlot extends Model
{
    protected $fillable = [
        'booking_id',
        'field_id',
        'booking_date',
        'time_slot_id',
        'start_time',
        'end_time',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'price' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(Field::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }
}
