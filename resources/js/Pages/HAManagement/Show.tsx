import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    CalendarIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

interface HAUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
    join_date?: string;
    is_active: boolean;
    created_at: string;
    notes?: string;
    profile_picture?: string;
    manager?: {
        id: number;
        name: string;
    };
    spv?: {
        id: number;
        name: string;
    };
}

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    created_at: string;
}

interface Props extends PageProps {
    haUser: HAUser;
    recentActivities: ActivityLog[];
    leadsCount: number;
}

export default function Show({ auth, haUser, recentActivities, leadsCount }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="HA Details">
            <Head title={`HA Details - ${haUser.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white shadow rounded-lg p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('ha-management.index')}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to HA Management
                            </Link>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{haUser.name}</h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Housing Advisor Details
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('ha-management.edit', haUser.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit HA
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Assigned Leads
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {leadsCount}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        haUser.is_active ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                        <div className={`h-3 w-3 rounded-full ${
                                            haUser.is_active ? 'bg-green-600' : 'bg-red-600'
                                        }`}></div>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Status
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {haUser.is_active ? 'Active' : 'Inactive'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CalendarIcon className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Joined
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {haUser.join_date ? formatDate(haUser.join_date) : formatDate(haUser.created_at)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HA Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                                Personal Information
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <dl className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        Full Name
                                    </dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">{haUser.name}</dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        Email
                                    </dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.email || '-'}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <PhoneIcon className="h-4 w-4 mr-2" />
                                        Phone
                                    </dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.phone || '-'}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <IdentificationIcon className="h-4 w-4 mr-2" />
                                        Employee ID
                                    </dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.employee_id || '-'}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        Join Date
                                    </dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.join_date ? formatDate(haUser.join_date) : '-'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Hierarchy Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
                                Hierarchy
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <dl className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Manager</dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.manager ? haUser.manager.name : 'Not assigned'}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Supervisor</dt>
                                    <dd className="mt-1 sm:mt-0 text-sm text-gray-900 sm:text-right">
                                        {haUser.spv ? haUser.spv.name : 'Not assigned'}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                    <dd className="mt-1 sm:mt-0">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Housing Advisor
                                        </span>
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 sm:mt-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            haUser.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {haUser.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {haUser.notes && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Notes</h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{haUser.notes}</p>
                        </div>
                    </div>
                )}

                {/* Recent Activities */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activities</h3>
                        <p className="mt-1 text-sm text-gray-500">Latest activities for this HA user</p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {recentActivities && recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500">{formatDateTime(activity.created_at)}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {activity.action}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No recent activities found.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
