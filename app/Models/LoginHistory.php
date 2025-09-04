<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'device',
        'browser',
        'platform',
        'location',
        'is_successful',
        'failure_reason',
        'login_at',
        'logout_at',
    ];

    protected $casts = [
        'is_successful' => 'boolean',
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
    ];

    /**
     * Get the user that this login history belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope successful logins
     */
    public function scopeSuccessful($query)
    {
        return $query->where('is_successful', true);
    }

    /**
     * Scope failed logins
     */
    public function scopeFailed($query)
    {
        return $query->where('is_successful', false);
    }

    /**
     * Get session duration in minutes
     */
    public function getSessionDurationAttribute()
    {
        if ($this->logout_at && $this->login_at) {
            return $this->login_at->diffInMinutes($this->logout_at);
        }
        return null;
    }

    /**
     * Create login history record
     */
    public static function recordLogin($user, $isSuccessful = true, $failureReason = null)
    {
        $request = request();
        $userAgent = $request->userAgent();

        return static::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'device' => static::parseDevice($userAgent),
            'browser' => static::parseBrowser($userAgent),
            'platform' => static::parsePlatform($userAgent),
            'is_successful' => $isSuccessful,
            'failure_reason' => $failureReason,
            'login_at' => now(),
        ]);
    }

    /**
     * Update logout time
     */
    public function recordLogout()
    {
        $this->update(['logout_at' => now()]);
    }

    /**
     * Parse device from user agent
     */
    private static function parseDevice($userAgent)
    {
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    /**
     * Parse browser from user agent
     */
    private static function parseBrowser($userAgent)
    {
        $browsers = [
            'Chrome' => '/Chrome\/[\d.]+/',
            'Firefox' => '/Firefox\/[\d.]+/',
            'Safari' => '/Safari\/[\d.]+/',
            'Edge' => '/Edge\/[\d.]+/',
            'Opera' => '/Opera\/[\d.]+/',
        ];

        foreach ($browsers as $browser => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $browser;
            }
        }
        return 'Unknown';
    }

    /**
     * Parse platform from user agent
     */
    private static function parsePlatform($userAgent)
    {
        $platforms = [
            'Windows' => '/Windows/',
            'Mac' => '/Macintosh/',
            'Linux' => '/Linux/',
            'Android' => '/Android/',
            'iOS' => '/iPhone|iPad/',
        ];

        foreach ($platforms as $platform => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $platform;
            }
        }
        return 'Unknown';
    }
}
