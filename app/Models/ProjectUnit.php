<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'project',
        'unit_type',
        'unit_no',
        'status',
        'price',
        'size',
        'description',
        'specifications',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'size' => 'decimal:2',
        'specifications' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_RESERVED = 'reserved';
    const STATUS_SOLD = 'sold';
    const STATUS_BLOCKED = 'blocked';

    public static function getStatuses()
    {
        return [
            self::STATUS_AVAILABLE,
            self::STATUS_RESERVED,
            self::STATUS_SOLD,
            self::STATUS_BLOCKED,
        ];
    }

    /**
     * Get all leads associated with this unit
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'unit', 'unit_no')
            ->where('project', $this->project)
            ->where('type', $this->unit_type);
    }

    /**
     * Get all unique projects
     */
    public static function getProjects()
    {
        return self::distinct()->pluck('project')->sort()->values();
    }

    /**
     * Get unit types for a specific project
     */
    public static function getUnitTypes($project = null)
    {
        $query = self::distinct();

        if ($project) {
            $query->where('project', $project);
        }

        return $query->pluck('unit_type')->sort()->values();
    }

    /**
     * Get units for a specific project and type
     */
    public static function getUnits($project = null, $unitType = null)
    {
        $query = self::query();

        if ($project) {
            $query->where('project', $project);
        }

        if ($unitType) {
            $query->where('unit_type', $unitType);
        }

        return $query->orderBy('unit_no')->get();
    }

    /**
     * Check if unit is available
     */
    public function isAvailable()
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    /**
     * Check if unit is sold
     */
    public function isSold()
    {
        return $this->status === self::STATUS_SOLD;
    }

    /**
     * Check if unit is reserved
     */
    public function isReserved()
    {
        return $this->status === self::STATUS_RESERVED;
    }

    /**
     * Get full unit identifier
     */
    public function getFullUnitAttribute()
    {
        return "{$this->project} - {$this->unit_type} - {$this->unit_no}";
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        if ($this->price) {
            return 'Rp ' . number_format($this->price, 0, ',', '.');
        }
        return 'Price not set';
    }

    /**
     * Scope to filter by availability
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE);
    }

    /**
     * Scope to filter by project
     */
    public function scopeByProject($query, $project)
    {
        return $query->where('project', $project);
    }

    /**
     * Scope to filter by unit type
     */
    public function scopeByUnitType($query, $unitType)
    {
        return $query->where('unit_type', $unitType);
    }
}
