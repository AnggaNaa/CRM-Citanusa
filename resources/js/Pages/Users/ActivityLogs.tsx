import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    ArrowLeftIcon,
    ClockIcon,
    EyeIcon,
    UserIcon,
    ComputerDesktopIcon,
    FunnelIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface ActivityLog {
    id: number;
    action: string;
    model_type: string;
    model_id: number;
    subject_type?: string;
    subject_id?: number;
    description: string;
    before_data?: any;
    after_data?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props extends PageProps {
    user?: User;
    activityLogs: {
        data: ActivityLog[];
        meta: any;
        links: any[];
    };
    filters: {
        action?: string;
        model_type?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    actions: string[];
    modelTypes: string[];
    perPageOptions: number[];
}

export default function ActivityLogs({ auth, user, activityLogs, filters, actions, modelTypes, perPageOptions }: Props) {
    const [action, setAction] = useState(filters.action || '');
    const [modelType, setModelType] = useState(filters.model_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || 25);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    const handleFilter = () => {
        const routeName = user ? 'users.activity-logs' : 'activity-logs.index';
        const routeParams = user ? [user.id] : [];

        router.get(route(routeName, ...routeParams), {
            action: action || undefined,
            model_type: modelType || undefined,
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
        const routeName = user ? 'users.activity-logs' : 'activity-logs.index';
        const routeParams = user ? [user.id] : [];

        router.get(route(routeName, ...routeParams), {
            action: action || undefined,
            model_type: modelType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setAction('');
        setModelType('');
        setDateFrom('');
        setDateTo('');
        const routeName = user ? 'users.activity-logs' : 'activity-logs.index';
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

    const getActionColor = (action: string) => {
        const colors: { [key: string]: string } = {
            'created': 'bg-green-100 text-green-800',
            'updated': 'bg-blue-100 text-blue-800',
            'deleted': 'bg-red-100 text-red-800',
            'restored': 'bg-yellow-100 text-yellow-800',
            'login': 'bg-purple-100 text-purple-800',
            'logout': 'bg-gray-100 text-gray-800',
        };
        return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={"Activity Logs"}
        >
            <Head title={user ? `Activity Logs - ${user?.name}` : 'Activity Logs'} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user ? `Activity Logs - ${user?.name}` : 'Activity Logs'}
                            </h1>
                            <p className="text-gray-600">
                                {user ? 'View user activity history and audit trail' : 'System-wide activity history and audit trail'}
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
                                    <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                                        Action
                                    </label>
                                    <select
                                        id="action"
                                        value={action}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAction(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Actions</option>
                                        {actions?.map((act) => (
                                            <option key={act} value={act}>{act}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="model_type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Model Type
                                    </label>
                                    <select
                                        id="model_type"
                                        value={modelType}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModelType(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All Types</option>
                                        {modelTypes?.map((type) => (
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
                            {activityLogs?.meta ? (
                                `Showing ${activityLogs.meta.from || 0} to ${activityLogs.meta.to || 0} of ${activityLogs.meta.total || 0} results`
                            ) : (
                                `Showing ${activityLogs?.data.length} logs`
                            )}
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Activity Logs ({activityLogs?.meta?.total || activityLogs?.data.length})
                            </h2>
                        </div>

                        {activityLogs?.data.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {activityLogs.data.map((log) => (
                                    <div key={log.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {log.model_type}
                                                    </span>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <ClockIcon className="h-4 w-4 mr-1" />
                                                        {formatDateTime(log.created_at)}
                                                    </div>
                                                </div>

                                                <p className="mt-2 text-sm text-gray-900">
                                                    {log.description}
                                                </p>

                                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                    {!user && (
                                                        <div className="flex items-center">
                                                            <UserIcon className="h-3 w-3 mr-1" />
                                                            {log.user.name}
                                                        </div>
                                                    )}
                                                    {log.ip_address && (
                                                        <div className="flex items-center">
                                                            <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                                                            {log.ip_address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {(log.before_data || log.after_data) && (
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                                                    title="View details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {user ? 'This user has no recorded activity.' : 'No activity logs match the current filters.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {activityLogs?.data.length > 0 && activityLogs.links && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        {activityLogs.meta ? (
                                            `Showing ${activityLogs?.meta.from || 0} to ${activityLogs?.meta.to || 0} of ${activityLogs.meta.total || 0} results`
                                        ) : (
                                            `Showing ${activityLogs?.data.length} logs`
                                        )}
                                    </div>
                                    <div className="flex space-x-1">
                                        {activityLogs?.links.map((link: any, index: number) => (
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

                    {/* Detail Modal */}
                    {selectedLog && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700">Action</h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                                                {selectedLog.action}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700">Description</h4>
                                            <p className="text-sm text-gray-900">{selectedLog.description}</p>
                                        </div>

                                        {selectedLog.before_data && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Before</h4>
                                                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                                    {JSON.stringify(selectedLog.before_data, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {selectedLog.after_data && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">After</h4>
                                                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                                    {JSON.stringify(selectedLog.after_data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
