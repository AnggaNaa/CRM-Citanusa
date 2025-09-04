import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    ChartBarIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    PresentationChartLineIcon,
    ClockIcon,
    FireIcon,
} from '@heroicons/react/24/outline';

interface LeadStatistics {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    booking_leads: number;
    closing_leads: number;
    lost_leads: number;
    conversion_rate: number;
}

interface UserPerformance {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    booking_leads: number;
    closing_leads: number;
    lost_leads: number;
    conversion_rate: number;
}

interface DailyTrend {
    date: string;
    leads: number;
    closing: number;
    booking: number;
    formatted_date: string;
}

interface StatusDistribution {
    status: string;
    count: number;
    label: string;
}

interface TopPerformer {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
}

interface RecentActivity {
    id: number;
    user_name: string;
    action: string;
    description: string;
    created_at: string;
    formatted_date: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props extends PageProps {
    leadStats: LeadStatistics;
    userPerformance: UserPerformance[];
    dailyTrends: DailyTrend[];
    statusDistribution: StatusDistribution[];
    topPerformers: TopPerformer[];
    recentActivities: RecentActivity[];
    users: User[];
    statuses: string[];
    filters: {
        date_from: string;
        date_to: string;
        user_id?: number;
        status?: string;
    };
}

export default function Index({
    auth,
    leadStats,
    userPerformance,
    dailyTrends,
    statusDistribution,
    topPerformers,
    recentActivities,
    users,
    statuses,
    filters
}: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [formData, setFormData] = useState({
        date_from: filters.date_from,
        date_to: filters.date_to,
        user_id: filters.user_id || '',
        status: filters.status || '',
    });

    // Debug data received from backend
    console.log('🔍 Report Data Debug:', {
        leadStats,
        dailyTrends: dailyTrends.slice(0, 3), // Show first 3 days
        statusDistribution: statusDistribution.slice(0, 5), // Show first 5 statuses
        topPerformers,
        filters,
        formData
    });

    // Close export dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isExportOpen && !(event.target as Element).closest('.export-dropdown')) {
                setIsExportOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportOpen]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) params.append(key, value.toString());
        });
        window.location.href = `/reports?${params.toString()}`;
    };

    const handleExport = (type: string, report: string) => {
        console.log('🚀 Starting export process:', { type, report, formData });

        try {
            const params = new URLSearchParams();
            params.append('type', type);
            params.append('report', report);
            Object.entries(formData).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });

            console.log('📊 Export parameters prepared:', Array.from(params.entries()));

            if (type === 'csv') {
                console.log('💾 Processing CSV export...');

                // Create form for POST request to download CSV
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/reports/export';
                form.style.display = 'none';

                // Add CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                console.log('🔐 CSRF token found:', !!csrfToken);

                if (csrfToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                } else {
                    console.error('❌ No CSRF token found!');
                    alert('Security token not found. Please refresh the page and try again.');
                    return;
                }

                // Add parameters
                params.forEach((value, key) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                console.log('📝 Form inputs added:', form.elements.length);
                console.log('🎯 Submitting form to:', form.action);

                document.body.appendChild(form);
                form.submit();
                setTimeout(() => {
                    if (document.body.contains(form)) {
                        document.body.removeChild(form);
                    }
                }, 1000);

                console.log('✅ CSV form submitted successfully');

            } else {
                console.log('📄 Processing JSON export...');

                const requestData = {
                    type: type,
                    report: report,
                    ...formData
                };

                console.log('🔄 JSON request data:', requestData);

                // JSON download via POST
                fetch('/reports/export', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => {
                    console.log('📡 Response received:', response.status, response.statusText);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('📋 Response data:', data);
                    if (data.success) {
                        console.log('✅ Export successful, creating download...');
                        // Create downloadable JSON file
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${report}_report_${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        console.log('🎉 JSON file download initiated');
                    } else {
                        console.error('❌ Export failed - server response:', data);
                        alert('Export failed. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('💥 Export error:', error);
                    alert('Export failed with error. Please check console for details.');
                });
            }
        } catch (error) {
            console.error('🚨 Unexpected error in handleExport:', error);
            alert('An unexpected error occurred. Please check console for details.');
        }
    };    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'new': 'bg-blue-100 text-blue-800',
            'in_progress': 'bg-yellow-100 text-yellow-800',
            'converted': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Reports & Analytics"
        >
            <Head title="Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header with Filters */}
                    <div className="bg-white shadow-sm rounded-xl mb-6" style={{ overflow: 'visible' }}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                                    <p className="text-gray-600 mt-1">Comprehensive insights into your CRM performance</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <FunnelIcon className="h-4 w-4 mr-2" />
                                        Filters
                                    </button>
                                    <div className="relative export-dropdown">
                                        <button
                                            onClick={() => setIsExportOpen(!isExportOpen)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                            Export
                                        </button>
                                        {isExportOpen && (
                                            <div
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border"
                                                style={{ zIndex: 9999 }}
                                            >
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            handleExport('csv', 'leads');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Leads Report (CSV)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleExport('json', 'leads');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Leads Report (JSON)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleExport('csv', 'users');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        User Performance (CSV)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleExport('json', 'users');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        User Performance (JSON)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleExport('csv', 'activities');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Activity Logs (CSV)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleExport('json', 'activities');
                                                            setIsExportOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Activity Logs (JSON)
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Filter Form */}
                            {isFilterOpen && (
                                <form onSubmit={handleFilterSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={formData.date_from}
                                            onChange={(e) => setFormData({...formData, date_from: e.target.value})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={formData.date_to}
                                            onChange={(e) => setFormData({...formData, date_to: e.target.value})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                        <select
                                            value={formData.user_id}
                                            onChange={(e) => setFormData({...formData, user_id: parseInt(e.target.value) || ''})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="">All Users</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="">All Statuses</option>
                                            {statuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    date_from: new Date().toISOString().split('T')[0],
                                                    date_to: new Date().toISOString().split('T')[0],
                                                    user_id: '',
                                                    status: '',
                                                });
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Understanding the Metrics</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Total Leads:</strong> Semua leads yang ada dalam database dalam periode yang dipilih (saat ini: {leadStats.total_leads} leads)</li>
                                        <li><strong>Hot Leads:</strong> Priority: Hot - leads dengan potensi tinggi</li>
                                        <li><strong>Warm Leads:</strong> Priority: Warm - leads dengan potensi sedang</li>
                                        <li><strong>Cold Leads:</strong> Priority: Cold - leads dengan potensi rendah</li>
                                        <li><strong>Booking:</strong> Priority: Booking - leads yang sudah booking unit</li>
                                        <li><strong>Closing:</strong> Priority: Closing - leads yang berhasil closing/deal</li>
                                        <li><strong>Lost:</strong> Priority: Lost - leads yang hilang/tidak berminat</li>
                                        <li><strong>Conversion Rate:</strong> Persentase leads yang berhasil di-convert ({leadStats.closing_leads + leadStats.booking_leads} dari {leadStats.total_leads} = {leadStats.conversion_rate}%)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Top Row (4 cards) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total Leads</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.total_leads}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FireIcon className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Hot Leads</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.hot_leads}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ArrowTrendingUpIcon className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Closing</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.closing_leads}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <PresentationChartLineIcon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Conversion Rate</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.conversion_rate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Bottom Row (2 cards) */}
                    <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UserGroupIcon className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Booking</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.booking_leads}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Warm Leads</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.warm_leads}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Daily Trends Chart */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Daily Lead Trends</h3>
                                <p className="text-sm text-gray-600">Lead creation and conversion over time</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="max-h-96 overflow-y-auto">
                                        {dailyTrends.map((trend, index) => (
                                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                <div className="flex items-center space-x-3">
                                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{trend.formatted_date}</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Leads</p>
                                                        <p className="text-lg font-semibold text-blue-600">{trend.leads}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Closing</p>
                                                        <p className="text-lg font-semibold text-green-600">{trend.closing}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Booking</p>
                                                        <p className="text-lg font-semibold text-orange-600">{trend.booking}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {dailyTrends.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p>No data available for the selected date range</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Distribution */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                                <p className="text-sm text-gray-600">Lead status breakdown</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {statusDistribution.map((status, index) => {
                                        const percentage = leadStats.total_leads > 0
                                            ? Math.round((status.count / leadStats.total_leads) * 100)
                                            : 0;
                                        return (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                                        {status.count}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Performers */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                                <p className="text-sm text-gray-600">Highest converting team members</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {topPerformers.map((performer) => (
                                        <div key={performer.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {performer.profile_picture ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={`/storage/${performer.profile_picture}`}
                                                        alt={performer.name}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <UserGroupIcon className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{performer.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{performer.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">{performer.conversion_rate}%</p>
                                                <p className="text-xs text-gray-500">{performer.converted_leads}/{performer.total_leads}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* User Performance Table */}
                        <div className="lg:col-span-2 bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">User Performance</h3>
                                <p className="text-sm text-gray-600">Detailed performance metrics by user</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {userPerformance.slice(0, 10).map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.total_leads}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{user.closing_leads}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{user.booking_leads}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.conversion_rate >= 20 ? 'bg-green-100 text-green-800' :
                                                        user.conversion_rate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.conversion_rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="mt-6 bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                            <p className="text-sm text-gray-600">Latest system activities and updates</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <ClockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{activity.user_name}</span> {activity.action}
                                            </p>
                                            <p className="text-sm text-gray-500">{activity.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{activity.created_at}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
