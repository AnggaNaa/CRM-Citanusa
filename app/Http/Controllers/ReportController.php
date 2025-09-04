<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('permission:view_reports')->only(['index']);
    }

    /**
     * Display the reports dashboard
     */
    public function index(Request $request)
    {
        // Use broader default date range - last 30 days to ensure we capture data
        $dateFrom = $request->input('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));
        $userId = $request->input('user_id');
        $status = $request->input('status');

        // Debug the actual parameters being used
        Log::info('Report Index Debug', [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'user_id' => $userId,
            'status' => $status,
            'request_params' => $request->all()
        ]);

        // Lead Statistics
        $leadStats = $this->getLeadStatistics($dateFrom, $dateTo, $userId, $status);

        // User Performance
        $userPerformance = $this->getUserPerformance($dateFrom, $dateTo, $userId, $status);

        // Daily Lead Trends
        $dailyTrends = $this->getDailyLeadTrends($dateFrom, $dateTo, $userId, $status);

        // Status Distribution
        $statusDistribution = $this->getStatusDistribution($dateFrom, $dateTo, $userId, $status);

        // Top Performers
        $topPerformers = $this->getTopPerformers($dateFrom, $dateTo, $userId, $status);

        // Recent Activities
        $recentActivities = $this->getRecentActivities();

        // Get users for filter
        $users = User::select('id', 'name', 'email')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get available statuses
        $statuses = Lead::select('status')
            ->distinct()
            ->whereNotNull('status')
            ->pluck('status')
            ->toArray();

        return Inertia::render('Reports/Index', [
            'leadStats' => $leadStats,
            'userPerformance' => $userPerformance,
            'dailyTrends' => $dailyTrends,
            'statusDistribution' => $statusDistribution,
            'topPerformers' => $topPerformers,
            'recentActivities' => $recentActivities,
            'users' => $users,
            'statuses' => $statuses,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'user_id' => $userId,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Get lead statistics
     */
    private function getLeadStatistics($dateFrom, $dateTo, $userId = null, $status = null)
    {
        // Build base query with exact same filters
        $baseQuery = Lead::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($userId) {
            $baseQuery->where('assigned_to', $userId);
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

        // Clone the query for each calculation to ensure consistency
        $totalLeads = (clone $baseQuery)->count();
        $hotLeads = (clone $baseQuery)->where('priority', 'Hot')->count();
        $warmLeads = (clone $baseQuery)->where('priority', 'Warm')->count();
        $coldLeads = (clone $baseQuery)->where('priority', 'Cold')->count();
        $bookingLeads = (clone $baseQuery)->where('priority', 'Booking')->count();
        $closingLeads = (clone $baseQuery)->where('priority', 'Closing')->count();
        $lostLeads = (clone $baseQuery)->where('priority', 'Lost')->count();

        $conversionRate = $totalLeads > 0 ? round((($closingLeads + $bookingLeads) / $totalLeads) * 100, 2) : 0;

        // Enhanced debug with actual SQL queries
        Log::info('Lead Statistics Enhanced Debug', [
            'filters' => compact('dateFrom', 'dateTo', 'userId', 'status'),
            'sql_base_query' => $baseQuery->toSql(),
            'sql_parameters' => $baseQuery->getBindings(),
            'results' => [
                'total_leads' => $totalLeads,
                'hot_leads' => $hotLeads,
                'warm_leads' => $warmLeads,
                'cold_leads' => $coldLeads,
                'booking_leads' => $bookingLeads,
                'closing_leads' => $closingLeads,
                'lost_leads' => $lostLeads,
                'priority_sum' => $hotLeads + $warmLeads + $coldLeads + $bookingLeads + $closingLeads + $lostLeads,
                'conversion_rate' => $conversionRate,
            ]
        ]);

        return [
            'total_leads' => $totalLeads,
            'hot_leads' => $hotLeads,
            'warm_leads' => $warmLeads,
            'cold_leads' => $coldLeads,
            'booking_leads' => $bookingLeads,
            'closing_leads' => $closingLeads,
            'lost_leads' => $lostLeads,
            'conversion_rate' => $conversionRate,
        ];
    }    /**
     * Get user performance metrics
     */
    private function getUserPerformance($dateFrom, $dateTo, $userId = null, $status = null)
    {
        $users = User::with('roles')
            ->where('is_active', true)
            ->when($userId, function ($query) use ($userId) {
                return $query->where('id', $userId);
            })
            ->get()
            ->map(function ($user) use ($dateFrom, $dateTo, $status) {
                // Build base query exactly like getLeadStatistics
                $baseQuery = Lead::where('assigned_to', $user->id)
                    ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

                if ($status) {
                    $baseQuery->where('status', $status);
                }

                // Clone query for each calculation to ensure consistency
                $totalLeads = (clone $baseQuery)->count();
                $hotLeads = (clone $baseQuery)->where('priority', 'Hot')->count();
                $warmLeads = (clone $baseQuery)->where('priority', 'Warm')->count();
                $coldLeads = (clone $baseQuery)->where('priority', 'Cold')->count();
                $bookingLeads = (clone $baseQuery)->where('priority', 'Booking')->count();
                $closingLeads = (clone $baseQuery)->where('priority', 'Closing')->count();
                $lostLeads = (clone $baseQuery)->where('priority', 'Lost')->count();

                $conversionRate = $totalLeads > 0 ? round((($closingLeads + $bookingLeads) / $totalLeads) * 100, 2) : 0;

                $user->total_leads = $totalLeads;
                $user->hot_leads = $hotLeads;
                $user->warm_leads = $warmLeads;
                $user->cold_leads = $coldLeads;
                $user->booking_leads = $bookingLeads;
                $user->closing_leads = $closingLeads;
                $user->lost_leads = $lostLeads;
                $user->conversion_rate = $conversionRate;

                return $user;
            })
            ->filter(function ($user) {
                return $user->total_leads > 0; // Only show users with leads
            })
            ->sortByDesc('conversion_rate');

        // Add unassigned leads as a virtual user
        $unassignedQuery = Lead::whereNull('assigned_to')
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($status) {
            $unassignedQuery->where('status', $status);
        }

        $unassignedTotal = (clone $unassignedQuery)->count();

        if ($unassignedTotal > 0) {
            $unassignedUser = (object) [
                'id' => 0,
                'name' => 'Unassigned Leads',
                'email' => 'unassigned@system.local',
                'profile_picture' => null,
                'total_leads' => $unassignedTotal,
                'hot_leads' => (clone $unassignedQuery)->where('priority', 'Hot')->count(),
                'warm_leads' => (clone $unassignedQuery)->where('priority', 'Warm')->count(),
                'cold_leads' => (clone $unassignedQuery)->where('priority', 'Cold')->count(),
                'booking_leads' => (clone $unassignedQuery)->where('priority', 'Booking')->count(),
                'closing_leads' => (clone $unassignedQuery)->where('priority', 'Closing')->count(),
                'lost_leads' => (clone $unassignedQuery)->where('priority', 'Lost')->count(),
                'conversion_rate' => $unassignedTotal > 0 ? round(((clone $unassignedQuery)->whereIn('priority', ['Closing', 'Booking'])->count() / $unassignedTotal) * 100, 2) : 0,
            ];

            $users->push($unassignedUser);
        }

        $users = $users->sortByDesc('conversion_rate')->values();

        // Debug user performance
        Log::info('User Performance Debug', [
            'filters' => compact('dateFrom', 'dateTo', 'userId', 'status'),
            'total_users_with_leads' => $users->count(),
            'total_leads_from_users' => $users->sum('total_leads'),
            'unassigned_leads' => $unassignedTotal,
            'users_summary' => $users->map(function($user) {
                return [
                    'name' => $user->name,
                    'total_leads' => $user->total_leads,
                    'conversion_rate' => $user->conversion_rate
                ];
            })->toArray()
        ]);

        return $users;
    }

    /**
     * Get daily lead trends
     */
    private function getDailyLeadTrends($dateFrom, $dateTo, $userId = null, $status = null)
    {
        $trends = [];
        $startDate = Carbon::parse($dateFrom);
        $endDate = Carbon::parse($dateTo);

        // Show ALL days in the date range
        while ($startDate->lte($endDate)) {
            $date = $startDate->format('Y-m-d');

            // Build base query exactly like other functions
            $baseQuery = Lead::whereDate('created_at', $date);

            if ($userId) {
                $baseQuery->where('assigned_to', $userId);
            }

            if ($status) {
                $baseQuery->where('status', $status);
            }

            $totalLeads = (clone $baseQuery)->count();
            $closingLeads = (clone $baseQuery)->where('priority', 'Closing')->count();
            $bookingLeads = (clone $baseQuery)->where('priority', 'Booking')->count();

            $trends[] = [
                'date' => $date,
                'leads' => $totalLeads,
                'closing' => $closingLeads,
                'booking' => $bookingLeads,
                'formatted_date' => $startDate->format('M j')
            ];

            $startDate->addDay();
        }

        Log::info('Daily Trends Debug', [
            'filters' => compact('dateFrom', 'dateTo', 'userId', 'status'),
            'total_days' => count($trends),
            'total_daily_leads' => array_sum(array_column($trends, 'leads')),
            'total_daily_closing' => array_sum(array_column($trends, 'closing')),
            'total_daily_booking' => array_sum(array_column($trends, 'booking')),
            'sample_data' => array_slice($trends, 0, 5)
        ]);

        return $trends;
    }

    /**
     * Get status distribution
     */
    private function getStatusDistribution($dateFrom, $dateTo, $userId = null, $status = null)
    {
        // Build base query exactly like other functions
        $baseQuery = Lead::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($userId) {
            $baseQuery->where('assigned_to', $userId);
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

        $distribution = (clone $baseQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => ucfirst(str_replace('_', ' ', $item->status))
                ];
            });

        // Debug status distribution
        Log::info('Status Distribution Debug', [
            'filters' => compact('dateFrom', 'dateTo', 'userId', 'status'),
            'total_in_distribution' => $distribution->sum('count'),
            'distribution_breakdown' => $distribution->toArray()
        ]);

        return $distribution;
    }

    /**
     * Get top performers
     */
    private function getTopPerformers($dateFrom, $dateTo, $userId = null, $status = null)
    {
        // Build base query exactly like other functions
        $baseQuery = Lead::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($userId) {
            $baseQuery->where('assigned_to', $userId);
        }

        if ($status) {
            $baseQuery->where('status', $status);
        }

        // Get users who have leads in this period (excluding NULL assigned_to)
        $userIds = (clone $baseQuery)->whereNotNull('assigned_to')->distinct()->pluck('assigned_to')->filter();

        $performers = User::whereIn('id', $userIds)
            ->get()
            ->map(function ($user) use ($dateFrom, $dateTo, $status) {
                // Use same query structure as getUserPerformance
                $userBaseQuery = Lead::where('assigned_to', $user->id)
                    ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

                if ($status) {
                    $userBaseQuery->where('status', $status);
                }

                $totalLeads = (clone $userBaseQuery)->count();
                $convertedLeads = (clone $userBaseQuery)->whereIn('priority', ['Closing', 'Booking'])->count();
                $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_picture' => $user->profile_picture,
                    'total_leads' => $totalLeads,
                    'converted_leads' => $convertedLeads,
                    'conversion_rate' => $conversionRate,
                ];
            });

        // Add unassigned leads if they exist
        $unassignedQuery = Lead::whereNull('assigned_to')
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($status) {
            $unassignedQuery->where('status', $status);
        }

        $unassignedTotal = (clone $unassignedQuery)->count();

        if ($unassignedTotal > 0) {
            $unassignedConverted = (clone $unassignedQuery)->whereIn('priority', ['Closing', 'Booking'])->count();
            $unassignedRate = $unassignedTotal > 0 ? round(($unassignedConverted / $unassignedTotal) * 100, 2) : 0;

            $performers->push([
                'id' => 0,
                'name' => 'Unassigned Leads',
                'email' => 'unassigned@system.local',
                'profile_picture' => null,
                'total_leads' => $unassignedTotal,
                'converted_leads' => $unassignedConverted,
                'conversion_rate' => $unassignedRate,
            ]);
        }

        $performers = $performers->sortByDesc('converted_leads')->take(5)->values();

        // Debug top performers
        Log::info('Top Performers Debug', [
            'filters' => compact('dateFrom', 'dateTo', 'userId', 'status'),
            'total_performers' => $performers->count(),
            'total_leads_in_performers' => $performers->sum('total_leads'),
            'unassigned_leads' => $unassignedTotal,
            'performers_summary' => $performers->map(function ($performer) {
                return [
                    'name' => $performer['name'],
                    'total_leads' => $performer['total_leads'],
                    'converted_leads' => $performer['converted_leads'],
                    'conversion_rate' => $performer['conversion_rate']
                ];
            })->toArray()
        ]);

        return $performers;
    }    /**
     * Get recent activities
     */
    private function getRecentActivities()
    {
        return ActivityLog::with(['user:id,name,email'])
            ->select('id', 'user_id', 'action', 'description', 'created_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user_name' => $activity->user->name ?? 'Unknown',
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'created_at' => $activity->created_at->diffForHumans(),
                    'formatted_date' => $activity->created_at->format('M d, Y H:i'),
                ];
            });
    }

    /**
     * Export reports to Excel/CSV
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'json'); // json, csv
        $report = $request->input('report', 'leads'); // leads, users, activities
        $dateFrom = $request->input('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        $filters = [
            'user_id' => $request->input('user_id'),
            'status' => $request->input('status'),
        ];

        switch ($report) {
            case 'leads':
                $data = $this->getLeadsForExport($dateFrom, $dateTo, $filters);
                $filename = 'leads_report_' . date('Y-m-d_H-i-s');
                break;
            case 'users':
                $data = $this->getUserPerformanceForExport($dateFrom, $dateTo);
                $filename = 'user_performance_' . date('Y-m-d_H-i-s');
                break;
            case 'activities':
                $data = $this->getActivitiesForExport($dateFrom, $dateTo, $filters);
                $filename = 'activities_' . date('Y-m-d_H-i-s');
                break;
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }

        if ($type === 'csv') {
            return $this->exportToCsv($data, $filename, $report);
        }

        // Default JSON export
        return response()->json([
            'success' => true,
            'data' => $data,
            'filters' => array_merge(['date_from' => $dateFrom, 'date_to' => $dateTo], $filters),
            'report_type' => $report,
            'generated_at' => now()->toDateTimeString(),
        ]);
    }

    private function getLeadsForExport($dateFrom, $dateTo, $filters)
    {
        $query = Lead::with(['assignedTo', 'createdBy', 'manager', 'spv'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if (!empty($filters['user_id'])) {
            $query->where('assigned_to', $filters['user_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->get()->map(function ($lead) {
            return [
                'id' => $lead->id,
                'contact_name' => $lead->contact_name,
                'contact_email' => $lead->contact_email,
                'contact_phone' => $lead->contact_phone,
                'contact_company' => $lead->contact_company,
                'project' => $lead->project,
                'unit_type' => $lead->unit_type,
                'unit_no' => $lead->unit_no,
                'priority' => $lead->priority,
                'status' => $lead->status,
                'estimated_value' => $lead->estimated_value ? 'Rp ' . number_format($lead->estimated_value, 0, ',', '.') : '',
                'expected_closing_date' => $lead->expected_closing_date ? $lead->expected_closing_date->format('Y-m-d') : '',
                'source' => $lead->source,
                'assigned_to' => $lead->assignedTo ? $lead->assignedTo->name : '',
                'created_by' => $lead->createdBy ? $lead->createdBy->name : '',
                'manager' => $lead->manager ? $lead->manager->name : '',
                'supervisor' => $lead->spv ? $lead->spv->name : '',
                'created_at' => $lead->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $lead->updated_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    private function getUserPerformanceForExport($dateFrom, $dateTo)
    {
        return $this->getUserPerformance($dateFrom, $dateTo)->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()->name ?? 'N/A',
                'total_leads' => $user->total_leads,
                'new_leads' => $user->new_leads,
                'in_progress_leads' => $user->in_progress_leads,
                'converted_leads' => $user->converted_leads,
                'conversion_rate' => $user->conversion_rate . '%',
                'created_at' => $user->created_at->format('Y-m-d'),
            ];
        });
    }

    private function getActivitiesForExport($dateFrom, $dateTo, $filters)
    {
        $query = ActivityLog::with('user')
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query->orderBy('created_at', 'desc')->limit(1000)->get()->map(function ($activity) {
            return [
                'id' => $activity->id,
                'user_name' => $activity->user ? $activity->user->name : 'System',
                'action' => $activity->action,
                'model' => $activity->model,
                'model_id' => $activity->model_id,
                'description' => $activity->description,
                'ip_address' => $activity->ip_address,
                'user_agent' => $activity->user_agent,
                'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    private function exportToCsv($data, $filename, $reportType)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function() use ($data, $reportType) {
            $file = fopen('php://output', 'w');

            // Add CSV headers based on report type
            switch ($reportType) {
                case 'users':
                    fputcsv($file, ['ID', 'Name', 'Email', 'Role', 'Total Leads', 'New Leads', 'In Progress', 'Converted', 'Conversion Rate', 'Join Date']);
                    break;
                case 'activities':
                    fputcsv($file, ['ID', 'User', 'Action', 'Model', 'Model ID', 'Description', 'IP Address', 'User Agent', 'Created At']);
                    break;
                default:
                    fputcsv($file, ['ID', 'Contact Name', 'Email', 'Phone', 'Company', 'Project', 'Unit Type', 'Unit No', 'Priority', 'Status', 'Estimated Value', 'Expected Closing', 'Source', 'Assigned To', 'Created By', 'Manager', 'Supervisor', 'Created At', 'Updated At']);
                    break;
            }

            foreach ($data as $row) {
                fputcsv($file, array_values($row));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
