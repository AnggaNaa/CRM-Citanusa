<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        // Ensure only superadmin can access
        if (!$request->user()->hasRole('superadmin')) {
            abort(403, 'Unauthorized');
        }

        // Get current system settings
        $settings = [
            'app_name' => config('app.name'),
            'timezone' => config('app.timezone'),
            'leads_per_page' => 10, // Default pagination
            'enable_notifications' => true,
            'allow_lead_assignment' => true,
            'require_lead_approval' => false,
            'max_file_upload_size' => '10MB',
            'allowed_file_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
            'backup_frequency' => 'daily',
            'session_timeout' => '120', // minutes
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        // Ensure only superadmin can update
        if (!$request->user()->hasRole('superadmin')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'leads_per_page' => 'required|integer|min:5|max:100',
            'enable_notifications' => 'boolean',
            'allow_lead_assignment' => 'boolean',
            'require_lead_approval' => 'boolean',
            'max_file_upload_size' => 'required|string',
            'backup_frequency' => 'required|in:daily,weekly,monthly',
            'session_timeout' => 'required|integer|min:30|max:480',
        ]);

        // Here you would typically save to a settings table or config cache
        // For now, we'll just return a success message

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }

    public function userPermissions(Request $request): Response
    {
        // Ensure only superadmin can access
        if (!$request->user()->hasRole('superadmin')) {
            abort(403, 'Unauthorized');
        }

        $users = User::with(['roles', 'permissions'])->get();
        $permissions = Permission::all();

        return Inertia::render('Settings/UserPermissions', [
            'users' => $users,
            'permissions' => $permissions,
        ]);
    }

    public function updateUserPermissions(Request $request, User $user)
    {
        // Ensure only superadmin can update
        if (!$request->user()->hasRole('superadmin')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Sync permissions
        $user->syncPermissions($validated['permissions'] ?? []);

        return redirect()->back()->with('success', 'User permissions updated successfully!');
    }
}
