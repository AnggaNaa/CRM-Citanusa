import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState, useEffect, useRef } from 'react';
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
    Squares2X2Icon,
    TableCellsIcon,
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
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [googleChartsLoaded, setGoogleChartsLoaded] = useState(false);
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
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

    // Load Google Charts
    useEffect(() => {
        const loadGoogleCharts = () => {
            if (typeof window !== 'undefined' && !(window as any).google) {
                const script = document.createElement('script');
                script.src = 'https://www.gstatic.com/charts/loader.js';
                script.onload = () => {
                    (window as any).google.charts.load('current', { packages: ['corechart', 'bar'] });
                    (window as any).google.charts.setOnLoadCallback(() => {
                        setGoogleChartsLoaded(true);
                    });
                };
                document.head.appendChild(script);
            } else if ((window as any).google && (window as any).google.charts) {
                setGoogleChartsLoaded(true);
            }
        };

        loadGoogleCharts();
    }, []);

    // Draw charts when data changes or view mode changes
    useEffect(() => {
        if (googleChartsLoaded && viewMode === 'chart') {
            // Clear first to prevent overlap
            clearCharts();
            setTimeout(() => drawCharts(), 100);
        } else if (viewMode === 'table') {
            // Clear charts when switching to table view
            clearCharts();
        }
    }, [googleChartsLoaded, viewMode, leadStats, dailyTrends, statusDistribution, userPerformance]);

    // Additional effect to ensure charts are cleared on view mode change
    useEffect(() => {
        if (viewMode === 'table') {
            clearCharts();
        }
    }, [viewMode]);

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

    // Handle window resize for chart responsiveness
    useEffect(() => {
        const debouncedDrawCharts = debounce(() => {
            if (googleChartsLoaded && viewMode === 'chart') {
                drawCharts();
            }
        }, 300);

        const handleResize = () => {
            debouncedDrawCharts();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [googleChartsLoaded, viewMode, leadStats, dailyTrends, statusDistribution, userPerformance]);

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

    const clearCharts = () => {
        // Clear all chart containers and remove Google Charts instances
        Object.keys(chartRefs.current).forEach(key => {
            const chartContainer = chartRefs.current[key];
            if (chartContainer) {
                // Clear the container content
                chartContainer.innerHTML = '';
                // Force clear any Google Charts instances
                if ((window as any).google && (window as any).google.visualization) {
                    try {
                        const chart = chartContainer.querySelector('div');
                        if (chart) {
                            chart.remove();
                        }
                    } catch (e) {
                        // Ignore errors during cleanup
                    }
                }
            }
        });

        // Force a small delay to ensure DOM is updated
        setTimeout(() => {
            Object.keys(chartRefs.current).forEach(key => {
                const chartContainer = chartRefs.current[key];
                if (chartContainer && chartContainer.children.length > 0) {
                    chartContainer.innerHTML = '';
                }
            });
        }, 50);
    };

    // Debounce function for performance optimization
    const debounce = (func: Function, wait: number) => {
        let timeout: ReturnType<typeof setTimeout>;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const drawCharts = () => {
        if (!googleChartsLoaded || !(window as any).google) return;

        const google = (window as any).google;

        // Lead Statistics Pie Chart
        if (chartRefs.current.leadStatsChart) {
            const leadData = google.visualization.arrayToDataTable([
                ['Priority', 'Count'],
                ['Hot Leads', leadStats.hot_leads],
                ['Warm Leads', leadStats.warm_leads],
                ['Cold Leads', leadStats.cold_leads],
                ['Booking', leadStats.booking_leads],
                ['Closing', leadStats.closing_leads],
                ['Lost', leadStats.lost_leads]
            ]);

            const leadOptions = {
                title: 'Lead Distribution by Priority',
                titleTextStyle: { fontSize: window.innerWidth < 640 ? 12 : 16, bold: true },
                pieHole: 0.3,
                colors: ['#DC2626', '#F59E0B', '#60A5FA', '#F97316', '#10B981', '#6B7280'],
                chartArea: {
                    width: window.innerWidth < 640 ? '85%' : '90%',
                    height: window.innerWidth < 640 ? '75%' : '80%'
                },
                legend: {
                    position: window.innerWidth < 640 ? 'bottom' : 'bottom',
                    alignment: 'center',
                    textStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 }
                },
                backgroundColor: 'transparent'
            };

            const leadChart = new google.visualization.PieChart(chartRefs.current.leadStatsChart);
            leadChart.draw(leadData, leadOptions);
        }

        // Daily Trends Line Chart
        if (chartRefs.current.dailyTrendsChart && dailyTrends.length > 0) {
            const trendsData = google.visualization.arrayToDataTable([
                ['Date', 'New Leads', 'Closing', 'Booking'],
                ...dailyTrends.map(trend => [
                    trend.formatted_date,
                    trend.leads,
                    trend.closing,
                    trend.booking
                ])
            ]);

            const trendsOptions = {
                title: 'Daily Lead Trends',
                titleTextStyle: { fontSize: window.innerWidth < 640 ? 12 : 16, bold: true },
                curveType: 'function',
                legend: {
                    position: 'bottom',
                    textStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 }
                },
                chartArea: {
                    width: window.innerWidth < 640 ? '80%' : '85%',
                    height: window.innerWidth < 640 ? '65%' : '70%'
                },
                colors: ['#3B82F6', '#10B981', '#F97316'],
                backgroundColor: 'transparent',
                hAxis: {
                    title: window.innerWidth < 640 ? '' : 'Date',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 }
                },
                vAxis: {
                    title: window.innerWidth < 640 ? '' : 'Count',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 }
                }
            };

            const trendsChart = new google.visualization.LineChart(chartRefs.current.dailyTrendsChart);
            trendsChart.draw(trendsData, trendsOptions);
        }

        // Status Distribution Column Chart
        if (chartRefs.current.statusDistChart && statusDistribution.length > 0) {
            const statusData = google.visualization.arrayToDataTable([
                ['Status', 'Count'],
                ...statusDistribution.map(status => [status.label, status.count])
            ]);

            const statusOptions = {
                title: 'Lead Status Distribution',
                titleTextStyle: { fontSize: window.innerWidth < 640 ? 12 : 16, bold: true },
                chartArea: {
                    width: window.innerWidth < 640 ? '80%' : '85%',
                    height: window.innerWidth < 640 ? '65%' : '70%'
                },
                colors: ['#3B82F6'],
                backgroundColor: 'transparent',
                hAxis: {
                    title: window.innerWidth < 640 ? '' : 'Status',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 }
                },
                vAxis: {
                    title: window.innerWidth < 640 ? '' : 'Count',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 }
                },
                legend: { position: 'none' }
            };

            const statusChart = new google.visualization.ColumnChart(chartRefs.current.statusDistChart);
            statusChart.draw(statusData, statusOptions);
        }

        // User Performance Bar Chart
        if (chartRefs.current.userPerfChart && userPerformance.length > 0) {
            const userPerfData = google.visualization.arrayToDataTable([
                ['User', 'Total Leads', 'Closing', 'Booking'],
                ...userPerformance.slice(0, 10).map(user => [
                    user.name.split(' ')[0], // First name only for better readability
                    user.total_leads,
                    user.closing_leads,
                    user.booking_leads
                ])
            ]);

            const userPerfOptions = {
                title: 'User Performance Comparison',
                titleTextStyle: { fontSize: window.innerWidth < 640 ? 12 : 16, bold: true },
                chartArea: {
                    width: window.innerWidth < 640 ? '70%' : '75%',
                    height: window.innerWidth < 640 ? '65%' : '70%'
                },
                colors: ['#3B82F6', '#10B981', '#F97316'],
                backgroundColor: 'transparent',
                hAxis: {
                    title: window.innerWidth < 640 ? '' : 'Users',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 },
                    slantedText: window.innerWidth < 640,
                    slantedTextAngle: window.innerWidth < 640 ? 45 : 0
                },
                vAxis: {
                    title: window.innerWidth < 640 ? '' : 'Count',
                    titleTextStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 },
                    textStyle: { fontSize: window.innerWidth < 640 ? 8 : 10 }
                },
                legend: {
                    position: 'bottom',
                    textStyle: { fontSize: window.innerWidth < 640 ? 10 : 12 }
                }
            };

            const userPerfChart = new google.visualization.ColumnChart(chartRefs.current.userPerfChart);
            userPerfChart.draw(userPerfData, userPerfOptions);
        }
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
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                                    <p className="text-sm sm:text-base text-gray-600 mt-1">Comprehensive insights into your CRM performance</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                    {/* View Mode Toggle */}
                                    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`inline-flex items-center px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                                                viewMode === 'table'
                                                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <TableCellsIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Table</span>
                                            <span className="sm:hidden">Tbl</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('chart')}
                                            className={`inline-flex items-center px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                                                viewMode === 'chart'
                                                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Squares2X2Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Charts</span>
                                            <span className="sm:hidden">Chr</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Filters</span>
                                        <span className="sm:hidden">Filter</span>
                                    </button>
                                    <div className="relative export-dropdown">
                                        <button
                                            onClick={() => setIsExportOpen(!isExportOpen)}
                                            className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                            <span className="sm:hidden">Exp</span>
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
                                <form onSubmit={handleFilterSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
                                    <div className="sm:col-span-2 md:col-span-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
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
                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700"
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

                    {/* Stats Cards - Bottom Row (4 cards) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
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

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <div className="h-3 w-3 lg:h-4 lg:w-4 rounded-full bg-blue-500"></div>
                                    </div>
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Cold Leads</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.cold_leads}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3 lg:ml-4">
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Lost Leads</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{leadStats.lost_leads}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content based on view mode */}
                    {viewMode === 'table' ? (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
                            {/* Daily Trends Table */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Daily Lead Trends</h3>
                                    <p className="text-sm text-gray-600">Lead creation and conversion over time</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="max-h-96 overflow-y-auto">
                                            {dailyTrends.map((trend, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                                        <span className="text-xs sm:text-sm font-medium text-gray-900">{trend.formatted_date}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-4">
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-xs text-gray-600">Leads</p>
                                                            <p className="text-sm sm:text-lg font-semibold text-blue-600">{trend.leads}</p>
                                                        </div>
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-xs text-gray-600">Closing</p>
                                                            <p className="text-sm sm:text-lg font-semibold text-green-600">{trend.closing}</p>
                                                        </div>
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-xs text-gray-600">Booking</p>
                                                            <p className="text-sm sm:text-lg font-semibold text-orange-600">{trend.booking}</p>
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

                            {/* Status Distribution Table */}
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
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
                            {/* Lead Statistics Chart */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Lead Statistics by Priority</h3>
                                    <p className="text-sm text-gray-600">Distribution of leads across all priorities</p>
                                </div>
                                <div className="p-6">
                                    {googleChartsLoaded && viewMode === 'chart' ? (
                                        <div
                                            ref={(el) => { chartRefs.current.leadStatsChart = el; }}
                                            className="w-full h-64 sm:h-80 lg:h-96"
                                        ></div>
                                    ) : viewMode === 'chart' ? (
                                        <div className="flex items-center justify-center h-64 sm:h-80">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-500">Loading chart...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Daily Trends Chart */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Daily Lead Trends</h3>
                                    <p className="text-sm text-gray-600">Lead creation and conversion over time</p>
                                </div>
                                <div className="p-6">
                                    {googleChartsLoaded && viewMode === 'chart' ? (
                                        <div
                                            ref={(el) => { chartRefs.current.dailyTrendsChart = el; }}
                                            className="w-full h-64 sm:h-80 lg:h-96"
                                        ></div>
                                    ) : viewMode === 'chart' ? (
                                        <div className="flex items-center justify-center h-64 sm:h-80">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-500">Loading chart...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Section - Performance Data */}
                    {viewMode === 'table' ? (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-4 sm:p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">User Performance</h3>
                                    <p className="text-sm text-gray-600">Detailed performance metrics by user</p>
                                </div>

                                {/* Mobile Card Layout */}
                                <div className="block sm:hidden">
                                    <div className="divide-y divide-gray-200">
                                        {userPerformance.slice(0, 10).map((user) => (
                                            <div key={user.id} className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.conversion_rate >= 20 ? 'bg-green-100 text-green-800' :
                                                        user.conversion_rate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.conversion_rate}%
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mt-3">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="text-sm font-semibold text-gray-900">{user.total_leads}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">Closing</p>
                                                        <p className="text-sm font-semibold text-green-600">{user.closing_leads}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">Booking</p>
                                                        <p className="text-sm font-semibold text-blue-600">{user.booking_leads}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Table Layout */}
                                <div className="hidden sm:block overflow-x-auto">
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
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {/* Status Distribution Chart */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                                    <p className="text-sm text-gray-600">Lead status breakdown</p>
                                </div>
                                <div className="p-6">
                                    {googleChartsLoaded && viewMode === 'chart' ? (
                                        <div
                                            ref={(el) => { chartRefs.current.statusDistChart = el; }}
                                            className="w-full h-64 sm:h-80 lg:h-96"
                                        ></div>
                                    ) : viewMode === 'chart' ? (
                                        <div className="flex items-center justify-center h-64 sm:h-80">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-500">Loading chart...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* User Performance Chart */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">User Performance</h3>
                                    <p className="text-sm text-gray-600">Top 10 users performance comparison</p>
                                </div>
                                <div className="p-6">
                                    {googleChartsLoaded && viewMode === 'chart' ? (
                                        <div
                                            ref={(el) => { chartRefs.current.userPerfChart = el; }}
                                            className="w-full h-64 sm:h-80 lg:h-96"
                                        ></div>
                                    ) : viewMode === 'chart' ? (
                                        <div className="flex items-center justify-center h-64 sm:h-80">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-500">Loading chart...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

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
