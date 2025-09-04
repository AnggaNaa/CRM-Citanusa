import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User, Lead, LeadFormData } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    lead: Lead;
    availableUsers: User[];
    priorities: string[];
    leadSources: string[];
    projects: string[];
    unitTypes: string[];
}

export default function Edit({ auth, lead, availableUsers, priorities, leadSources, projects, unitTypes }: Props) {
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    const [availableUnitTypes, setAvailableUnitTypes] = useState<string[]>(unitTypes);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

    const { data, setData, put, processing, errors } = useForm<LeadFormData>({
        description: lead.description || '',
        priority: lead.priority,
        status: lead.status || '',
        notes: lead.notes || '',
        project: lead.project || '',
        unit_type: lead.unit_type || '',
        unit_no: lead.unit_no || '',
        estimated_value: lead.estimated_value,
        expected_closing_date: lead.expected_closing_date || '',
        source: lead.source || '',
        contact_name: lead.contact_name || '',
        contact_email: lead.contact_email || '',
        contact_phone: lead.contact_phone || '',
        contact_address: lead.contact_address || '',
        contact_company: lead.contact_company || '',
        contact_position: lead.contact_position || '',
        assigned_to: lead.assigned_to?.id,
    });

    // Update available statuses when priority changes
    useEffect(() => {
        if (data.priority) {
            fetch(`/api/leads/statuses-by-priority?priority=${encodeURIComponent(data.priority)}`)
                .then(response => response.json())
                .then(statusList => {
                    setAvailableStatuses(statusList);
                    // Reset status if it's not available in new priority
                    if (statusList.length > 0 && !statusList.includes(data.status)) {
                        setData(prevData => ({
                            ...prevData,
                            status: ''
                        }));
                    }
                })
                .catch(() => setAvailableStatuses([]));
        } else {
            setAvailableStatuses([]);
        }
    }, [data.priority]);

    // Set initial available statuses on component mount
    useEffect(() => {
        if (lead.priority) {
            fetch(`/api/leads/statuses-by-priority?priority=${encodeURIComponent(lead.priority)}`)
                .then(response => response.json())
                .then(statusList => {
                    setAvailableStatuses(statusList);
                })
                .catch(() => setAvailableStatuses([]));
        }
    }, []);

    // Fetch available unit types when project changes
    useEffect(() => {
        if (data.project) {
            fetch(`/api/leads/unit-types-by-project?project=${encodeURIComponent(data.project)}`)
                .then(response => response.json())
                .then(types => {
                    setAvailableUnitTypes(types);
                    // Reset unit_type and unit_no when project changes
                    if (!types.includes(data.unit_type)) {
                        setData(prevData => ({
                            ...prevData,
                            unit_type: '',
                            unit_no: ''
                        }));
                    }
                })
                .catch(() => setAvailableUnitTypes([]));
        } else {
            setAvailableUnitTypes(unitTypes);
            setData(prevData => ({
                ...prevData,
                unit_type: '',
                unit_no: ''
            }));
        }
    }, [data.project]);

    // Fetch available units when project or unit_type changes
    useEffect(() => {
        if (data.project && data.unit_type) {
            fetch(`/api/leads/units?project=${encodeURIComponent(data.project)}&unit_type=${encodeURIComponent(data.unit_type)}`)
                .then(response => response.json())
                .then(units => {
                    setAvailableUnits(units.map((unit: any) => unit.unit_no));
                })
                .catch(() => setAvailableUnits([]));
        } else {
            setAvailableUnits([]);
        }
    }, [data.project, data.unit_type]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('leads.update', lead.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={`Edit Lead: ${lead.contact_name}`}
        >
            <Head title={`Edit Lead: ${lead.contact_name} - NUSA CRM`} />

            <div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with Back Button */}
                    <div className="mb-6">
                        <Link
                            href={route('leads.index')}
                            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Leads
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                        <form onSubmit={submit} className="p-6 space-y-8">
                            {/* Contact Information - Priority for Leads */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_name}
                                            onChange={(e) => setData('contact_name', e.target.value)}
                                            required
                                            placeholder="Enter contact name"
                                        />
                                        {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                        {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Company
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_company}
                                            onChange={(e) => setData('contact_company', e.target.value)}
                                            placeholder="Company name"
                                        />
                                        {errors.contact_company && <p className="mt-1 text-sm text-red-600">{errors.contact_company}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Position
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_position}
                                            onChange={(e) => setData('contact_position', e.target.value)}
                                            placeholder="Job title"
                                        />
                                        {errors.contact_position && <p className="mt-1 text-sm text-red-600">{errors.contact_position}</p>}
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Address
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.contact_address}
                                            onChange={(e) => setData('contact_address', e.target.value)}
                                            placeholder="Full address..."
                                        />
                                        {errors.contact_address && <p className="mt-1 text-sm text-red-600">{errors.contact_address}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Lead Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    Lead Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the lead details..."
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority *
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value as any)}
                                            required
                                        >
                                            {priorities.map((priority) => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {availableStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assigned To
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.assigned_to || ''}
                                            onChange={(e) => setData('assigned_to', e.target.value ? parseInt(e.target.value) : undefined)}
                                        >
                                            <option value="">Unassigned</option>
                                            {availableUsers.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.roles?.join(', ')})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.assigned_to && <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Project & Unit Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    Project & Unit Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.project}
                                            onChange={(e) => setData('project', e.target.value)}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map((project) => (
                                                <option key={project} value={project}>
                                                    {project}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.project && <p className="mt-1 text-sm text-red-600">{errors.project}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Type
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.unit_type}
                                            onChange={(e) => setData('unit_type', e.target.value)}
                                        >
                                            <option value="">Select Unit Type</option>
                                            {availableUnitTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unit_type && <p className="mt-1 text-sm text-red-600">{errors.unit_type}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Number
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50"
                                            value={data.unit_no}
                                            onChange={(e) => setData('unit_no', e.target.value)}
                                            disabled={!data.project || !data.unit_type}
                                        >
                                            <option value="">
                                                {!data.project || !data.unit_type
                                                    ? 'Select Project & Unit Type first'
                                                    : 'Select Unit Number'
                                                }
                                            </option>
                                            {availableUnits.map((unitNo) => (
                                                <option key={unitNo} value={unitNo}>
                                                    Unit {unitNo}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unit_no && <p className="mt-1 text-sm text-red-600">{errors.unit_no}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estimated Value
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                value={data.estimated_value || ''}
                                                onChange={(e) => setData('estimated_value', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.estimated_value && <p className="mt-1 text-sm text-red-600">{errors.estimated_value}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expected Closing Date
                                        </label>
                                        <input
                                            type="date"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.expected_closing_date}
                                            onChange={(e) => setData('expected_closing_date', e.target.value)}
                                        />
                                        {errors.expected_closing_date && <p className="mt-1 text-sm text-red-600">{errors.expected_closing_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Source
                                        </label>
                                        <select
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={data.source}
                                            onChange={(e) => setData('source', e.target.value)}
                                        >
                                            <option value="">Select Source</option>
                                            {leadSources.map((source) => (
                                                <option key={source} value={source}>
                                                    {source.replace('_', ' ').charAt(0).toUpperCase() + source.replace('_', ' ').slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    Additional Notes
                                </h3>
                                <textarea
                                    rows={4}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes, follow-up requirements, special considerations..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('leads.index')}
                                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Lead'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
