<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardAnalyticsController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProjectUnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\HAManagementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return redirect('/login');
});

Route::middleware(['auth', 'web'])->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/analytics', [DashboardAnalyticsController::class, 'index'])->name('dashboard.analytics');
    Route::post('/dashboard/export', [DashboardAnalyticsController::class, 'exportReport'])->name('dashboard.export');

    // Leads routes
    Route::resource('leads', LeadController::class);
    Route::patch('/leads/{lead}/quick-update', [LeadController::class, 'quickUpdate'])->name('leads.quick-update');
    Route::post('/leads/{lead}/attachments', [LeadController::class, 'uploadAttachment'])->name('leads.attachments.store');
    Route::delete('/leads/{lead}/attachments/{attachment}', [LeadController::class, 'deleteAttachment'])->name('leads.attachments.destroy');
    Route::get('/api/leads/units', [LeadController::class, 'getUnits'])->name('api.leads.units');
    Route::get('/api/leads/unit-types-by-project', [LeadController::class, 'getUnitTypesByProject'])->name('api.leads.unit-types-by-project');
    Route::get('/api/leads/statuses-by-priority', [LeadController::class, 'getStatusesByPriorityAPI'])->name('api.leads.statuses-by-priority');

    // Lead filtering and search
    Route::get('/leads/by-priority/{priority}', [LeadController::class, 'byPriority'])->name('leads.by-priority');
    Route::get('/leads/by-ha/{ha}', [LeadController::class, 'byHA'])->name('leads.by-ha');
    Route::get('/leads/search', [LeadController::class, 'search'])->name('leads.search');

    // Project Units routes
    Route::resource('project-units', ProjectUnitController::class);
    Route::get('/api/projects', [ProjectUnitController::class, 'getProjects'])->name('api.projects');
    Route::get('/api/unit-types', [ProjectUnitController::class, 'getUnitTypes'])->name('api.unit-types');
    Route::get('/api/units/{project?}/{unitType?}', [ProjectUnitController::class, 'getUnits'])->name('api.units');

    // User management routes (comprehensive)
    Route::resource('users', UserController::class);
    Route::patch('/users/{user}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate');

    // Profile & Security Management
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');
    Route::patch('/profile', [UserController::class, 'updateProfile'])->name('profile.update');
    Route::get('/security', [UserController::class, 'security'])->name('security');
    Route::patch('/security/password', [UserController::class, 'updatePassword'])->name('security.password');

    // Activity Logs & Login History
    Route::get('/activity-logs/{user?}', [UserController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/login-history/{user?}', [UserController::class, 'loginHistory'])->name('login-history');

    // HA Management routes (for users with create_users permission to manage HA only)
    Route::middleware('permission:create_users')->group(function () {
        Route::get('/ha-management', [HAManagementController::class, 'index'])->name('ha-management.index');
        Route::get('/ha-management/create', [HAManagementController::class, 'create'])->name('ha-management.create');
        Route::post('/ha-management', [HAManagementController::class, 'store'])->name('ha-management.store');
        Route::get('/ha-management/{user}', [HAManagementController::class, 'show'])->name('ha-management.show');
        Route::get('/ha-management/{user}/edit', [HAManagementController::class, 'edit'])->name('ha-management.edit');
        Route::patch('/ha-management/{user}', [HAManagementController::class, 'update'])->name('ha-management.update');
        Route::delete('/ha-management/{user}', [HAManagementController::class, 'destroy'])->name('ha-management.destroy');
        Route::patch('/ha-management/{user}/reactivate', [HAManagementController::class, 'reactivate'])->name('ha-management.reactivate');
    });

    // Legacy user management routes (keep for backwards compatibility)
    Route::resource('user-management', UserManagementController::class)->middleware('permission:view_users');
    Route::get('/user-management/create', [UserManagementController::class, 'create'])->middleware('permission:create_users')->name('user-management.create');
    Route::post('/user-management', [UserManagementController::class, 'store'])->middleware('permission:create_users');
    Route::get('/api/ha-users', [UserManagementController::class, 'getHAUsers'])->name('api.ha-users');
    Route::post('/user-management/assign-ha', [UserManagementController::class, 'assignHA'])->name('user-management.assign-ha');

    // Reports routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports');
    Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');

    // Settings routes (superadmin and director only)
    Route::middleware('role:superadmin|director')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
        Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('/settings/user-permissions', [SettingsController::class, 'userPermissions'])->name('settings.user-permissions');
        Route::patch('/users/{user}/permissions', [SettingsController::class, 'updateUserPermissions'])->name('users.permissions.update');
    });

    // Settings and profile routes (removed as moved to UserController)
    // Route::get('/profile', function () {
    //     return inertia('Profile/Show');
    // })->name('profile');

    // Route::put('/profile', function () {
    //     // Profile update logic
    // })->name('profile.update');
});

require __DIR__.'/auth.php';
