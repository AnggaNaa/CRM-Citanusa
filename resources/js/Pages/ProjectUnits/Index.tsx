import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, ProjectUnit } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    HomeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Props extends PageProps {
    units: {
        data: ProjectUnit[];
        links: any[];
        meta: any;
    };
    filters: {
        project?: string;
        unit_type?: string;
        status?: string;
        search?: string;
    };
    projects: string[];
    unitTypes: string[];
    statuses: string[];
}

export default function Index({ auth, units, filters, projects, unitTypes, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [project, setProject] = useState(filters.project || '');
    const [unitType, setUnitType] = useState(filters.unit_type || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(false);

    const statusIcons = {
        'available': CheckCircleIcon,
        'reserved': ClockIcon,
        'sold': XCircleIcon,
        'blocked': ExclamationTriangleIcon
    };

    const statusColors = {
        'available': 'bg-green-50 text-green-700 border-green-200',
        'reserved': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'sold': 'bg-red-50 text-red-700 border-red-200',
        'blocked': 'bg-gray-50 text-gray-700 border-gray-200'
    };

    const handleFilter = () => {
        router.get('/project-units', {
            search,
            project,
            unit_type: unitType,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setProject('');
        setUnitType('');
        setStatus('');
        router.get('/project-units', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const deleteUnit = (id: number) => {
        if (confirm('Are you sure you want to delete this project unit?')) {
            router.delete(`/project-units/${id}`);
        }
    };

    const getStatusIcon = (status: string) => {
        const Icon = statusIcons[status as keyof typeof statusIcons];
        return Icon ? <Icon className="h-4 w-4" /> : null;
    };

    const formatPrice = (price: number | null) => {
        if (!price) return 'Not set';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Project Units Management"
        >
            <Head title="Project Units - NUSA CRM" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Project Units Management</h1>
                        <p className="text-gray-600 mt-1">Manage all available project units and their status</p>
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
                            href="/project-units/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add New Unit
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
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
                                        placeholder="Search units..."
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
                                    {unitTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
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
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
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

                {/* Units Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Available</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {units.data.filter(unit => unit.status === 'available').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-8 w-8 text-yellow-500" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Reserved</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {units.data.filter(unit => unit.status === 'reserved').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Sold</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {units.data.filter(unit => unit.status === 'sold').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Total Units</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {units.meta?.total || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Units Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Project Units ({units.meta?.total || 0})
                        </h2>
                    </div>

                    {units.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project & Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Number
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {units.data.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                        {unit.project}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                                        <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                        {unit.unit_type}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {unit.unit_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[unit.status as keyof typeof statusColors]}`}>
                                                    {getStatusIcon(unit.status)}
                                                    <span className="ml-1 capitalize">{unit.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatPrice(unit.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {unit.size ? `${unit.size} m²` : 'Not set'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/project-units/${unit.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                        title="View"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/project-units/${unit.id}/edit`}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteUnit(unit.id)}
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
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <BuildingOfficeIcon className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project unit.</p>
                            <div className="mt-6">
                                <Link
                                    href="/project-units/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add New Unit
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {units.data.length > 0 && units.meta?.links && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {units.meta.from} to {units.meta.to} of {units.meta.total} results
                                </div>
                                <div className="flex space-x-1">
                                    {units.links.map((link: any, index: number) => (
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
        </AuthenticatedLayout>
    );
}
