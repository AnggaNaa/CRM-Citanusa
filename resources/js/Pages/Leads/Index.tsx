import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Lead, PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    XMarkIcon,
    FireIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

interface Props extends PageProps {
    leads: {
        data: Lead[];
        links: any[];
        meta: any;
    };
    availableUsers: User[];
    filters: {
        priority?: string;
        status?: string;
        assigned_to?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
        project?: string;
        unit_type?: string;
        per_page?: number;
    };
    priorities: string[];
    statuses: {id: number; name: string}[];
    projects: string[];
    unitTypes: string[];
    perPageOptions: number[];
}

export default function Index({ auth, leads, availableUsers, filters, priorities, statuses, projects, unitTypes, perPageOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [status, setStatus] = useState(filters.status || '');
    const [assignedTo, setAssignedTo] = useState(filters.assigned_to || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [project, setProject] = useState(filters.project || '');
    const [unitType, setUnitType] = useState(filters.unit_type || '');
    const [perPage, setPerPage] = useState(filters.per_page || 25);
    const [showFilters, setShowFilters] = useState(false);
    const [showQuickUpdate, setShowQuickUpdate] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [quickUpdateData, setQuickUpdateData] = useState({
        priority: '',
        status: '',
        description: ''
    });

    // Fetch available statuses when priority changes in quick update
    useEffect(() => {
        if (quickUpdateData.priority) {
            fetch(`/api/leads/statuses-by-priority?priority=${encodeURIComponent(quickUpdateData.priority)}`)
                .then(response => response.json())
                .then(statusList => {
                    setAvailableStatuses(statusList);
                    // Reset status if it's not available in new priority
                    if (statusList.length > 0 && !statusList.includes(quickUpdateData.status)) {
                        setQuickUpdateData(prev => ({
                            ...prev,
                            status: ''
                        }));
                    }
                })
                .catch(() => setAvailableStatuses([]));
        } else {
            setAvailableStatuses([]);
        }
    }, [quickUpdateData.priority]);

    const priorityIcons = {
        'Cold': ClockIcon,
        'Warm': ArrowTrendingUpIcon,
        'Hot': FireIcon,
        'Booking': ExclamationTriangleIcon,
        'Closing': CheckCircleIcon,
        'Lost': ExclamationTriangleIcon
    };

    const priorityColors = {
        'Cold': 'bg-blue-50 text-blue-700 border-blue-200',
        'Warm': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'Hot': 'bg-red-50 text-red-700 border-red-200',
        'Booking': 'bg-purple-50 text-purple-700 border-purple-200',
        'Closing': 'bg-green-50 text-green-700 border-green-200',
        'Lost': 'bg-gray-50 text-gray-700 border-gray-200'
    };

    const handleFilter = () => {
        router.get(route('leads.index'), {
            search: search || undefined,
            priority: priority || undefined,
            status: status || undefined,
            assigned_to: assignedTo || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            project: project || undefined,
            unit_type: unitType || undefined,
            per_page: perPage || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(route('leads.index'), {
            search: search || undefined,
            priority: priority || undefined,
            status: status || undefined,
            assigned_to: assignedTo || undefined,
            project: project || undefined,
            unit_type: unitType || undefined,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };    const clearFilters = () => {
        setSearch('');
        setPriority('');
        setStatus('');
        setAssignedTo('');
        setProject('');
        setUnitType('');
        router.get('/leads', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const deleteLead = (id: number) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            router.delete(`/leads/${id}`);
        }
    };

    const openQuickUpdate = (lead: Lead) => {
        setSelectedLead(lead);
        setQuickUpdateData({
            priority: lead.priority,
            status: lead.status,
            description: lead.description || ''
        });

        // Fetch available statuses for the current priority
        if (lead.priority) {
            fetch(`/api/leads/statuses-by-priority?priority=${encodeURIComponent(lead.priority)}`)
                .then(response => response.json())
                .then(statusList => {
                    setAvailableStatuses(statusList);
                })
                .catch(() => setAvailableStatuses([]));
        }

        setShowQuickUpdate(true);
    };

    const handleQuickUpdate = () => {
        if (!selectedLead) return;

        router.patch(`/leads/${selectedLead.id}/quick-update`, quickUpdateData, {
            onSuccess: () => {
                setShowQuickUpdate(false);
                setSelectedLead(null);
            }
        });
    };

    const getPriorityIcon = (priority: string) => {
        const Icon = priorityIcons[priority as keyof typeof priorityIcons];
        return Icon ? <Icon className="h-4 w-4" /> : null;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Leads Management"
        >
            <Head title="Leads Management - NUSA CRM" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                        <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Filters
                        </button>
                        <Link
                            href="/leads/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add New Lead
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="md:col-span-2 lg:col-span-1">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Search leads..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                                    Project
                                </label>
                                <select
                                    id="project"
                                    value={project}
                                    onChange={(e) => setProject(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Projects</option>
                                    {projects.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="unit_type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Type
                                </label>
                                <select
                                    id="unit_type"
                                    value={unitType}
                                    onChange={(e) => setUnitType(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Unit Types</option>
                                    {unitTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Priorities</option>
                                    {priorities.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
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
                                    <option value="">All Statuses</option>
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned To
                                </label>
                                <select
                                    id="assigned_to"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Users</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleFilter}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Clear Filters
                            </button>
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
                        {leads.meta ? (
                            `Showing ${leads.meta.from || 0} to ${leads.meta.to || 0} of ${leads.meta.total || 0} results`
                        ) : (
                            `Showing ${leads.data.length} leads`
                        )}
                    </div>
                </div>

                {/* Leads Table - Improved Layout */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Leads ({leads.meta?.total || leads.data.length})
                    </h2>
                </div>                    {leads.data.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '200px'}}>
                                                Contact
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '250px'}}>
                                                Description
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '180px'}}>
                                                Project & Unit
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>
                                                Priority
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '140px'}}>
                                                Assigned To
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                                                Status
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '90px'}}>
                                                Created
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '90px'}}>
                                                Updated
                                            </th>
                                            <th scope="col" className="relative px-4 py-3" style={{width: '120px'}}>
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leads.data.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-4 py-4" style={{width: '200px'}}>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-gray-900 truncate" title={lead.contact_name}>
                                                            {lead.contact_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate" title={lead.contact_email}>
                                                            {lead.contact_email}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {lead.contact_phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '250px'}}>
                                                    <div className="relative group">
                                                        <div
                                                            className="text-sm text-gray-900 overflow-hidden"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                maxHeight: '2.5rem',
                                                                lineHeight: '1.25rem'
                                                            }}
                                                            title={lead.description || 'No description provided'}
                                                        >
                                                            {lead.description || 'No description provided'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '180px'}}>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-gray-900 truncate" title={lead.project || 'No Project'}>
                                                            {lead.project || 'No Project'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {lead.unit_type && lead.unit_no
                                                                ? `${lead.unit_type} - Unit ${lead.unit_no}`
                                                                : 'No Unit Selected'
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '120px'}}>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[lead.priority as keyof typeof priorityColors]}`}>
                                                        {getPriorityIcon(lead.priority)}
                                                        <span className="ml-1">{lead.priority}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '140px'}}>
                                                    <div className="text-sm text-gray-900 truncate" title={lead.assigned_to?.name || 'Unassigned'}>
                                                        {lead.assigned_to?.name || 'Unassigned'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '100px'}}>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '90px'}}>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '90px'}}>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(lead.updated_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4" style={{width: '120px'}}>
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            onClick={() => openQuickUpdate(lead)}
                                                            className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                                                            title="Quick Update"
                                                        >
                                                            <BoltIcon className="h-4 w-4" />
                                                        </button>
                                                        <Link
                                                            href={`/leads/${lead.id}`}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                            title="View"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('leads.edit', lead.id)}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteLead(lead.id)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card View */}
                            <div className="lg:hidden">
                                <div className="space-y-4 p-4">
                                    {leads.data.map((lead) => (
                                        <div key={lead.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                                            {/* Contact Info Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {lead.contact_name}
                                                    </h3>
                                                    <div className="text-sm text-gray-500 space-y-1">
                                                        <div className="truncate">{lead.contact_email}</div>
                                                        <div>{lead.contact_phone}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-4">
                                                    <button
                                                        onClick={() => openQuickUpdate(lead)}
                                                        className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                                                        title="Quick Update"
                                                    >
                                                        <BoltIcon className="h-5 w-5" />
                                                    </button>
                                                    <Link
                                                        href={`/leads/${lead.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={route('leads.edit', lead.id)}
                                                        className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-900 leading-relaxed">
                                                    {lead.description ? (
                                                        lead.description.length > 150 ? (
                                                            <>
                                                                {lead.description.substring(0, 150)}...
                                                                <button className="text-blue-600 hover:text-blue-800 ml-1 text-sm font-medium">
                                                                    Read more
                                                                </button>
                                                            </>
                                                        ) : (
                                                            lead.description
                                                        )
                                                    ) : (
                                                        <span className="text-gray-500 italic">No description provided</span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Project & Status Info */}
                                            <div className="space-y-3">
                                                {/* Project Info */}
                                                {(lead.project || lead.unit_type || lead.unit_no) && (
                                                    <div>
                                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Project & Unit</h4>
                                                        <div className="text-sm text-gray-900">
                                                            {lead.project && <div>{lead.project}</div>}
                                                            {lead.unit_type && lead.unit_no && (
                                                                <div className="text-gray-600">{lead.unit_type} - Unit {lead.unit_no}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status & Priority */}
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[lead.priority as keyof typeof priorityColors]}`}>
                                                        {getPriorityIcon(lead.priority)}
                                                        <span className="ml-1">{lead.priority}</span>
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {lead.status}
                                                    </span>
                                                </div>

                                                {/* Assignment & Date */}
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <div>
                                                        <span className="font-medium">Assigned:</span> {lead.assigned_to?.name || 'Unassigned'}
                                                    </div>
                                                    <div className="text-right">
                                                        <div>Created: {new Date(lead.created_at).toLocaleDateString()}</div>
                                                        <div>Updated: {new Date(lead.updated_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new lead.</p>
                            <div className="mt-6">
                                <Link
                                    href="/leads/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add New Lead
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {leads.data.length > 0 && leads.links && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            {/* Mobile Pagination */}
                            <div className="flex items-center justify-between sm:hidden">
                                <div className="text-sm text-gray-700">
                                    Page {leads.meta?.current_page || 1} of {leads.meta?.last_page || 1}
                                </div>
                                <div className="flex space-x-2">
                                    {leads.links.find((link: any) => link.label === '&laquo; Previous') && (
                                        <button
                                            onClick={() => {
                                                const prevLink = leads.links.find((link: any) => link.label === '&laquo; Previous');
                                                if (prevLink?.url) {
                                                    router.visit(prevLink.url);
                                                }
                                            }}
                                            disabled={!leads.links.find((link: any) => link.label === '&laquo; Previous')?.url}
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                                                !leads.links.find((link: any) => link.label === '&laquo; Previous')?.url
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            }`}
                                        >
                                            Prev
                                        </button>
                                    )}
                                    {leads.links.find((link: any) => link.label === 'Next &raquo;') && (
                                        <button
                                            onClick={() => {
                                                const nextLink = leads.links.find((link: any) => link.label === 'Next &raquo;');
                                                if (nextLink?.url) {
                                                    router.visit(nextLink.url);
                                                }
                                            }}
                                            disabled={!leads.links.find((link: any) => link.label === 'Next &raquo;')?.url}
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                                                !leads.links.find((link: any) => link.label === 'Next &raquo;')?.url
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
                                    {leads.meta ? (
                                        `Showing ${leads.meta.from || 0} to ${leads.meta.to || 0} of ${leads.meta.total || 0} results`
                                    ) : (
                                        `Showing ${leads.data.length} leads`
                                    )}
                                </div>
                                <div className="flex space-x-1">
                                    {leads.links.map((link: any, index: number) => (
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

            {/* Quick Update Modal */}
            {showQuickUpdate && selectedLead && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Quick Update - {selectedLead.contact_name}
                            </h3>

                            <div className="space-y-4">
                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={quickUpdateData.priority}
                                        onChange={(e) => setQuickUpdateData({...quickUpdateData, priority: e.target.value})}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        {priorities.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <select
                                        value={quickUpdateData.status}
                                        onChange={(e) => setQuickUpdateData({...quickUpdateData, status: e.target.value})}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">Select Status</option>
                                        {availableStatuses.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={quickUpdateData.description}
                                        onChange={(e) => setQuickUpdateData({...quickUpdateData, description: e.target.value})}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Update description..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowQuickUpdate(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuickUpdate}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
