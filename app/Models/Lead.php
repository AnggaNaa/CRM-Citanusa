<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'priority',
        'status',
        'notes',
        'project',
        'unit_type',
        'unit_no',
        'estimated_value',
        'expected_closing_date',
        'source',
        'contact_name',
        'contact_email',
        'contact_phone',
        'contact_address',
        'contact_company',
        'contact_position',
        'assigned_to', // Must be HA user
        'created_by',
        'manager_id',
        'spv_id',
        'priority_changed_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'priority_changed_at' => 'datetime',
        'expected_closing_date' => 'date',
        'estimated_value' => 'decimal:2',
    ];

    // Priority constants
    const PRIORITY_COLD = 'Cold';
    const PRIORITY_WARM = 'Warm';
    const PRIORITY_HOT = 'Hot';
    const PRIORITY_BOOKING = 'Booking';
    const PRIORITY_CLOSING = 'Closing';
    const PRIORITY_LOST = 'Lost';

    public static function getPriorities()
    {
        return [
            self::PRIORITY_COLD,
            self::PRIORITY_WARM,
            self::PRIORITY_HOT,
            self::PRIORITY_BOOKING,
            self::PRIORITY_CLOSING,
            self::PRIORITY_LOST,
        ];
    }

    /**
     * Get the user that the lead is assigned to (HA).
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Alias for assignedTo relationship (for consistency)
     */
    public function assigned_user(): BelongsTo
    {
        return $this->assignedTo();
    }

    /**
     * Get the HA user assigned to this lead
     */
    public function ha(): BelongsTo
    {
        return $this->assignedTo();
    }

    /**
     * Get the user that created the lead.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Alias for createdBy relationship (for consistency)
     */
    public function creator(): BelongsTo
    {
        return $this->createdBy();
    }

    /**
     * Get the manager assigned to this lead.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the supervisor assigned to this lead.
     */
    public function spv(): BelongsTo
    {
        return $this->belongsTo(User::class, 'spv_id');
    }

    /**
     * Get the lead histories.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(LeadHistory::class)->latest();
    }

    /**
     * Get the lead attachments.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(LeadAttachment::class);
    }

    /**
     * Check if priority requires attachment
     */
    public function requiresAttachment()
    {
        return in_array($this->priority, [self::PRIORITY_BOOKING, self::PRIORITY_CLOSING]);
    }

    /**
     * Boot method to add model events
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($lead) {
            if ($lead->isDirty('priority')) {
                $oldPriority = $lead->getOriginal('priority');
                $newPriority = $lead->priority;

                // Update priority_changed_at timestamp
                $lead->priority_changed_at = now();

                // Create history log
                LeadHistory::create([
                    'lead_id' => $lead->id,
                    'old_priority' => $oldPriority,
                    'new_priority' => $newPriority,
                    'description' => "Priority changed from {$oldPriority} to {$newPriority}",
                    'created_by' => auth()->id(),
                ]);
            }
        });
    }

    /**
     * Scope to filter leads by user access level
     */
    public function scopeForUser($query, $user)
    {
        if ($user->hasRole('superadmin')) {
            return $query;
        }

        if ($user->hasRole('manager')) {
            // Manager can see leads assigned to their subordinates and their own leads
            return $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('manager_id', $user->id)
                  ->orWhereHas('assignedTo', function ($haQuery) use ($user) {
                      $haQuery->where('manager_id', $user->id);
                  });
            });
        }

        if ($user->hasRole('spv')) {
            // SPV can see leads assigned to their subordinates and their own leads
            return $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('spv_id', $user->id)
                  ->orWhereHas('assignedTo', function ($haQuery) use ($user) {
                      $haQuery->where('spv_id', $user->id);
                  });
            });
        }

        if ($user->hasRole('ha')) {
            // HA can only see leads assigned to them or created by them
            return $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('created_by', $user->id);
            });
        }

        return $query->whereRaw('1 = 0'); // No access for other roles
    }
}
