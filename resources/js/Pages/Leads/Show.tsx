import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Lead, LeadHistory, LeadAttachment } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PencilIcon, ArrowLeftIcon, CalendarIcon, UserIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    lead: Lead & {
        histories: LeadHistory[];
        attachments: LeadAttachment[];
    };
}

export default function Show({ lead }: Props) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'cold': return 'bg-blue-100 text-blue-800';
            case 'warm': return 'bg-yellow-100 text-yellow-800';
            case 'hot': return 'bg-orange-100 text-orange-800';
            case 'booking': return 'bg-purple-100 text-purple-800';
            case 'closing': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout header={`Lead: ${lead.contact_name}`}>
            <Head title={`Lead: ${lead.contact_name}`} />

            <div>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('leads.index')}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Back to Leads
                            </Link>
                        </div>
                        <Link
                            href={route('leads.edit', lead.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Lead
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Lead Information */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{lead.contact_name}</h1>
                                        <div className="flex items-center space-x-3 mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                                                {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Status: {lead.status?.replace('_', ' ').charAt(0).toUpperCase() + (lead.status?.replace('_', ' ').slice(1) || '')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p><span className="font-medium">Created:</span> {formatDate(lead.created_at)}</p>
                                        <p><span className="font-medium">Updated:</span> {formatDate(lead.updated_at)}</p>
                                    </div>
                                </div>

                                {lead.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-700 whitespace-pre-line">{lead.description}</p>
                                    </div>
                                )}

                                {/* Project Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Project</dt>
                                                <dd className="text-sm text-gray-900">{lead.project || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Unit Type</dt>
                                                <dd className="text-sm text-gray-900">{lead.unit_type || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Unit Number</dt>
                                                <dd className="text-sm text-gray-900">{lead.unit_no || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Source</dt>
                                                <dd className="text-sm text-gray-900">{lead.source?.replace('_', ' ') || '-'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial</h3>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Estimated Value</dt>
                                                <dd className="text-sm text-gray-900">{formatCurrency(lead.estimated_value)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Expected Closing Date</dt>
                                                <dd className="text-sm text-gray-900 flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    {formatDate(lead.expected_closing_date)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                {lead.notes && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                                        <p className="text-gray-700 whitespace-pre-line">{lead.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">{lead.contact_name}</span>
                                        </div>
                                        {lead.contact_email && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                                <a href={`mailto:${lead.contact_email}`} className="text-indigo-600 hover:text-indigo-800">
                                                    {lead.contact_email}
                                                </a>
                                            </div>
                                        )}
                                        {lead.contact_phone && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-400" />
                                                <a href={`tel:${lead.contact_phone}`} className="text-indigo-600 hover:text-indigo-800">
                                                    {lead.contact_phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {lead.contact_company && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                                <span className="text-gray-900">{lead.contact_company}</span>
                                            </div>
                                        )}
                                        {lead.contact_position && (
                                            <p className="text-sm text-gray-600 mb-2">{lead.contact_position}</p>
                                        )}
                                        {lead.contact_address && (
                                            <p className="text-sm text-gray-600">{lead.contact_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Assignment */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment</h3>
                                <div className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                                        <dd className="text-sm text-gray-900">{lead?.assigned_user?.name || 'Unassigned'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                        <dd className="text-sm text-gray-900">{lead?.creator?.name}</dd>
                                    </div>
                                    {lead.manager && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Manager</dt>
                                            <dd className="text-sm text-gray-900">{lead.manager.name}</dd>
                                        </div>
                                    )}
                                    {lead.spv && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">SPV</dt>
                                            <dd className="text-sm text-gray-900">{lead.spv.name}</dd>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lead History */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Lead History</h3>
                                <div className="space-y-6">
                                    {lead.histories && lead.histories.length > 0 ? (
                                        lead.histories.map((history, index) => (
                                            <div key={history.id} className="relative">
                                                {/* Timeline line */}
                                                {index !== lead.histories.length - 1 && (
                                                    <div className="absolute left-4 top-8 h-full w-px bg-gray-200"></div>
                                                )}

                                                <div className="flex items-start space-x-4">
                                                    {/* Timeline dot */}
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                                                    {history.description}
                                                                </p>
                                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                                    {formatDate(history.created_at)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <span className="font-medium">By</span>
                                                                <span className="ml-1 text-gray-700 font-medium">
                                                                    {history.creator?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-500">No history available</p>
                                            <p className="text-xs text-gray-400 mt-1">Activity will appear here as the lead progresses</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attachments */}
                            {lead.attachments && lead.attachments.length > 0 && (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                                    <div className="space-y-2">
                                        {lead.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{attachment.original_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Uploaded by {attachment.uploaded_by.name} on {formatDate(attachment.created_at)}
                                                    </p>
                                                </div>
                                                <a
                                                    href={`/storage/${attachment.file_path}`}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
