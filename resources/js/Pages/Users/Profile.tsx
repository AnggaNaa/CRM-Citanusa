import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    UserIcon,
    PhotoIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
    profile_picture?: string;
    notes?: string;
}

interface Props extends PageProps {
    user: User;
}

export default function Profile({ auth, user }: Props) {
    const [previewImage, setPreviewImage] = useState<string | null>(
        user.profile_picture ? `/storage/${user.profile_picture}` : null
    );

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        employee_id: user.employee_id || '',
        profile_picture: null as File | null,
        remove_profile_picture: false,
        notes: user.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_picture', file);
            setData('remove_profile_picture', false);

            // Create preview
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
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Profile Management"
        >
            <Head title="Profile Management" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Profile Header */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {previewImage && !data.remove_profile_picture ? (
                                        <img
                                            className="h-16 w-16 rounded-full object-cover"
                                            src={previewImage}
                                            alt="Profile preview"
                                        />
                                    ) : (
                                        <UserIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
                                    <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <form onSubmit={submit} className="p-6 space-y-8">
                            {/* Profile Picture */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                    Profile Picture
                                </h3>
                                <div className="flex items-center space-x-6">
                                    <div className="shrink-0">
                                        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {previewImage && !data.remove_profile_picture ? (
                                                <img
                                                    className="h-20 w-20 rounded-full object-cover"
                                                    src={previewImage}
                                                    alt="Profile preview"
                                                />
                                            ) : (
                                                <UserIcon className="h-10 w-10 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <label htmlFor="profile_picture" className="cursor-pointer">
                                                <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <PhotoIcon className="h-4 w-4 mr-2" />
                                                    Change Photo
                                                </span>
                                                <input
                                                    id="profile_picture"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            {(previewImage || user.profile_picture) && !data.remove_profile_picture && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Upload a new profile picture. Recommended size: 200x200px
                                        </p>
                                        {errors.profile_picture && (
                                            <div className="mt-2 text-sm text-red-600">{errors.profile_picture}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            <UserIcon className="inline h-4 w-4 mr-1" />
                                            Full Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            autoComplete="name"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                        />
                                        {errors.name && (
                                            <div className="mt-2 text-sm text-red-600">{errors.name}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                                            Email Address *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            autoComplete="username"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && (
                                            <div className="mt-2 text-sm text-red-600">{errors.email}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            <PhoneIcon className="inline h-4 w-4 mr-1" />
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                        {errors.phone && (
                                            <div className="mt-2 text-sm text-red-600">{errors.phone}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            <IdentificationIcon className="inline h-4 w-4 mr-1" />
                                            Employee ID
                                        </label>
                                        <input
                                            id="employee_id"
                                            type="text"
                                            name="employee_id"
                                            value={data.employee_id}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('employee_id', e.target.value)}
                                            placeholder="Enter employee ID"
                                            readOnly
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                                        {errors.employee_id && (
                                            <div className="mt-2 text-sm text-red-600">{errors.employee_id}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                    Additional Information
                                </h3>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                        rows={4}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Add any additional information about yourself..."
                                    />
                                    {errors.notes && (
                                        <div className="mt-2 text-sm text-red-600">{errors.notes}</div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
