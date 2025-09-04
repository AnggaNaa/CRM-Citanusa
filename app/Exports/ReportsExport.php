<?php

namespace App\Exports;

use App\Models\Lead;
use App\Models\User;
use App\Models\ActivityLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class LeadsReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected $filters;
    protected $reportType;

    public function __construct($filters = [], $reportType = 'leads')
    {
        $this->filters = $filters;
        $this->reportType = $reportType;
    }

    public function collection()
    {
        $query = Lead::with(['assignedTo', 'createdBy', 'manager', 'spv']);

        // Apply filters
        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('assigned_to', $this->filters['user_id']);
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Contact Name',
            'Contact Email',
            'Contact Phone',
            'Company',
            'Project',
            'Unit Type',
            'Unit No',
            'Priority',
            'Status',
            'Estimated Value',
            'Expected Closing',
            'Source',
            'Assigned To',
            'Created By',
            'Manager',
            'Supervisor',
            'Created At',
            'Updated At',
        ];
    }

    public function map($lead): array
    {
        return [
            $lead->id,
            $lead->contact_name,
            $lead->contact_email,
            $lead->contact_phone,
            $lead->contact_company,
            $lead->project,
            $lead->unit_type,
            $lead->unit_no,
            $lead->priority,
            $lead->status,
            $lead->estimated_value ? 'Rp ' . number_format($lead->estimated_value, 0, ',', '.') : '',
            $lead->expected_closing_date ? $lead->expected_closing_date->format('Y-m-d') : '',
            $lead->source,
            $lead->assignedTo ? $lead->assignedTo->name : '',
            $lead->createdBy ? $lead->createdBy->name : '',
            $lead->manager ? $lead->manager->name : '',
            $lead->spv ? $lead->spv->name : '',
            $lead->created_at->format('Y-m-d H:i:s'),
            $lead->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function title(): string
    {
        return 'Leads Report';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class UserPerformanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = User::with(['assignedLeads', 'createdLeads']);

        // Apply date filters to leads
        $dateFrom = $this->filters['date_from'] ?? null;
        $dateTo = $this->filters['date_to'] ?? null;

        $users = $query->get()->map(function ($user) use ($dateFrom, $dateTo) {
            $leadsQuery = $user->assignedLeads();

            if ($dateFrom) {
                $leadsQuery->whereDate('created_at', '>=', $dateFrom);
            }

            if ($dateTo) {
                $leadsQuery->whereDate('created_at', '<=', $dateTo);
            }

            $totalLeads = $leadsQuery->count();
            $convertedLeads = $leadsQuery->whereIn('status', ['converted'])->count();
            $newLeads = $leadsQuery->where('status', 'new')->count();
            $inProgressLeads = $leadsQuery->where('status', 'in_progress')->count();

            $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

            $user->total_leads = $totalLeads;
            $user->converted_leads = $convertedLeads;
            $user->new_leads = $newLeads;
            $user->in_progress_leads = $inProgressLeads;
            $user->conversion_rate = $conversionRate;

            return $user;
        })->filter(function ($user) {
            return $user->total_leads > 0; // Only include users with leads
        });

        return $users;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Email',
            'Role',
            'Total Leads',
            'New Leads',
            'In Progress Leads',
            'Converted Leads',
            'Conversion Rate (%)',
            'Join Date',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->roles->first()->name ?? 'N/A',
            $user->total_leads,
            $user->new_leads,
            $user->in_progress_leads,
            $user->converted_leads,
            $user->conversion_rate . '%',
            $user->created_at->format('Y-m-d'),
        ];
    }

    public function title(): string
    {
        return 'User Performance';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class ActivityLogExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = ActivityLog::with('user');

        // Apply filters
        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        return $query->orderBy('created_at', 'desc')->limit(1000)->get(); // Limit to 1000 records
    }

    public function headings(): array
    {
        return [
            'ID',
            'User',
            'Action',
            'Model',
            'Model ID',
            'Description',
            'IP Address',
            'User Agent',
            'Created At',
        ];
    }

    public function map($activity): array
    {
        return [
            $activity->id,
            $activity->user ? $activity->user->name : 'System',
            $activity->action,
            $activity->model,
            $activity->model_id,
            $activity->description,
            $activity->ip_address,
            $activity->user_agent,
            $activity->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function title(): string
    {
        return 'Activity Logs';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
