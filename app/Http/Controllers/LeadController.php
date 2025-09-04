<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadHistory;
use App\Models\User;
use App\Models\ProjectUnit;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Lead::with(['assignedTo', 'createdBy', 'manager', 'spv']);

        // Filter leads based on user role and hierarchy
        if (!$user->hasRole('superadmin')) {
            if ($user->hasRole('ha')) {
                // HA can only see their own leads
                $query->where('assigned_to', $user->id);
            } elseif ($user->hasRole('spv')) {
                // SPV can see their own leads and their HA's leads
                $query->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhere('spv_id', $user->id)
                      ->orWhereHas('assignedTo', function ($subQ) use ($user) {
                          $subQ->where('spv_id', $user->id);
                      });
                });
            } elseif ($user->hasRole('manager')) {
                // Manager can see all leads in their team
                $query->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhere('manager_id', $user->id)
                      ->orWhereHas('assignedTo', function ($subQ) use ($user) {
                          $subQ->where('manager_id', $user->id);
                      });
                });
            }
        }

        // Apply filters
        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('assigned_to') && $request->assigned_to !== '') {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('project') && $request->project !== '') {
            $query->where('project', $request->project);
        }

        if ($request->has('unit_type') && $request->unit_type !== '') {
            $query->where('unit_type', $request->unit_type);
        }

        if ($request->has('start_date') && $request->start_date !== '') {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date !== '') {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('contact_email', 'like', "%{$search}%")
                  ->orWhere('project', 'like', "%{$search}%");
            });
        }

        // Get pagination size from request (default 25, options: 10, 25, 50, 100)
        $perPage = $request->get('per_page', 25);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 25;
        }

        $leads = $query->latest()->paginate($perPage);
        $leads->appends($request->query());

        // Ensure proper pagination structure for Inertia
        $paginationData = [
            'data' => $leads->items(),
            'meta' => [
                'from' => $leads->firstItem(),
                'to' => $leads->lastItem(),
                'total' => $leads->total(),
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
            ],
            'links' => $leads->linkCollection()->toArray(),
        ];

        // Get available users for assignment based on role
        $availableUsers = $this->getAvailableUsers($user);

        // Get unique projects and unit types from ProjectUnit model
        $projects = ProjectUnit::distinct('project')->pluck('project')->toArray();
        $unitTypes = ProjectUnit::distinct('unit_type')->pluck('unit_type')->toArray();

        return Inertia::render('Leads/Index', [
            'leads' => $paginationData,
            'availableUsers' => $availableUsers,
            'filters' => $request->only(['priority', 'status', 'assigned_to', 'search', 'project', 'unit_type', 'per_page']),
            'priorities' => Lead::getPriorities(),
            'statuses' => Status::all(),
            'projects' => $projects,
            'unitTypes' => $unitTypes,
            'perPageOptions' => $allowedPerPage,
        ]);
    }

        /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();

        // Get available users for assignment based on role
        $availableUsers = $this->getAvailableUsersForAssignment($user);

        // Define available options
        $priorities = Lead::getPriorities();
        $leadSources = ['website', 'referral', 'social_media', 'email_marketing', 'cold_call', 'event', 'advertisement'];

        // Get projects and unit types from ProjectUnit model
        $projects = ProjectUnit::distinct('project')->pluck('project')->toArray();
        $unitTypes = ProjectUnit::distinct('unit_type')->pluck('unit_type')->toArray();

        return Inertia::render('Leads/Create', [
            'availableUsers' => $availableUsers,
            'priorities' => $priorities,
            'leadSources' => $leadSources,
            'projects' => $projects,
            'unitTypes' => $unitTypes,
        ]);
    }

        /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'description' => 'nullable|string',
            'priority' => 'required|in:' . implode(',', Lead::getPriorities()),
            'status' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'project' => 'nullable|string|max:255',
            'unit_type' => 'nullable|string|max:100',
            'unit_no' => 'nullable|string|max:100',
            'estimated_value' => 'nullable|numeric|min:0',
            'expected_closing_date' => 'nullable|date',
            'source' => 'nullable|string|max:100',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_address' => 'nullable|string',
            'contact_company' => 'nullable|string|max:255',
            'contact_position' => 'nullable|string|max:100',
            'assigned_to' => 'required|exists:users,id', // Assigned to is required and must be HA
        ]);

        // Set hierarchy information
        $validated['created_by'] = $user->id;
        $validated['manager_id'] = $user->manager_id;
        $validated['spv_id'] = $user->spv_id;

        // Validate assignment permissions
        if ($validated['assigned_to']) {
            $availableUsers = $this->getAvailableUsersForAssignment($user);
            $availableUserIds = $availableUsers->pluck('id')->toArray();

            if (!in_array($validated['assigned_to'], $availableUserIds)) {
                return back()->withErrors([
                    'assigned_to' => 'You cannot assign leads to this user.'
                ]);
            }
        }

        $lead = Lead::create($validated);

        // Create history record
        LeadHistory::create([
            'lead_id' => $lead->id,
            'new_priority' => $lead->priority,
            'description' => 'Lead created',
            'created_by' => $user->id,
        ]);

        return redirect()->route('leads.index')->with('message', 'Lead created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead)
    {
        $user = auth()->user();

        // Check if user can view this lead
        if (!$this->canUserAccessLead($user, $lead)) {
            abort(403, 'Unauthorized access to this lead.');
        }

        // Load all necessary relationships
        $lead->load([
            'assigned_user',
            'creator',
            'manager',
            'spv',
            'histories.creator',
            'attachments.uploader'
        ]);

        return Inertia::render('Leads/Show', [
            'lead' => $lead,
        ]);
    }

        /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lead $lead)
    {
        $user = auth()->user();

        // Check if user can edit this lead
        if (!$this->canUserAccessLead($user, $lead)) {
            abort(403, 'Unauthorized access to this lead.');
        }

        // Get available users for assignment based on role
        $availableUsers = $this->getAvailableUsersForAssignment($user);

        // Define available options
        $priorities = Lead::getPriorities();
        $leadSources = ['website', 'referral', 'social_media', 'email_marketing', 'cold_call', 'event', 'advertisement'];

        // Get available projects and unit types
        $projects = ProjectUnit::distinct()->pluck('project')->toArray();
        $unitTypes = ProjectUnit::distinct()->pluck('unit_type')->toArray();

        // Load relationships
        $lead->load(['assignedTo', 'createdBy', 'histories.createdBy', 'attachments.uploadedBy']);

        return Inertia::render('Leads/Edit', [
            'lead' => $lead,
            'availableUsers' => $availableUsers,
            'priorities' => $priorities,
            'leadSources' => $leadSources,
            'projects' => $projects,
            'unitTypes' => $unitTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'priority' => 'required|in:' . implode(',', Lead::getPriorities()),
            'status' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'project' => 'nullable|string|max:255',
            'unit_type' => 'nullable|string|max:255',
            'unit_no' => 'nullable|string|max:255',
            'estimated_value' => 'nullable|numeric|min:0',
            'expected_closing_date' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'contact_address' => 'nullable|string',
            'contact_company' => 'nullable|string|max:255',
            'contact_position' => 'nullable|string|max:255',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // Update hierarchy if assignment changed
        if (isset($validated['assigned_to']) && $validated['assigned_to'] !== $lead->assigned_to) {
            $assignedUser = User::find($validated['assigned_to']);
            if ($assignedUser) {
                $validated['manager_id'] = $assignedUser->manager_id;
                $validated['spv_id'] = $assignedUser->spv_id;
            }
        }

        $lead->update($validated);

        return redirect()->route('leads.index')->with('message', 'Lead updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead): RedirectResponse
    {
        // Delete attachments from storage
        foreach ($lead->attachments as $attachment) {
            Storage::delete($attachment->file_path);
        }

        $lead->delete();

        return redirect()->route('leads.index')->with('message', 'Lead deleted successfully.');
    }

    /**
     * Upload attachment for a lead.
     */
    public function uploadAttachment(Request $request, Lead $lead): RedirectResponse
    {
        $request->validate([
            'attachment' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('attachment');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('lead_attachments', $filename, 'public');

        $lead->attachments()->create([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => Auth::id(),
        ]);

        return back()->with('message', 'Attachment uploaded successfully.');
    }

    /**
     * Get available users for assignment based on current user's role.
     */
    private function getAvailableUsers(User $user): array
    {
        if ($user->hasRole('superadmin')) {
            // Superadmin can assign to anyone
            return User::with('roles')->get()->toArray();
        } elseif ($user->hasRole('manager')) {
            // Manager can assign to their team members
            return User::where('manager_id', $user->id)
                       ->orWhere('id', $user->id)
                       ->with('roles')
                       ->get()
                       ->toArray();
        } elseif ($user->hasRole('spv')) {
            // SPV can assign to their HA team members
            return User::where('spv_id', $user->id)
                       ->orWhere('id', $user->id)
                       ->with('roles')
                       ->get()
                       ->toArray();
        } else {
            // HA can only assign to themselves
            return [$user->toArray()];
        }
    }

    /**
     * Get available users for assignment (HA users only).
     */
    private function getAvailableUsersForAssignment(User $user)
    {
        if ($user->hasRole('superadmin')) {
            // Superadmin can assign to any HA
            return User::role('ha')->with('roles')->get();
        } elseif ($user->hasRole('manager')) {
            // Manager can assign to HA users under their management
            return User::role('ha')->where('manager_id', $user->id)->with('roles')->get();
        } elseif ($user->hasRole('spv')) {
            // SPV can assign to HA users under their supervision
            return User::role('ha')->where('spv_id', $user->id)->with('roles')->get();
        } else {
            // HA can only assign to themselves (if they can create leads)
            return User::where('id', $user->id)->with('roles')->get();
        }
    }

    /**
     * Check if user can access this lead.
     */
    private function canUserAccessLead(User $user, Lead $lead): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($user->hasRole('manager')) {
            // Manager can access leads assigned to their team or created by them
            return $lead->created_by === $user->id
                || $lead->manager_id === $user->id
                || ($lead->assignedTo && $lead->assignedTo->manager_id === $user->id);
        }

        if ($user->hasRole('spv')) {
            // SPV can access leads assigned to their team or created by them
            return $lead->created_by === $user->id
                || $lead->spv_id === $user->id
                || ($lead->assignedTo && $lead->assignedTo->spv_id === $user->id);
        }

        if ($user->hasRole('ha')) {
            // HA can only access leads assigned to them or created by them
            return $lead->assigned_to === $user->id || $lead->created_by === $user->id;
        }

        return false;
    }

    /**
     * Get leads by priority.
     */
    public function byPriority($priority)
    {
        $user = auth()->user();

        if (!in_array($priority, Lead::getPriorities())) {
            abort(404, 'Invalid priority');
        }

        $leads = Lead::forUser($user)
            ->where('priority', $priority)
            ->with(['assignedTo', 'createdBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Leads/ByPriority', [
            'leads' => $leads,
            'priority' => $priority
        ]);
    }

    /**
     * Get leads by HA user.
     */
    public function byHA($haId)
    {
        $user = User::with('roles')->find(auth()->id());
        $haUser = User::role('ha')->findOrFail($haId);

        // Check if current user can view this HA's leads
        if (!$user->hasRole('superadmin')) {
            if ($user->hasRole('manager') && $haUser->manager_id !== $user->id) {
                abort(403, 'Unauthorized');
            }
            if ($user->hasRole('spv') && $haUser->spv_id !== $user->id) {
                abort(403, 'Unauthorized');
            }
            if ($user->hasRole('ha') && $haUser->id !== $user->id) {
                abort(403, 'Unauthorized');
            }
        }

        $leads = Lead::where('assigned_to', $haId)
            ->with(['assignedTo', 'createdBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Leads/ByHA', [
            'leads' => $leads,
            'haUser' => $haUser
        ]);
    }

    /**
     * Search leads.
     */
    public function search(Request $request)
    {
        $user = auth()->user();
        $query = $request->get('q', '');

        $leads = Lead::forUser($user)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('contact_name', 'like', "%{$query}%")
                  ->orWhere('contact_email', 'like', "%{$query}%")
                  ->orWhere('project', 'like', "%{$query}%")
                  ->orWhere('contact_company', 'like', "%{$query}%");
            })
            ->with(['assignedTo', 'createdBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Leads/Search', [
            'leads' => $leads,
            'query' => $query
        ]);
    }

    /**
     * Delete attachment.
     */
    public function deleteAttachment(Lead $lead, $attachmentId)
    {
        $attachment = $lead->attachments()->findOrFail($attachmentId);

        // Check if user can delete this attachment
        $user = auth()->user();
        if (!$this->canUserAccessLead($user, $lead)) {
            abort(403, 'Unauthorized');
        }

        // Delete file from storage
        Storage::delete($attachment->file_path);

        // Delete record
        $attachment->delete();

        return back()->with('message', 'Attachment deleted successfully.');
    }

    /**
     * Quick update for priority, status, and description
     */
    public function quickUpdate(Request $request, Lead $lead)
    {
        $user = $request->user();

        // Check permissions
        if (!$this->canUserAccessLead($user, $lead)) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'priority' => 'required|string|in:Cold,Warm,Hot,Booking,Closing,Lost',
            'status' => 'nullable|string|in:new,contacted,qualified,proposal,negotiation,closed,lost',
            'description' => 'nullable|string|max:2000',
        ]);

        $oldData = [
            'priority' => $lead->priority,
            'status' => $lead->status,
            'description' => $lead->description,
        ];

        // Update the lead
        $lead->update([
            'priority' => $request->priority,
            'status' => $request->status ?: $lead->status,
            'description' => $request->description ?: $lead->description,
        ]);

        // Create history entry for changes
        $changes = [];
        if ($oldData['priority'] !== $lead->priority) {
            $changes[] = "Priority: {$oldData['priority']} → {$lead->priority}";
        }
        if ($request->status && $oldData['status'] !== $lead->status) {
            $changes[] = "Status: {$oldData['status']} → {$lead->status}";
        }
        if ($request->description && $oldData['description'] !== $lead->description) {
            $changes[] = "Description updated";
        }

        if (!empty($changes)) {
            LeadHistory::create([
                'lead_id' => $lead->id,
                'old_priority' => $oldData['priority'],
                'new_priority' => $lead->priority,
                'description' => 'Quick Update: ' . implode(', ', $changes),
                'created_by' => $user->id,
            ]);
        }

        return back()->with('message', 'Lead updated successfully');
    }

    /**
     * Get available units by project and unit type
     */
    public function getUnits(Request $request)
    {
        $project = $request->get('project');
        $unitType = $request->get('unit_type');

        $query = ProjectUnit::query();

        if ($project) {
            $query->where('project', $project);
        }

        if ($unitType) {
            $query->where('unit_type', $unitType);
        }

        $units = $query->where('status', 'available')
                      ->select('unit_no', 'price', 'size')
                      ->get();

        return response()->json($units);
    }

    /**
     * Get statuses grouped by priority from database
     */
    private function getStatusesByPriority()
    {
        $statuses = Status::where('is_active', true)
            ->orderBy('priority')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('priority');

        $result = [];
        foreach ($statuses as $priority => $statusList) {
            $result[$priority] = $statusList->pluck('name')->toArray();
        }

        return $result;
    }

    /**
     * Get unit types by project
     */
    public function getUnitTypesByProject(Request $request)
    {
        $project = $request->get('project');

        if (!$project) {
            return response()->json([]);
        }

        $unitTypes = ProjectUnit::where('project', $project)
            ->distinct('unit_type')
            ->pluck('unit_type')
            ->toArray();

        return response()->json($unitTypes);
    }

    /**
     * Get statuses by priority (API endpoint)
     */
    public function getStatusesByPriorityAPI(Request $request)
    {
        $priority = $request->get('priority');

        if (!$priority) {
            return response()->json($this->getStatusesByPriority());
        }

        $statuses = Status::where('priority', $priority)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->pluck('name')
            ->toArray();

        return response()->json($statuses);
    }
}
