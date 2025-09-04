import { FormEventHandler, useState } from 'react';
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
    PhotoIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface HAUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
    join_date?: string;
    is_active: boolean;
    manager_id?: number;
    spv_id?: number;
    notes?: string;
    profile_picture?: string;
}

interface Manager {
    id: number;
    name: string;
}

interface Supervisor {
    id: number;
    name: string;
}

interface Props extends PageProps {
    haUser: HAUser;
    managers: Manager[];
    supervisors: Supervisor[];
}

export default function Edit({ auth, haUser, managers, supervisors }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(
        haUser.profile_picture ? `/storage/${haUser.profile_picture}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        name: haUser.name || '',
        email: haUser.email || '',
        password: '',
        password_confirmation: '',
        phone: haUser.phone || '',
        employee_id: haUser.employee_id || '',
        join_date: haUser.join_date || '',
        is_active: haUser.is_active,
        manager_id: haUser.manager_id?.toString() || '',
        spv_id: haUser.spv_id?.toString() || '',
        notes: haUser.notes || '',
        profile_picture: null as File | null,
        remove_profile_picture: false,
        _method: 'PATCH' as string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Log form data before submission
        console.log('Form data before submission:', data);
        console.log('Form errors:', errors);
        console.log('Form processing:', processing);

        // Log each field individually
        console.log('name:', data.name);
        console.log('email:', data.email);
        console.log('phone:', data.phone);
        console.log('manager_id:', data.manager_id);
        console.log('spv_id:', data.spv_id);
        console.log('notes:', data.notes);
        console.log('password:', data.password);
        console.log('profile_picture:', data.profile_picture);

        post(route('ha-management.update', haUser.id), {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_picture', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('profile_picture', null);
        setData('remove_profile_picture', true);
        setPreviewImage(null);
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Edit HA User">
            <Head title={`Edit HA - ${haUser.name}`} />

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
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edit HA User</h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Update {haUser.name}'s information
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                            HA User Information
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Update the Housing Advisor user details.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 space-y-6">
                        {/* Profile Picture */}
                        <div className="border-b border-gray-200 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                                            <PhotoIcon className="h-4 w-4 mr-2" />
                                            Change Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {previewImage && (
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        JPG, PNG, GIF up to 2MB
                                    </p>
                                    {errors.profile_picture && (
                                        <p className="mt-1 text-sm text-red-600">{errors.profile_picture}</p>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                        placeholder="Enter email address"
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

                            {/* Status */}
                            <div>
                                <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="is_active"
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1' ? true : false)}
                                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                {errors.is_active && (
                                    <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">
                                Change Password (Optional)
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Leave blank to keep current password
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                            placeholder="Enter new password"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
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
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
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
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href={route('ha-management.index')}
                                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Updating...' : 'Update HA User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Information Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Update Information</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Changes will be saved immediately upon submission</li>
                        <li>• Password field is optional - leave blank to keep current password</li>
                        <li>• Changing hierarchy may affect lead assignments</li>
                        <li>• Profile picture changes are optional and will replace the current one</li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
