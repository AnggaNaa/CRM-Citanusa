import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChartBarIcon,
    UserGroupIcon,
    DocumentIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    FireIcon,
    ArrowTrendingUpIcon,
    PlusIcon,
    EyeIcon,
    UsersIcon,
    DocumentChartBarIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface DashboardProps {
    auth: any;
    stats: {
        totalLeads: number;
        hotLeads: number;
        bookingLeads: number;
        closingLeads: number;
    };
    recentLeads: any[];
    priorityStats: Record<string, number>;
    monthlyLeadsData: Array<{
        month: string;
        month_full: string;
        leads: number;
    }>;
    haLeadCounts: Array<{
        ha_name: string;
        ha_id: number;
        total_leads: number;
        hot_leads: number;
        booking_leads: number;
        closing_leads: number;
    }>;
    user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ auth, stats, recentLeads, priorityStats, monthlyLeadsData, haLeadCounts, user }) => {
    const priorityIcons = {
        'Cold': ClockIcon,
        'Warm': ArrowTrendingUpIcon,
        'Hot': FireIcon,
        'Booking': ExclamationTriangleIcon,
        'Closing': CheckCircleIcon,
        'Lost': ExclamationTriangleIcon
    };

    const priorityColors = {
        'Cold': 'text-blue-600 bg-blue-50 border-blue-200',
        'Warm': 'text-yellow-600 bg-yellow-50 border-yellow-200',
        'Hot': 'text-red-600 bg-red-50 border-red-200',
        'Booking': 'text-purple-600 bg-purple-50 border-purple-200',
        'Closing': 'text-green-600 bg-green-50 border-green-200',
        'Lost': 'text-gray-600 bg-gray-50 border-gray-200'
    };

    const statCards = [
        {
            name: 'Total Leads',
            value: stats.totalLeads,
            icon: DocumentIcon,
            color: 'text-blue-600 bg-blue-100',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            name: 'Hot Leads',
            value: stats.hotLeads,
            icon: FireIcon,
            color: 'text-red-600 bg-red-100',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        },
        {
            name: 'Booking',
            value: stats.bookingLeads,
            icon: ExclamationTriangleIcon,
            color: 'text-purple-600 bg-purple-100',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            name: 'Closing',
            value: stats.closingLeads,
            icon: CheckCircleIcon,
            color: 'text-green-600 bg-green-100',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Dashboard Overview"
        >
            <Head title="Dashboard - NUSA CRM" />

            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                    <div className="px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">
                                    Welcome back, {auth.user.name}! 👋
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Role: <span className="font-semibold">{user?.roles?.[0]?.name?.toUpperCase() || 'N/A'}</span> •
                                    {new Date().toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <SparklesIcon className="h-16 w-16 text-blue-200" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <div key={stat.name} className={`${stat.bgColor} ${stat.borderColor} border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {stat.name}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <stat.icon className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monthly Leads Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Monthly Leads Trend ({new Date().getFullYear()})
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            {monthlyLeadsData && monthlyLeadsData.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Simple Bar Chart */}
                                    <div className="flex items-end justify-between h-64 px-4">
                                        {monthlyLeadsData.map((data) => {
                                            const maxLeads = Math.max(...monthlyLeadsData.map(d => d.leads));
                                            const heightPx = maxLeads > 0 ? Math.max((data.leads / maxLeads) * 200, data.leads > 0 ? 8 : 0) : 0;

                                            return (
                                                <div key={data.month} className="flex flex-col items-center space-y-2 flex-1">
                                                    <div className="w-full flex flex-col items-center">
                                                        <div
                                                            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-8 transition-all duration-500 hover:from-blue-700 hover:to-blue-500 relative"
                                                            style={{
                                                                height: `${heightPx}px`,
                                                                minHeight: data.leads > 0 ? '8px' : '0px'
                                                            }}
                                                            title={`${data.month_full}: ${data.leads} leads`}
                                                        >
                                                            {/* Value label on top of bar */}
                                                            {data.leads > 0 && (
                                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded shadow-sm">
                                                                    {data.leads}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center mt-2">
                                                            <div className="text-xs text-gray-500 font-medium">{data.month}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>                                    {/* Summary */}
                                    <div className="flex justify-center">
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className="text-gray-600">Total this year:</span>
                                                <span className="font-semibold text-blue-600">
                                                    {monthlyLeadsData.reduce((sum, month) => sum + month.leads, 0)} leads
                                                </span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-gray-600">Current month:</span>
                                                <span className="font-semibold text-green-600">
                                                    {monthlyLeadsData[new Date().getMonth()]?.leads || 0} leads
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                                        <p className="mt-1 text-sm text-gray-500">Chart will appear when leads data is available.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Priority Breakdown */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Lead Priorities
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {Object.entries(priorityStats || {}).map(([priority, count]) => {
                                        const Icon = priorityIcons[priority as keyof typeof priorityIcons];
                                        const colorClass = priorityColors[priority as keyof typeof priorityColors];
                                        return (
                                            <div key={priority} className={`p-3 rounded-lg border ${colorClass} transition-all duration-200 hover:shadow-sm`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {Icon && <Icon className="h-5 w-5 mr-3" />}
                                                        <span className="font-medium">
                                                            {priority}
                                                        </span>
                                                    </div>
                                                    <span className="text-lg font-bold">{count}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Recent Leads
                                </h3>
                            </div>
                            <div className="p-6">
                                {recentLeads && recentLeads.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentLeads.map((lead) => (
                                            <div key={lead.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                            {lead.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {lead.contact_name} • {lead.project}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[lead.priority as keyof typeof priorityColors]}`}>
                                                            {lead.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                                    <span>Assigned to: {lead.assigned_to?.name || 'Unassigned'}</span>
                                                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent leads</h3>
                                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new lead.</p>
                                    </div>
                                )}

                                {recentLeads && recentLeads.length > 0 && (
                                    <div className="mt-6 text-center">
                                        <Link
                                            href="/leads"
                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            View all leads
                                            <EyeIcon className="ml-1 h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/leads/create"
                                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-4 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center">
                                    <PlusIcon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">Add New Lead</span>
                                </div>
                            </Link>

                            <Link
                                href="/leads"
                                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg p-4 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center">
                                    <EyeIcon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">View All Leads</span>
                                </div>
                            </Link>

                            {(user?.roles?.[0]?.name === 'superadmin' || user?.roles?.[0]?.name === 'manager') && (
                                <Link
                                    href="/users"
                                    className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg p-4 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-center">
                                        <UsersIcon className="h-5 w-5 mr-3" />
                                        <span className="font-medium">Manage Users</span>
                                    </div>
                                </Link>
                            )}

                            <Link
                                href="/reports"
                                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-4 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center">
                                    <DocumentChartBarIcon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">View Reports</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* HA Lead Counts Section */}
                {auth.user.role !== 'ha' && haLeadCounts && haLeadCounts.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    HA Performance Overview
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    HA Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Leads
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Hot Leads
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Booking
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Closing
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Conversion Rate
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {haLeadCounts.map((ha, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-white">
                                                                    {ha.ha_name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {ha.ha_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{ha.total_leads}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-orange-600 font-medium">{ha.hot_leads}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-blue-600 font-medium">{ha.booking_leads}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-green-600 font-medium">{ha.closing_leads}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {ha.total_leads > 0
                                                                ? `${Math.round((ha.closing_leads / ha.total_leads) * 100)}%`
                                                                : '0%'
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
