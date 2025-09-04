<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'priority',
        'description',
        'color',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Get statuses by priority
     */
    public static function getByPriority($priority)
    {
        return self::where('priority', $priority)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Get all statuses grouped by priority
     */
    public static function getGroupedByPriority()
    {
        return self::where('is_active', true)
            ->orderBy('priority')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('priority')
            ->toArray();
    }

    /**
     * Get available priorities
     */
    public static function getAvailablePriorities()
    {
        return self::distinct('priority')
            ->where('is_active', true)
            ->pluck('priority')
            ->toArray();
    }

    /**
     * Get status with color
     */
    public function getFormattedAttribute()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'priority' => $this->priority,
            'color' => $this->color,
            'description' => $this->description
        ];
    }
}
