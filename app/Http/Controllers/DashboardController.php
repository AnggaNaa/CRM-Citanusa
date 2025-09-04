<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get basic statistics using the Lead model scopes
        $leadsQuery = Lead::forUser($user);

        $totalLeads = $leadsQuery->count();
        $hotLeads = $leadsQuery->where('priority', Lead::PRIORITY_HOT)->count();
        $bookingLeads = $leadsQuery->where('priority', Lead::PRIORITY_BOOKING)->count();
        $closingLeads = $leadsQuery->where('priority', Lead::PRIORITY_CLOSING)->count();

        // Get recent leads
        $recentLeads = Lead::forUser($user)
            ->with(['assignedTo', 'createdBy'])
            ->latest()
            ->limit(5)
            ->get();

        // Priority distribution
        $priorityStats = [];
        foreach (Lead::getPriorities() as $priority) {
            $priorityStats[$priority] = Lead::forUser($user)->where('priority', $priority)->count();
        }

        // Monthly leads data for chart (current year)
        $monthlyLeadsData = [];
        $currentYear = date('Y');
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = date('Y-m-01', strtotime("$currentYear-$month-01"));
            $monthEnd = date('Y-m-t', strtotime("$currentYear-$month-01"));

            $monthlyCount = Lead::forUser($user)
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();

            $monthlyLeadsData[] = [
                'month' => date('M', strtotime("$currentYear-$month-01")),
                'month_full' => date('F', strtotime("$currentYear-$month-01")),
                'leads' => $monthlyCount
            ];
        }

        // Get HA lead counts (for managers and above)
        $haLeadCounts = [];
        if ($user->hasRole(['superadmin', 'manager', 'spv'])) {
            $haUsers = User::role('ha');

            // Filter HA users based on user's role
            if ($user->hasRole('manager')) {
                $haUsers->where('manager_id', $user->id);
            } elseif ($user->hasRole('spv')) {
                $haUsers->where('spv_id', $user->id);
            }

            $haUsers = $haUsers->get();

            foreach ($haUsers as $ha) {
                $haLeadCounts[] = [
                    'ha_name' => $ha->name,
                    'ha_id' => $ha->id,
                    'total_leads' => Lead::where('assigned_to', $ha->id)->count(),
                    'hot_leads' => Lead::where('assigned_to', $ha->id)->where('priority', 'hot')->count(),
                    'booking_leads' => Lead::where('assigned_to', $ha->id)->where('priority', 'booking')->count(),
                    'closing_leads' => Lead::where('assigned_to', $ha->id)->where('priority', 'closing')->count(),
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalLeads' => $totalLeads,
                'hotLeads' => $hotLeads,
                'bookingLeads' => $bookingLeads,
                'closingLeads' => $closingLeads,
            ],
            'recentLeads' => $recentLeads,
            'priorityStats' => $priorityStats,
            'monthlyLeadsData' => $monthlyLeadsData,
            'haLeadCounts' => $haLeadCounts,
            'user' => $user->load('roles')
        ]);
    }
}
