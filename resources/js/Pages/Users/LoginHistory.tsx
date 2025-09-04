import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    ArrowLeftIcon,
    ClockIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    DeviceTabletIcon,
    GlobeAltIcon,
    MapPinIcon,
    FunnelIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface LoginHistory {
    id: number;
    ip_address: string;
    user_agent: string;
    device_type: string;
    device_name?: string;
    browser_name?: string;
    browser_version?: string;
    platform?: string;
    location?: string;
    is_successful: boolean;
    failure_reason?: string;
    session_duration?: number;
    login_at: string;
    logout_at?: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props extends PageProps {
    user?: User;
    loginHistory: {
        data: LoginHistory[];
        meta: any;
        links: any[];
    };
    filters: {
        is_successful?: string;
        device_type?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    deviceTypes: string[];
    perPageOptions: number[];
}

export default function LoginHistory({ auth, user, loginHistory, filters, deviceTypes, perPageOptions }: Props) {
    const [isSuccessful, setIsSuccessful] = useState(filters.is_successful || '');
    const [deviceType, setDeviceType] = useState(filters.device_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || 25);
    const [showFilters, setShowFilters] = useState(false);

    const handleFilter = () => {
        const routeName = user ? 'users.login-history' : 'login-history.index';
        const routeParams = user ? [user.id] : [];

        router.get(route(routeName, ...routeParams), {
            is_successful: isSuccessful || undefined,
            device_type: deviceType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            per_page: perPage || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        const routeName = user ? 'users.login-history' : 'login-history.index';
        const routeParams = user ? [user.id] : [];

        router.get(route(routeName, ...routeParams), {
            is_successful: isSuccessful || undefined,
            device_type: deviceType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setIsSuccessful('');
        setDeviceType('');
        setDateFrom('');
        setDateTo('');
        const routeName = user ? 'users.login-history' : 'login-history.index';
        const routeParams = user ? [user.id] : [];
        router.get(route(routeName, ...routeParams));
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />;
            case 'tablet':
                return <DeviceTabletIcon className="h-5 w-5 text-gray-400" />;
            default:
                return <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={"Login History"}
        >
            <Head title={user ? `Login History - ${user.name}` : 'Login History'} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user ? `Login History - ${user.name}` : 'Login History'}
                            </h1>
                            <p className="text-gray-600">
                                {user ? 'View user login sessions and security events' : 'System-wide login sessions and security events'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                Filters
                            </button>
                            {user && (
                                <Link
                                    href={route('users.show', user.id)}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    Back to Profile
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="is_successful" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="is_successful"
                                        value={isSuccessful}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIsSuccessful(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Logins</option>
                                        <option value="1">Successful</option>
                                        <option value="0">Failed</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Device Type
                                    </label>
                                    <select
                                        id="device_type"
                                        value={deviceType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeviceType(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Devices</option>
                                        {deviceTypes?.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        id="date_to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
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
                                {perPageOptions?.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <span className="text-sm text-gray-700 hidden sm:inline">entries</span>
                        </div>
                        <div className="text-sm text-gray-700 sm:text-right">
                            {loginHistory?.meta ? (
                                `Showing ${loginHistory.meta.from || 0} to ${loginHistory.meta.to || 0} of ${loginHistory.meta.total || 0} results`
                            ) : (
                                `Showing ${loginHistory?.data.length} sessions`
                            )}
                        </div>
                    </div>

                    {/* Login History */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Login Sessions ({loginHistory?.meta?.total || loginHistory?.data.length})
                            </h2>
                        </div>

                        {loginHistory?.data.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {loginHistory?.data.map((session) => (
                                    <div key={session.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 pt-1">
                                                    {getDeviceIcon(session.device_type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            {session.is_successful ? (
                                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className={`text-sm font-medium ${session.is_successful ? 'text-green-600' : 'text-red-600'}`}>
                                                                {session.is_successful ? 'Successful Login' : 'Failed Login'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <ClockIcon className="h-4 w-4 mr-1" />
                                                            {formatDateTime(session.login_at)}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 space-y-1">
                                                        {session.device_name && (
                                                            <div className="text-sm text-gray-900">
                                                                Device: {session.device_name}
                                                            </div>
                                                        )}
                                                        {session.browser_name && (
                                                            <div className="text-sm text-gray-600">
                                                                <GlobeAltIcon className="inline h-3 w-3 mr-1" />
                                                                {session.browser_name} {session.browser_version}
                                                                {session.platform && ` on ${session.platform}`}
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-gray-600">
                                                            <ComputerDesktopIcon className="inline h-3 w-3 mr-1" />
                                                            {session.ip_address}
                                                            {session.location && (
                                                                <span className="ml-2">
                                                                    <MapPinIcon className="inline h-3 w-3 mr-1" />
                                                                    {session.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!session.is_successful && session.failure_reason && (
                                                            <div className="text-sm text-red-600">
                                                                Reason: {session.failure_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 text-right">
                                                {session.is_successful && (
                                                    <div className="text-sm text-gray-500">
                                                        {session.logout_at ? (
                                                            <div>
                                                                <div>Logged out: {formatDateTime(session.logout_at)}</div>
                                                                {session.session_duration && (
                                                                    <div className="text-xs">
                                                                        Duration: {formatDuration(session.session_duration)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Active Session
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No login history found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {user ? 'This user has no recorded login sessions.' : 'No login sessions match the current filters.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {loginHistory?.data.length > 0 && loginHistory?.links && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        {loginHistory?.meta ? (
                                            `Showing ${loginHistory?.meta.from || 0} to ${loginHistory.meta.to || 0} of ${loginHistory.meta.total || 0} results`
                                        ) : (
                                            `Showing ${loginHistory?.data.length} sessions`
                                        )}
                                    </div>
                                    <div className="flex space-x-1">
                                        {loginHistory?.links.map((link: any, index: number) => (
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
