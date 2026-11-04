<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'method',
        'provider',
        'provider_ref',
        'amount',
        'status',
        'proof_path',
        'paid_at',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'expires_at',
        'raw_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'expires_at' => 'datetime',
            'raw_response' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
