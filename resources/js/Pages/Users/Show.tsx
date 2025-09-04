import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    UserIcon,
    ArrowLeftIcon,
    PencilIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    CalendarDaysIcon,
    ShieldCheckIcon,
    ClockIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

interface Role {
    id: number;
    name: string;
    display_name?: string;
}

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
    notes?: string;
    created_at: string;
    updated_at: string;
    roles: Role[];
    assigned_leads_count: number;
    primary_role: string;
}

interface Props extends PageProps {
    user: User;
}

export default function Show({ auth, user }: Props) {
    const getRoleColor = (role: string) => {
        const colors: { [key: string]: string } = {
            'superadmin': 'bg-purple-100 text-purple-800',
            'manager': 'bg-blue-100 text-blue-800',
            'spv': 'bg-green-100 text-green-800',
            'ha': 'bg-yellow-100 text-yellow-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={`User Profile - ${user.name}`}
        >
            <Head title={`User Profile - ${user.name}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {user.profile_picture ? (
                                            <img
                                                className="h-16 w-16 rounded-full object-cover"
                                                src={`/storage/${user.profile_picture}`}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getRoleColor(user?.primary_role)}`}>
                                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                                {user?.primary_role}
                                            </span>
                                            {user.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircleIcon className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href={route('users.edit', user.id)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Edit User
                                    </Link>
                                    <Link
                                        href={route('users.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Back to Users
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-3">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium text-gray-900">{user.email}</div>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-center space-x-3">
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Phone</div>
                                            <div className="font-medium text-gray-900">{user.phone}</div>
                                        </div>
                                    </div>
                                )}

                                {user.employee_id && (
                                    <div className="flex items-center space-x-3">
                                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Employee ID</div>
                                            <div className="font-medium text-gray-900">{user.employee_id}</div>
                                        </div>
                                    </div>
                                )}

                                {user.last_login_at && (
                                    <div className="flex items-center space-x-3">
                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Last Login</div>
                                            <div className="font-medium text-gray-900">{formatDateTime(user.last_login_at)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user.department && (
                                    <div className="flex items-center space-x-3">
                                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Department</div>
                                            <div className="font-medium text-gray-900">{user.department}</div>
                                        </div>
                                    </div>
                                )}

                                {user.position && (
                                    <div className="flex items-center space-x-3">
                                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Position</div>
                                            <div className="font-medium text-gray-900">{user.position}</div>
                                        </div>
                                    </div>
                                )}

                                {user.join_date && (
                                    <div className="flex items-center space-x-3">
                                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Join Date</div>
                                            <div className="font-medium text-gray-900">{formatDate(user.join_date)}</div>
                                        </div>
                                    </div>
                                )}

                                {user.leave_date && (
                                    <div className="flex items-center space-x-3">
                                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Leave Date</div>
                                            <div className="font-medium text-gray-900">{formatDate(user.leave_date)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Roles & Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Roles */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles & Permissions</h2>
                                <div className="space-y-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role.name)}`}
                                        >
                                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                            {role.display_name || role.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Assigned Leads</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.assigned_leads_count} leads
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Account Created</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDate(user.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Last Updated</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDate(user.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {user.notes && (
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{user.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={route('activity-logs', user.id)}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <ClockIcon className="h-4 w-4 mr-2" />
                                    View Activity Log
                                </Link>
                                <Link
                                    href={route('login-history', user.id)}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <ClockIcon className="h-4 w-4 mr-2" />
                                    Login History
                                </Link>
                                <button
                                    onClick={() => window.location.href = `mailto:${user.email}`}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                                    Send Email
                                </button>
                                {user.phone && (
                                    <button
                                        onClick={() => window.location.href = `tel:${user.phone}`}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <PhoneIcon className="h-4 w-4 mr-2" />
                                        Call
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
