# Navigation & Permission System Update Documentation

## Summary of Changes Made

### 1. ✅ **Navigation System Changed to Permission-Based**

**Previous System**: Role-based navigation (roles: ['superadmin', 'manager', 'spv', 'ha'])

**New System**: Permission-based navigation with role fallbacks

```tsx
// New Navigation Structure
const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        permission: null // Available to all users by default
    },
    {
        name: 'Leads Management',
        href: '/leads',
        icon: ClipboardDocumentListIcon,
        permission: 'view_leads' // Only users with view_leads permission
    },
    {
        name: 'User Management',
        href: '/users',
        icon: UserGroupIcon,
        roles: ['superadmin', 'director'], // Only superadmin and director
        permission: null
    },
    {
        name: 'HA Management',
        href: '/ha-management',
        icon: UsersIcon,
        permission: 'create_users' // Users with create_users permission
    },
    {
        name: 'Reports & Analytics',
        href: '/reports',
        icon: DocumentChartBarIcon,
        permission: 'view_reports'
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Cog6ToothIcon,
        roles: ['superadmin', 'director'],
        permission: null
    },
];
```

**Navigation Filter Logic**:
```tsx
// Superadmin and Director can see everything
if (userRole === 'superadmin' || userRole === 'director') {
    return true;
}

// Dashboard is available to everyone
if (item.name === 'Dashboard') {
    return true;
}

// Check role-based access for specific items
if (item.roles && item.roles.length > 0) {
    const hasRoleAccess = item.roles.includes(userRole);
    if (!hasRoleAccess) {
        return false;
    }
}

// Check permission-based access
if (item.permission) {
    const userPermissions = currentUser?.permissions || [];
    const rolePermissions = currentUser?.role_permissions || [];
    const allPermissions = [...userPermissions, ...rolePermissions];

    const hasPermission = allPermissions.some(permission =>
        permission.name === item.permission || permission === item.permission
    );

    return hasPermission;
}
```

### 2. ✅ **Added DIRECTOR Role**

**New Role Created**: `director`
- **Permissions**: All permissions (same as superadmin)
- **Access Level**: Full system access
- **Navigation**: Can see all menus including User Management and Settings

**Role Hierarchy** (from highest to lowest):
1. **superadmin** - Full system access + user management
2. **director** - Full system access + user management  
3. **manager** - Lead management + reports + HA management (if given permission)
4. **spv** - Lead management + reports + HA management (if given permission)
5. **ha** - Basic lead viewing only

### 3. ✅ **Separated User Management vs HA Management**

#### **User Management** (`/users`)
- **Access**: Only `superadmin` and `director` roles
- **Purpose**: Full user management for all roles
- **Features**: Create, edit, delete users of any role
- **Scope**: Complete user administration

#### **HA Management** (`/ha-management`)  
- **Access**: Users with `create_users` permission
- **Purpose**: Limited to managing HA (Housing Advisor) users only
- **Features**: Create, edit, deactivate HA users only
- **Scope**: HA-specific user management

**Key Differences**:
```php
// User Management - Full Access
Route::resource('users', UserController::class)->middleware('permission:view_users');

// HA Management - Limited to HA users only  
Route::middleware('permission:create_users')->group(function () {
    Route::get('/ha-management', [HAManagementController::class, 'index']);
    Route::get('/ha-management/create', [HAManagementController::class, 'create']);
    // ... other HA-specific routes
});
```

### 4. ✅ **HA Management Features**

#### **HAManagementController.php**
- **Scope**: Only HA role users
- **Hierarchy Filtering**: Based on current user's role
  - Manager: Can only see HA under their management
  - SPV: Can only see HA under their supervision  
  - Superadmin/Director: Can see all HA users

#### **HA Management Pages**:
1. **Index Page** (`/ha-management`):
   - Lists only HA users
   - Search and filter functionality
   - Statistics cards (Total HA, Active HA, Inactive HA)
   - Lead count per HA
   - Hierarchy information (Manager/SPV assignments)

