<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'branch_id',
        'field_id',
        'booking_date',
        'start_time',
        'end_time',
        'subtotal',
        'discount',
        'total',
        'status',
        'payment_status',
        'source',
        'customer_name',
        'customer_phone',
        'expires_at',
        'checked_in_at',
        'completed_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'subtotal' => 'integer',
            'discount' => 'integer',
            'total' => 'integer',
            'expires_at' => 'datetime',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(Field::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(BookingSlot::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
