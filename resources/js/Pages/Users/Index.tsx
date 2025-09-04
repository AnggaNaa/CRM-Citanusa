import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    UserIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
    department?: string;
    position?: string;
    join_date?: string;
    leave_date?: string;
    is_active: boolean;
    profile_picture?: string;
    last_login_at?: string;
    roles: { name: string }[];
    assigned_leads_count: number;
    primary_role: string;
}

interface Props extends PageProps {
    users: {
        data: User[];
        meta: any;
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
        role?: string;
        department?: string;
        per_page?: number;
    };
    roles: { id: number; name: string }[];
    departments: string[];
    perPageOptions: number[];
}

export default function Index({ auth, users, filters, roles, departments, perPageOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [role, setRole] = useState(filters.role || '');
    const [department, setDepartment] = useState(filters.department || '');
    const [perPage, setPerPage] = useState(filters.per_page || 25);
    const [showFilters, setShowFilters] = useState(false);
    console.log("users", users);

    const handleFilter = () => {
        router.get(route('users.index'), {
            search: search || undefined,
            status: status || undefined,
            role: role || undefined,
            department: department || undefined,
            per_page: perPage || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(route('users.index'), {
            search: search || undefined,
            status: status || undefined,
            role: role || undefined,
            department: department || undefined,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setRole('');
        setDepartment('');
        router.get(route('users.index'));
    };

    const handleDeactivate = (user: User) => {
        if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const handleReactivate = (user: User) => {
        if (confirm(`Are you sure you want to reactivate ${user.name}?`)) {
            router.patch(route('users.reactivate', user.id));
        }
    };

    const getRoleColor = (role: string) => {
        const colors: { [key: string]: string } = {
            'superadmin': 'bg-purple-100 text-purple-800',
            'manager': 'bg-blue-100 text-blue-800',
            'spv': 'bg-green-100 text-green-800',
            'ha': 'bg-yellow-100 text-yellow-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={"User Management"}
        >
            <Head title="User Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600">Manage system users and their permissions</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <UserIcon className="h-4 w-4 mr-2" />
                                Filters
                            </button>
                            <Link
                                href={route('users.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add New User
                            </Link>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <input
                                        id="search"
                                        value={search}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                        placeholder="Name, email, employee ID..."
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Roles</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div> */}
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Clear Filters
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFilter}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show:</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                            >
                                {perPageOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <span className="text-sm text-gray-700 hidden sm:inline">entries</span>
                        </div>
                        <div className="text-sm text-gray-700 sm:text-right">
                            {users.meta ? (
                                `Showing ${users.meta.from || 0} to ${users.meta.to || 0} of ${users.meta.total || 0} results`
                            ) : (
                                `Showing ${users.data.length} users`
                            )}
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Users ({users.meta?.total || users.data.length})
                            </h2>
                        </div>

                        {users.data.length > 0 ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Leads
                                                </th> */}
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Login
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.data.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {user.profile_picture ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={`/storage/${user.profile_picture}`}
                                                                        alt={user.name}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                        <UserIcon className="h-6 w-6 text-gray-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {user.email}
                                                                </div>
                                                                {user.employee_id && (
                                                                    <div className="text-xs text-gray-400">
                                                                        ID: {user.employee_id}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.primary_role)}`}>
                                                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                                                {user.primary_role}
                                                            </span>
                                                            {user.department && (
                                                                <div className="flex items-center text-xs text-gray-500">
                                                                    <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                                                    {user.department}
                                                                </div>
                                                            )}
                                                            {user.position && (
                                                                <div className="text-xs text-gray-400">
                                                                    {user.position}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center">
                                                                {user.is_active ? (
                                                                    <>
                                                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                                                        <span className="text-sm text-green-600">Active</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                                                                        <span className="text-sm text-red-600">Inactive</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {user.join_date && (
                                                                <div className="text-xs text-gray-400">
                                                                    Joined: {new Date(user.join_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {/* <td className="px-4 py-4 text-sm text-gray-900">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {user.assigned_leads_count} leads
                                                        </span>
                                                    </td> */}
                                                    <td className="px-4 py-4">
                                                        {user.last_login_at ? (
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                                {new Date(user.last_login_at).toLocaleDateString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Never</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Link
                                                                href={route('users.show', user.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('users.edit', user.id)}
                                                                className="text-yellow-600 hover:text-yellow-900"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </Link>
                                                            {user.is_active ? (
                                                                <button
                                                                    onClick={() => handleDeactivate(user)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleReactivate(user)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    <CheckCircleIcon className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden">
                                    <div className="space-y-4 p-4">
                                        {users.data.map((user) => (
                                            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-12 w-12 flex-shrink-0">
                                                            {user.profile_picture ? (
                                                                <img
                                                                    className="h-12 w-12 rounded-full object-cover"
                                                                    src={`/storage/${user.profile_picture}`}
                                                                    alt={user.name}
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <UserIcon className="h-6 w-6 text-gray-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.primary_role)}`}>
                                                                    {user.primary_role}
                                                                </span>
                                                                {user.is_active ? (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('users.show', user.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('users.edit', user.id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Department:</span>
                                                        <p className="font-medium">{user.department || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Leads:</span>
                                                        <p className="font-medium">{user.assigned_leads_count}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination */}
                                {users.data.length > 0 && users.links && (
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                        {/* Mobile Pagination */}
                                        <div className="flex items-center justify-between sm:hidden">
                                            <div className="text-sm text-gray-700">
                                                Page {users.meta?.current_page || 1} of {users.meta?.last_page || 1}
                                            </div>
                                            <div className="flex space-x-2">
                                                {users.links.find((link: any) => link.label === '&laquo; Previous') && (
                                                    <button
                                                        onClick={() => {
                                                            const prevLink = users.links.find((link: any) => link.label === '&laquo; Previous');
                                                            if (prevLink?.url) {
                                                                router.visit(prevLink.url);
                                                            }
                                                        }}
                                                        disabled={!users.links.find((link: any) => link.label === '&laquo; Previous')?.url}
                                                        className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                                                            !users.links.find((link: any) => link.label === '&laquo; Previous')?.url
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        }`}
                                                    >
                                                        Prev
                                                    </button>
                                                )}
                                                {users.links.find((link: any) => link.label === 'Next &raquo;') && (
                                                    <button
                                                        onClick={() => {
                                                            const nextLink = users.links.find((link: any) => link.label === 'Next &raquo;');
                                                            if (nextLink?.url) {
                                                                router.visit(nextLink.url);
                                                            }
                                                        }}
                                                        disabled={!users.links.find((link: any) => link.label === 'Next &raquo;')?.url}
                                                        className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                                                            !users.links.find((link: any) => link.label === 'Next &raquo;')?.url
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        }`}
                                                    >
                                                        Next
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop Pagination */}
                                        <div className="hidden sm:flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                {users.meta ? (
                                                    `Showing ${users.meta.from || 0} to ${users.meta.to || 0} of ${users.meta.total || 0} results`
                                                ) : (
                                                    `Showing ${users.data.length} users`
                                                )}
                                            </div>
                                            <div className="flex space-x-1">
                                                {users.links.map((link: any, index: number) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (link.url) {
                                                                router.visit(link.url);
                                                            }
                                                        }}
                                                        disabled={!link.url}
                                                        className={`
                                                            px-3 py-1 text-sm rounded-lg transition-colors duration-200
                                                            ${link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : link.url
                                                                    ? 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                                    : 'text-gray-400 cursor-not-allowed'
                                                            }
                                                        `}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <UserIcon className="h-12 w-12" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
                                <div className="mt-6">
                                    <Link
                                        href={route('users.create')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add New User
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
