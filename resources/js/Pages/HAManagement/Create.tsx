import { FormEventHandler } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    UserIcon,
    ArrowLeftIcon,
    PhoneIcon,
    EnvelopeIcon,
    IdentificationIcon,
    CalendarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Manager {
    id: number;
    name: string;
}

interface Supervisor {
    id: number;
    name: string;
}

interface Props extends PageProps {
    managers: Manager[];
    supervisors: Supervisor[];
}

export default function Create({ auth, managers, supervisors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        employee_id: '',
        join_date: '',
        manager_id: '',
        spv_id: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('ha-management.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Create New HA">
            <Head title="Create HA User" />

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
                                <span className="hidden sm:inline">Back to HA Management</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create New HA User</h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Add a new Housing Advisor to the system
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                            HA User Information
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Fill in the details for the new Housing Advisor user.
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-4 md:px-6 py-4 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="Enter full name"
                                        required
                                    />
                                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="e.g., +62 812 3456 7890"
                                    />
                                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>
                                <div className="relative">
                                    <input
                                        id="employee_id"
                                        type="text"
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="e.g., EMP001"
                                    />
                                    <IdentificationIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.employee_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
                                )}
                            </div>

                            {/* Join Date */}
                            <div>
                                <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Join Date
                                </label>
                                <div className="relative">
                                    <input
                                        id="join_date"
                                        type="date"
                                        value={data.join_date}
                                        onChange={(e) => setData('join_date', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                    />
                                    <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.join_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.join_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">
                                Account Access
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="Enter password"
                                        required
                                        minLength={8}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy Assignment */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
                                Hierarchy Assignment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Manager */}
                                <div>
                                    <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Manager
                                    </label>
                                    <select
                                        id="manager_id"
                                        value={data.manager_id}
                                        onChange={(e) => setData('manager_id', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                    >
                                        <option value="">Select a Manager</option>
                                        {managers.map((manager) => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.manager_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.manager_id}</p>
                                    )}
                                </div>

                                {/* Supervisor */}
                                <div>
                                    <label htmlFor="spv_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Supervisor (SPV)
                                    </label>
                                    <select
                                        id="spv_id"
                                        value={data.spv_id}
                                        onChange={(e) => setData('spv_id', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                    >
                                        <option value="">Select a Supervisor</option>
                                        {supervisors.map((supervisor) => (
                                            <option key={supervisor.id} value={supervisor.id}>
                                                {supervisor.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.spv_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.spv_id}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="border-t border-gray-200 pt-6">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm resize-none"
                                    placeholder="Any additional notes about this HA user..."
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href={route('ha-management.index')}
                                    className="inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : 'Create HA User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Important Information</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• This user will be assigned the HA (Housing Advisor) role automatically</li>
                        <li>• HA users can only view and manage leads assigned to them</li>
                        <li>• Manager and Supervisor assignments determine the hierarchy for lead distribution</li>
                        <li>• The user will receive login credentials via email (if email notifications are enabled)</li>
                        <li>• HA users will have basic permissions to view leads and update their own profile</li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
