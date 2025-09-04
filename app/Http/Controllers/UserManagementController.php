<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with(['roles', 'manager', 'spv'])
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when(request('role'), function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->latest()
            ->paginate(10)
            ->appends(request()->query());

        $roles = Role::all();
        $managers = User::role(['superadmin', 'manager'])->get();
        $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();

        return Inertia::render('UserManagement/Index', [
            'users' => $users,
            'roles' => $roles,
            'managers' => $managers,
            'supervisors' => $supervisors,
            'filters' => request()->only(['search', 'role'])
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $managers = User::role(['superadmin', 'manager'])->get();
        $supervisors = User::role(['superadmin', 'manager', 'spv'])->get();

        return Inertia::render('UserManagement/Create', [
            'roles' => $roles,
            'managers' => $managers,
            'supervisors' => $supervisors
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'hire_date' => 'required|date',
            'role' => 'required|exists:roles,name',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'hire_date' => $request->hire_date,
            'manager_id' => $request->manager_id,
            'spv_id' => $request->spv_id,
            'status' => $request->status,
        ]);

        $user->assignRole($request->role);

        return redirect()->route('user-management.index')
            ->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $user->load(['roles', 'manager', 'spv', 'assignedLeads', 'createdLeads']);

        return Inertia::render('UserManagement/Show', [
            'user' => $user
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();
        $managers = User::role(['superadmin', 'manager'])->where('id', '!=', $user->id)->get();
        $supervisors = User::role(['superadmin', 'manager', 'spv'])->where('id', '!=', $user->id)->get();

        return Inertia::render('UserManagement/Edit', [
            'user' => $user,
            'roles' => $roles,
            'managers' => $managers,
            'supervisors' => $supervisors
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'hire_date' => 'required|date',
            'role' => 'required|exists:roles,name',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive'
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'hire_date' => $request->hire_date,
            'manager_id' => $request->manager_id,
            'spv_id' => $request->spv_id,
            'status' => $request->status,
        ];

        if ($request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);
        $user->syncRoles([$request->role]);

        return redirect()->route('user-management.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Check if user has any leads assigned
        if ($user->assignedLeads()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete user with assigned leads. Please reassign leads first.');
        }

        $user->delete();

        return redirect()->route('user-management.index')
            ->with('success', 'User deleted successfully.');
    }

    public function getHAUsers()
    {
        $haUsers = User::role('ha')
            ->with(['manager', 'spv'])
            ->get();

        return response()->json($haUsers);
    }

    public function assignHA(Request $request)
    {
        $request->validate([
            'ha_id' => 'required|exists:users,id',
            'manager_id' => 'nullable|exists:users,id',
            'spv_id' => 'nullable|exists:users,id',
        ]);

        $haUser = User::findOrFail($request->ha_id);

        // Validate that the HA user has the 'ha' role
        if (!$haUser->hasRole('ha')) {
            return redirect()->back()
                ->with('error', 'Selected user is not an HA.');
        }

        $haUser->update([
            'manager_id' => $request->manager_id,
            'spv_id' => $request->spv_id,
        ]);

        return redirect()->back()
            ->with('success', 'HA assigned successfully.');
    }
}
