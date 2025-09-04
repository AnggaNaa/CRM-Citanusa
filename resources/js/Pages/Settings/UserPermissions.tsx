import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ShieldCheckIcon,
    UsersIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<{ name: string }>;
    permissions: Array<{ name: string }>;
}

interface UserPermissionsProps {
    auth: any;
    users: User[];
    permissions: Array<{ name: string }>;
}

export default function UserPermissions({ auth, users, permissions }: UserPermissionsProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const { data, setData, patch, processing } = useForm({
        user_id: 0,
        permissions: [] as string[],
    });

    const handleEditPermissions = (user: User) => {
        setSelectedUser(user);
        setData({
            user_id: user.id,
            permissions: user.permissions.map(p => p.name),
        });
        setShowPermissionModal(true);
    };

    const handleUpdatePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/users/${data.user_id}/permissions`, {
            onSuccess: () => {
                setShowPermissionModal(false);
                setSelectedUser(null);
            },
        });
    };

    const togglePermission = (permissionName: string) => {
        const newPermissions = data.permissions.includes(permissionName)
            ? data.permissions.filter(p => p !== permissionName)
            : [...data.permissions, permissionName];
        setData('permissions', newPermissions);
    };

    const canCreateUsers = (user: User) => {
        return user.permissions.some(p => p.name === 'create_users') ||
               user.roles.some(r => r.name === 'superadmin');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="User Permissions"
        >
            <Head title="User Permissions - NUSA CRM" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
                                    <p className="text-gray-600 mt-1">Manage individual user permissions beyond their role permissions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">
                                About User Permissions vs User Management
                            </h3>
                            <div className="mt-1 text-sm text-blue-700">
                                <p className="mb-2">
                                    <strong>User Management:</strong> Mengatur role dasar user (superadmin, manager, spv, ha) yang menentukan menu dan fitur utama yang bisa diakses.
                                </p>
                                <p>
                                    <strong>User Permissions:</strong> Memberikan permission khusus kepada user tertentu, misalnya member SPV bisa diberi permission 'create_users' untuk bisa menambah HA baru tanpa mengubah role dasarnya.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Users & Permissions
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Can Create Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Permissions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.roles[0]?.name?.toUpperCase() || 'No Role'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {canCreateUsers(user) ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircleIcon className="h-5 w-5 text-red-600" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.permissions.length} permission(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditPermissions(user)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                            >
                                                <PencilIcon className="h-4 w-4 mr-1" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Permission Modal */}
                {showPermissionModal && selectedUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleUpdatePermissions}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Edit Permissions for {selectedUser.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Select the permissions you want to grant to this user.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {permissions.map((permission) => (
                                                <div key={permission.name} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.permissions.includes(permission.name)}
                                                        onChange={() => togglePermission(permission.name)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label className="ml-2 block text-sm text-gray-900">
                                                        {permission.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPermissionModal(false)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