2. **Create Page** (`/ha-management/create`):
   - Form specifically for creating HA users
   - Automatic HA role assignment
   - Manager/SPV assignment based on current user's hierarchy
   - Simplified form focused on HA needs

### 5. ✅ **Permission System Enhancement**

#### **Permission-Based Menu Display**:
- **Leads Management**: Requires `view_leads` permission
- **HA Management**: Requires `create_users` permission  
- **Reports & Analytics**: Requires `view_reports` permission
- **User Management**: Role-based (superadmin, director only)
- **Settings**: Role-based (superadmin, director only)

#### **Route Protection**:
```php
// Permission-based protection
Route::middleware('permission:create_users')->group(function () {
    // HA Management routes
});

// Role-based protection  
Route::middleware('role:superadmin|director')->group(function () {
    // Settings routes
});
```

## Role & Permission Matrix

| Role | Dashboard | Leads Mgmt | User Mgmt | HA Mgmt | Reports | Settings |
|------|-----------|------------|-----------|---------|---------|----------|
| **superadmin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **director** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **manager** | ✅ | ✅ | ❌ | ✅* | ✅ | ❌ |
| **spv** | ✅ | ✅ | ❌ | ✅* | ✅ | ❌ |
| **ha** | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Legend*:
- ✅ = Full access
- ✅* = Access if has required permission  
- ❌ = No access

## Files Modified

### Backend Files:
1. `routes/web.php` - Added HA Management routes
2. `app/Http/Controllers/HAManagementController.php` - New controller (already created by user)

### Frontend Files:
1. `resources/js/Layouts/AuthenticatedLayout.tsx` - Updated navigation system
2. `resources/js/Pages/HAManagement/Index.tsx` - New HA listing page
3. `resources/js/Pages/HAManagement/Create.tsx` - New HA creation page

### Database:
1. Added `director` role with all permissions via Artisan Tinker

## Usage Examples

### Example 1: Manager with create_users permission
```
Login as Manager → See menu:
- Dashboard ✅
- Leads Management ✅ (has view_leads via role)  
- HA Management ✅ (has create_users permission)
- Reports & Analytics ✅ (has view_reports via role)
```

### Example 2: SPV with create_users permission  
```
Login as SPV → See menu:
- Dashboard ✅
- Leads Management ✅ (has view_leads via role)
- HA Management ✅ (has create_users permission) 
- Reports & Analytics ✅ (has view_reports via role)
```

### Example 3: Regular HA user
```
Login as HA → See menu:
- Dashboard ✅ (available to all)
- Leads Management ✅ (has view_leads via role, but limited scope)
```

## Testing Checklist

### ✅ Navigation Testing:
1. Login as superadmin → Should see all menus
2. Login as director → Should see all menus  
3. Login as manager with create_users → Should see HA Management
4. Login as spv with create_users → Should see HA Management
5. Login as regular manager → Should NOT see HA Management or User Management
6. Login as HA → Should only see Dashboard and Leads Management

### ✅ HA Management Testing:
1. Access `/ha-management` → Should show HA users list
2. Click "Create New HA" → Should show creation form
3. Create new HA → Should only create with HA role
4. Manager should only see HA under their management
5. SPV should only see HA under their supervision

### ✅ Permission System Testing:
1. Grant `create_users` to manager → Should show HA Management menu
2. Remove `create_users` from manager → Should hide HA Management menu
3. Verify route protection works correctly

## Benefits of New System

1. **Granular Control**: Permission-based navigation allows fine-grained access control
2. **Role Separation**: Clear distinction between full user management and HA-specific management
3. **Scalability**: Easy to add new permissions and navigation items
4. **Security**: Both menu visibility and route access are properly protected
5. **User Experience**: Users only see relevant menus for their role/permissions
6. **Hierarchy Respect**: HA management respects organizational hierarchy

**Status: All changes implemented and ready for testing ✅**
