<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'employee_id',
        'department',
        'position',
        'join_date',
        'leave_date',
        'is_active',
        'profile_picture',
        'last_login_at',
        'last_login_ip',
        'settings',
        'notes',
        'hire_date',
        'status',
        'manager_id',
        'spv_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'hire_date' => 'date',
        'join_date' => 'date',
        'leave_date' => 'date',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['primary_role'];

    /**
     * Get the leads assigned to the user.
     */
    public function assignedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'assigned_to');
    }

    /**
     * Get the leads created by the user.
     */
    public function createdLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'created_by');
    }

    /**
     * Get the manager of this user.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the supervisor of this user.
     */
    public function spv(): BelongsTo
    {
        return $this->belongsTo(User::class, 'spv_id');
    }

    /**
     * Get users who report to this user as manager.
     */
    public function managedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get users who report to this user as supervisor.
     */
    public function supervisedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'spv_id');
    }

    /**
     * Get all subordinates (both managed and supervised users).
     */
    public function getSubordinatesAttribute()
    {
        return $this->managedUsers->merge($this->supervisedUsers);
    }

    /**
     * Get activity logs for this user
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get login histories for this user
     */
    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    /**
     * Check if user is currently active
     */
    public function isActive()
    {
        return $this->is_active && (is_null($this->leave_date) || $this->leave_date->isFuture());
    }

    /**
     * Get user's full role names
     */
    public function getRoleNamesAttribute()
    {
        return $this->roles->pluck('name')->toArray();
    }

    /**
     * Get user's primary role
     */
    public function getPrimaryRoleAttribute()
    {
        $firstRole = $this->roles->first();
        return $firstRole ? $firstRole->name : 'No Role';
    }

    /**
     * Scope active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('leave_date')
                          ->orWhere('leave_date', '>', now());
                    });
    }

    /**
     * Scope inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false)
                    ->orWhere('leave_date', '<=', now());
    }

    /**
     * Get leads count for this user
     */
    public function getLeadsCountAttribute()
    {
        return $this->assignedLeads()->count();
    }
}
