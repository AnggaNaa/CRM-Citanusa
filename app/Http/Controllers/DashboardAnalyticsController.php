<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardAnalyticsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('roles');
        $analytics = $this->getAnalytics($user);

        return Inertia::render('Dashboard/Analytics', [
            'analytics' => $analytics,
            'user' => $user
        ]);
    }

    private function getAnalytics($user)
    {
        $analytics = [];

        // Get leads based on user role
        $leadsQuery = Lead::forUser($user);

        // Basic statistics
        $analytics['total_leads'] = $leadsQuery->count();
        $analytics['leads_this_month'] = $leadsQuery->whereMonth('created_at', now()->month)->count();

        // Priority breakdown
        $analytics['priority_breakdown'] = $leadsQuery
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        // Team performance (if user is manager or spv)
        if ($user->hasRole(['manager', 'spv', 'superadmin'])) {
            $analytics['team_performance'] = $this->getTeamPerformance($user);
        }

        // Lead progression over time (last 6 months)
        $analytics['lead_progression'] = $this->getLeadProgression($user);

        // Conversion rates
        $analytics['conversion_rates'] = $this->getConversionRates($user);

        // Top performers (for managers and above)
        if ($user->hasRole(['manager', 'superadmin'])) {
            $analytics['top_performers'] = $this->getTopPerformers($user);
        }

        // Recent activities
        $analytics['recent_activities'] = $this->getRecentActivities($user);

        // Personal statistics (for HA users)
        if ($user->hasRole('ha')) {
            $analytics['personal_stats'] = $this->getPersonalStats($user);
        }

        return $analytics;
    }

    private function getTeamPerformance($user)
    {
        $teamMembers = collect();

        if ($user->hasRole('superadmin')) {
            $teamMembers = User::role('ha')->get();
        } elseif ($user->hasRole('manager')) {
            $teamMembers = User::role('ha')->where('manager_id', $user->id)->get();
        } elseif ($user->hasRole('spv')) {
            $teamMembers = User::role('ha')->where('spv_id', $user->id)->get();
        }

        return $teamMembers->map(function ($member) {
            $leads = Lead::where('assigned_to', $member->id);

            return [
                'name' => $member->name,
                'total_leads' => $leads->count(),
                'cold_leads' => $leads->where('priority', 'Cold')->count(),
                'warm_leads' => $leads->where('priority', 'Warm')->count(),
                'hot_leads' => $leads->where('priority', 'Hot')->count(),
                'booking_leads' => $leads->where('priority', 'Booking')->count(),
                'closing_leads' => $leads->where('priority', 'Closing')->count(),
                'lost_leads' => $leads->where('priority', 'Lost')->count(),
                'conversion_rate' => $this->calculateConversionRate($member->id),
            ];
        });
    }

    private function getLeadProgression($user)
    {
        $months = collect();

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLeads = Lead::forUser($user)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $months->push([
                'month' => $date->format('M Y'),
                'leads' => $monthLeads
            ]);
        }

        return $months;
    }

    private function getConversionRates($user)
    {
        $totalLeads = Lead::forUser($user)->count();
        $closingLeads = Lead::forUser($user)->where('priority', 'Closing')->count();
        $lostLeads = Lead::forUser($user)->where('priority', 'Lost')->count();

        return [
            'closing_rate' => $totalLeads > 0 ? round(($closingLeads / $totalLeads) * 100, 2) : 0,
            'loss_rate' => $totalLeads > 0 ? round(($lostLeads / $totalLeads) * 100, 2) : 0,
            'active_rate' => $totalLeads > 0 ? round((($totalLeads - $closingLeads - $lostLeads) / $totalLeads) * 100, 2) : 0,
        ];
    }

    private function getTopPerformers($user)
    {
        $performers = User::role('ha')
            ->when(!$user->hasRole('superadmin'), function ($query) use ($user) {
                if ($user->hasRole('manager')) {
                    $query->where('manager_id', $user->id);
                }
            })
            ->withCount(['assignedLeads as total_leads'])
            ->withCount(['assignedLeads as closing_leads' => function ($query) {
                $query->where('priority', 'Closing');
            }])
            ->withCount(['assignedLeads as booking_leads' => function ($query) {
                $query->where('priority', 'Booking');
            }])
            ->having('total_leads', '>', 0)
            ->orderByDesc('closing_leads')
            ->orderByDesc('booking_leads')
            ->limit(5)
            ->get();

        return $performers->map(function ($performer) {
            return [
                'name' => $performer->name,
                'total_leads' => $performer->total_leads,
                'closing_leads' => $performer->closing_leads,
                'booking_leads' => $performer->booking_leads,
                'conversion_rate' => $performer->total_leads > 0
                    ? round(($performer->closing_leads / $performer->total_leads) * 100, 2)
                    : 0,
            ];
        });
    }

    private function getRecentActivities($user)
    {
        return Lead::forUser($user)
            ->with(['assignedTo', 'createdBy', 'histories' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->whereHas('histories')
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($lead) {
                $latestHistory = $lead->histories->first();
                return [
                    'lead_title' => $lead->title,
                    'assigned_to' => $lead->assignedTo->name,
                    'activity' => $latestHistory->description ?? 'Updated',
                    'date' => $lead->updated_at->diffForHumans(),
                ];
            });
    }

    private function getPersonalStats($user)
    {
        $leads = Lead::where('assigned_to', $user->id);

        return [
            'total_assigned' => $leads->count(),
            'this_month' => $leads->whereMonth('created_at', now()->month)->count(),
            'cold' => $leads->where('priority', 'Cold')->count(),
            'warm' => $leads->where('priority', 'Warm')->count(),
            'hot' => $leads->where('priority', 'Hot')->count(),
            'booking' => $leads->where('priority', 'Booking')->count(),
            'closing' => $leads->where('priority', 'Closing')->count(),
            'lost' => $leads->where('priority', 'Lost')->count(),
            'conversion_rate' => $this->calculateConversionRate($user->id),
        ];
    }

    private function calculateConversionRate($userId)
    {
        $totalLeads = Lead::where('assigned_to', $userId)->count();
        $closingLeads = Lead::where('assigned_to', $userId)->where('priority', 'Closing')->count();

        return $totalLeads > 0 ? round(($closingLeads / $totalLeads) * 100, 2) : 0;
    }

    public function exportReport(Request $request)
    {
        $user = auth()->user();
        $format = $request->get('format', 'excel'); // excel or pdf

        // Implementation for export functionality would go here
        // This is a placeholder for the export feature

        return response()->json([
            'message' => 'Export functionality will be implemented',
            'format' => $format
        ]);
    }
}
