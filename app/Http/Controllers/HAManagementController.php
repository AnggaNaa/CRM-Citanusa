<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class HAManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('permission:create_users');
    }

    /**
     * Display a listing of HA users
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();

        // Base query for HA users only
        $query = User::role('ha')
                    ->with(['roles', 'manager', 'spv'])
                    ->withCount('assignedLeads');

        // Filter based on current user's role and hierarchy
        if ($currentUser->hasRole('manager')) {
            // Manager can only see HA under their management
            $query->where('manager_id', $currentUser->id);
        } elseif ($currentUser->hasRole('spv')) {
            // SPV can only see HA under their supervision
            $query->where('spv_id', $currentUser->id);
        }
        // Superadmin and users with create_users permission can see all HA

        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('employee_id', 'like', "%{$request->search}%");
            });
        }

        // Filter by status
        if ($request->status === 'active') {
            $query->active();
        } elseif ($request->status === 'inactive') {
            $query->inactive();
        }

        $perPage = $request->get('per_page', 25);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 25;
        }

        $haUsers = $query->latest()->paginate($perPage);
        $haUsers->appends($request->query());

        return Inertia::render('HAManagement/Index', [
            'haUsers' => $haUsers,
            'filters' => $request->only(['search', 'status', 'per_page']),
            'perPageOptions' => $allowedPerPage,
            'canCreate' => auth()->user()->can('create_users'),
        ]);
    }

    /**
     * Show the form for creating a new HA user
     */
    public function create()
    {
        $currentUser = auth()->user();

        // Get potential managers and supervisors based on current user's role
        $managers = collect();
        $supervisors = collect();

        if ($currentUser->hasRole('superadmin')) {
            $managers = User::role(['superadmin', 'manager'])->get();
            $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();
        } elseif ($currentUser->hasRole('manager')) {
            $managers = collect([$currentUser]); // Manager can only assign themselves
            $supervisors = User::role('spv')->where('manager_id', $currentUser->id)->get();
        } elseif ($currentUser->hasRole('spv')) {
            $managers = collect([$currentUser->manager])->filter(); // SPV's manager
            $supervisors = collect([$currentUser]); // SPV can only assign themselves
        } else {
            // User with create_users permission but specific role
            $managers = User::role(['superadmin', 'manager'])->get();
            $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();
        }

        return Inertia::render('HAManagement/Create', [
            'managers' => $managers,
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * Store a newly created HA user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'employee_id' => 'nullable|string|unique:users',
            'join_date' => 'nullable|date',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
        ]);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = true;

        $user = User::create($validated);

        // Assign HA role only
        $user->assignRole('ha');

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'create',
            "Created HA user: {$user->name}",
            'User',
            $user->id,
            ['user_data' => $user->toArray()]
        );

        return redirect()->route('ha-management.index')
                        ->with('success', 'HA user created successfully.');
    }

    /**
     * Display the specified HA user
     */
    public function show(User $user)
    {
        // Ensure this is an HA user
        if (!$user->hasRole('ha')) {
            abort(404);
        }

        $user->load(['roles', 'manager', 'spv', 'assignedLeads', 'activityLogs' => function($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('HAManagement/Show', [
            'haUser' => $user,
            'recentActivities' => $user->activityLogs,
            'leadsCount' => $user->assignedLeads->count(),
        ]);
    }

    /**
     * Show the form for editing the specified HA user
     */
    public function edit(User $user)
    {
        // Ensure this is an HA user
        if (!$user->hasRole('ha')) {
            abort(404);
        }

        $currentUser = auth()->user();

        // Get potential managers and supervisors based on current user's role
        $managers = collect();
        $supervisors = collect();

        if ($currentUser->hasRole('superadmin')) {
            $managers = User::role(['superadmin', 'manager'])->get();
            $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();
        } elseif ($currentUser->hasRole('manager')) {
            $managers = collect([$currentUser]);
            $supervisors = User::role('spv')->where('manager_id', $currentUser->id)->get();
        } elseif ($currentUser->hasRole('spv')) {
            $managers = collect([$currentUser->manager])->filter();
            $supervisors = collect([$currentUser]);
        } else {
            $managers = User::role(['superadmin', 'manager'])->get();
            $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();
        }

        return Inertia::render('HAManagement/Edit', [
            'haUser' => $user,
            'managers' => $managers,
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * Update the specified HA user
     */
    public function update(Request $request, User $user)
    {
        // Ensure this is an HA user
        if (!$user->hasRole('ha')) {
            abort(404);
        }

        // dd($request->all(), $request->method(), $request->header('Content-Type'));

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'employee_id' => ['nullable', 'string', Rule::unique('users')->ignore($user)],
            'join_date' => 'nullable|date',
            'leave_date' => 'nullable|date|after:join_date',
            'is_active' => 'sometimes|boolean',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_profile_picture' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ]);

        $oldData = $user->toArray();

        // Handle profile picture removal
        if ($request->boolean('remove_profile_picture') && $user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $validated['profile_picture'] = null;
        }

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        // Update password only if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        unset($validated['remove_profile_picture']);

        $user->update($validated);

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'update',
            "Updated HA user: {$user->name}",
            'User',
            $user->id,
            ['before' => $oldData, 'after' => $user->fresh()->toArray()]
        );

        return redirect()->route('ha-management.index')
                        ->with('success', 'HA user updated successfully.');
    }

    /**
     * Remove/Deactivate the specified HA user
     */
    public function destroy(User $user)
    {
        // Ensure this is an HA user
        if (!$user->hasRole('ha')) {
            abort(404);
        }

        // Deactivate instead of delete
        $user->update([
            'is_active' => false,
            'leave_date' => now(),
        ]);

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'deactivate',
            "Deactivated HA user: {$user->name}",
            'User',
            $user->id
        );

        return redirect()->route('ha-management.index')
                        ->with('success', 'HA user deactivated successfully.');
    }

    /**
     * Reactivate HA user
     */
    public function reactivate(User $user)
    {
        // Ensure this is an HA user
        if (!$user->hasRole('ha')) {
            abort(404);
        }

        $user->update([
            'is_active' => true,
            'leave_date' => null,
        ]);

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'reactivate',
            "Reactivated HA user: {$user->name}",
            'User',
            $user->id
        );

        return back()->with('success', 'HA user reactivated successfully.');
    }
}
