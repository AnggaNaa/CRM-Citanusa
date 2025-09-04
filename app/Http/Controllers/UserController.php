<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('permission:view_users')->only(['index', 'show']);
        $this->middleware('permission:create_users')->only(['create', 'store']);
        $this->middleware('permission:edit_users')->only(['edit', 'update']);
        $this->middleware('permission:delete_users')->only(['destroy']);
    }

    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'manager', 'spv'])
                    ->withCount('assignedLeads');

        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('employee_id', 'like', "%{$request->search}%")
                  ->orWhere('department', 'like', "%{$request->search}%")
                  ->orWhere('position', 'like', "%{$request->search}%");
            });
        }

        // Filter by status
        if ($request->status === 'active') {
            $query->active();
        } elseif ($request->status === 'inactive') {
            $query->inactive();
        }

        // Filter by role
        if ($request->role) {
            $query->role($request->role);
        }

        // Filter by department
        if ($request->department) {
            $query->where('department', $request->department);
        }

        // Get pagination size from request
        $perPage = $request->get('per_page', 25);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 25;
        }

        $users = $query->latest()->paginate($perPage);
        $users->appends($request->query());

        // Transform users data to include primary_role
        $usersArray = $users->toArray();
        $usersArray['data'] = collect($usersArray['data'])->map(function ($userData) {
            $user = User::find($userData['id']);
            $userData['primary_role'] = $user ? $user->primary_role : 'No Role';
            return $userData;
        })->toArray();

        return Inertia::render('Users/Index', [
            'users' => $usersArray,
            'filters' => $request->only(['search', 'status', 'role', 'department', 'per_page']),
            'roles' => Role::all(),
            'departments' => User::distinct()->pluck('department')->filter(),
            'perPageOptions' => $allowedPerPage,
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
            'managers' => User::role(['superadmin', 'manager'])->get(),
            'supervisors' => User::role(['superadmin', 'manager', 'spv'])->get(),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'employee_id' => 'nullable|string|unique:users',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'join_date' => 'nullable|date',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
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

        // Assign roles by IDs
        $roleIds = $validated['roles'];
        $user->assignRole(Role::whereIn('id', $roleIds)->pluck('name')->toArray());

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'create',
            "Created user: {$user->name}",
            'User',
            $user->id,
            ['user_data' => $user->toArray()]
        );

        return redirect()->route('users.index')
                        ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $user->load(['roles', 'manager', 'spv', 'assignedLeads', 'activityLogs' => function($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Users/Show', [
            'user' => $user,
            'recentActivities' => $user->activityLogs,
            'leadsCount' => $user->assignedLeads->count(),
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(),
            'managers' => User::role(['superadmin', 'manager'])->where('id', '!=', $user->id)->get(),
            'supervisors' => User::role(['superadmin', 'manager', 'spv'])->where('id', '!=', $user->id)->get(),
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'employee_id' => ['nullable', 'string', Rule::unique('users')->ignore($user)],
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'join_date' => 'nullable|date',
            'leave_date' => 'nullable|date|after:join_date',
            'is_active' => 'sometimes|boolean',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
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
            // Delete old profile picture
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

        // Remove roles from validated data as we handle it separately
        $roles = $validated['roles'];
        unset($validated['roles'], $validated['remove_profile_picture']);

        $user->update($validated);

        // Sync roles by IDs
        $roleNames = Role::whereIn('id', $roles)->pluck('name')->toArray();
        $user->syncRoles($roleNames);

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'update',
            "Updated user: {$user->name}",
            'User',
            $user->id,
            ['before' => $oldData, 'after' => $user->fresh()->toArray()]
        );

        return redirect()->route('users.index')
                        ->with('success', 'User updated successfully.');
    }

    /**
     * Remove/Deactivate the specified user
     */
    public function destroy(User $user)
    {
        // Don't allow deletion of superadmin or self
        if ($user->hasRole('superadmin') || $user->id === auth()->id()) {
            return back()->with('error', 'Cannot delete this user.');
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
            "Deactivated user: {$user->name}",
            'User',
            $user->id
        );

        return redirect()->route('users.index')
                        ->with('success', 'User deactivated successfully.');
    }

    /**
     * Reactivate user
     */
    public function reactivate(User $user)
    {
        $user->update([
            'is_active' => true,
            'leave_date' => null,
        ]);

        // Log activity
        ActivityLog::logActivity(
            auth()->user(),
            'reactivate',
            "Reactivated user: {$user->name}",
            'User',
            $user->id
        );

        return back()->with('success', 'User reactivated successfully.');
    }

    /**
     * Show user profile
     */
    public function profile()
    {
        $user = auth()->user();
        $user->load(['roles', 'manager', 'spv']);

        return Inertia::render('Users/Profile', [
            'user' => $user,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        // Debug: Log the incoming request data
        Log::info('Profile Update Request Data:', [
            'data' => $request->all(),
            'files' => $request->allFiles(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type')
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'phone' => 'nullable|string|max:20',
            'employee_id' => ['nullable', 'string', Rule::unique('users')->ignore($user)],
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
            // Delete old profile picture
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        // Remove unnecessary fields
        unset($validated['remove_profile_picture']);

        $user->update($validated);

        // Log activity
        ActivityLog::logActivity(
            $user,
            'update_profile',
            "Updated own profile",
            'User',
            $user->id,
            ['before' => $oldData, 'after' => $user->fresh()->toArray()]
        );

        Log::info('Profile Updated Successfully:', ['user_id' => $user->id]);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Show user security settings
     */
    public function security()
    {
        $user = auth()->user();

        return Inertia::render('Users/Security', [
            'user' => $user,
            'recentLogins' => $user->loginHistories()->latest()->limit(10)->get(),
            'recentActivities' => $user->activityLogs()->latest()->limit(20)->get(),
        ]);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Log activity
        ActivityLog::logActivity(
            $user,
            'change_password',
            "Changed password",
            'User',
            $user->id
        );

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Show activity logs
     */
    public function activityLogs(Request $request, User $user = null)
    {
        $query = ActivityLog::with('user');

        if ($user) {
            $query->where('user_id', $user->id);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->model) {
            $query->where('model', $request->model);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 25);
        $logs = $query->latest()->paginate($perPage);

        return Inertia::render('Users/ActivityLogs', [
            'logs' => $logs,
            'user' => $user,
            'filters' => $request->only(['action', 'model', 'date_from', 'date_to', 'per_page']),
            'actions' => ActivityLog::distinct()->pluck('action'),
            'models' => ActivityLog::distinct()->pluck('model')->filter(),
        ]);
    }

    /**
     * Show login history
     */
    public function loginHistory(Request $request, User $user = null)
    {
        $query = LoginHistory::with('user');

        if ($user) {
            $query->where('user_id', $user->id);
        }

        if ($request->status === 'successful') {
            $query->successful();
        } elseif ($request->status === 'failed') {
            $query->failed();
        }

        if ($request->date_from) {
            $query->whereDate('login_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('login_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 25);
        $histories = $query->latest('login_at')->paginate($perPage);

        return Inertia::render('Users/LoginHistory', [
            'histories' => $histories,
            'user' => $user,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'per_page']),
        ]);
    }
}
