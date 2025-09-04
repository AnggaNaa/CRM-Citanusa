import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    UserIcon,
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

interface Role {
    id: number;
    name: string;
    display_name?: string;
}

interface Props extends PageProps {
    roles: Role[];
    departments: string[];
    positions: string[];
}

export default function Create({ auth, roles, departments, positions }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        employee_id: '',
        department: '',
        position: '',
        join_date: '',
        roles: [] as number[],
        profile_picture: null as File | null,
        is_active: true,
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Append all form data
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            if (key === 'roles') {
                // Handle roles array
                (value as number[]).forEach((roleId, index) => {
                    formData.append(`roles[${index}]`, roleId.toString());
                });
            } else if (key === 'profile_picture' && value) {
                formData.append(key, value as File);
            } else if (key === 'is_active') {
                formData.append(key, value ? '1' : '0');
            } else if (value !== null) {
                // Include all fields except null, empty strings are allowed
                formData.append(key, value.toString());
            }
        });

        post(route('users.store'), {
            forceFormData: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_picture', file);

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
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={"Create New User"}
        >
            <Head title="Create New User" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
                                    <p className="text-gray-600 mt-1">Add a new user to the system</p>
                                </div>
                                <Link
                                    href={route('users.index')}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    Back to Users
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-8">
                            {/* Profile Picture */}
                            <div className="flex items-center space-x-6">
                                <div className="shrink-0">
                                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {previewImage ? (
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
                                                Choose Photo
                                            </span>
                                            <input
                                                id="profile_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        {previewImage && (
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
                                        Upload a profile picture. Recommended size: 200x200px
                                    </p>
                                    {errors.profile_picture && (
                                        <div className="mt-2 text-sm text-red-600">{errors.profile_picture}</div>
                                    )}
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        autoComplete="name"
                                        autoFocus
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && (
                                        <div className="mt-2 text-sm text-red-600">{errors.name}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        Employee ID
                                    </label>
                                    <input
                                        id="employee_id"
                                        type="text"
                                        name="employee_id"
                                        value={data.employee_id}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('employee_id', e.target.value)}
                                        placeholder="Enter employee ID"
                                    />
                                    {errors.employee_id && (
                                        <div className="mt-2 text-sm text-red-600">{errors.employee_id}</div>
                                    )}
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Password Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                autoComplete="new-password"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div className="mt-2 text-sm text-red-600">{errors.password}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                autoComplete="new-password"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            >
                                                {showPasswordConfirmation ? (
                                                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <div className="mt-2 text-sm text-red-600">{errors.password_confirmation}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Employment Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={data.department}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('department', e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        {errors.department && (
                                            <div className="mt-2 text-sm text-red-600">{errors.department}</div>
                                        )}
                                    </div> */}

                                    {/* <div>
                                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                                            Position
                                        </label>
                                        <select
                                            id="position"
                                            name="position"
                                            value={data.position}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('position', e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        >
                                            <option value="">Select Position</option>
                                            {positions.map((pos) => (
                                                <option key={pos} value={pos}>{pos}</option>
                                            ))}
                                        </select>
                                        {errors.position && (
                                            <div className="mt-2 text-sm text-red-600">{errors.position}</div>
                                        )}
                                    </div> */}

                                    <div>
                                        <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-2">
                                            Join Date
                                        </label>
                                        <input
                                            id="join_date"
                                            type="date"
                                            name="join_date"
                                            value={data.join_date}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('join_date', e.target.value)}
                                        />
                                        {errors.join_date && (
                                            <div className="mt-2 text-sm text-red-600">{errors.join_date}</div>
                                        )}
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">User is active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Roles & Permissions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Roles & Permissions *
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {roles.map((role) => (
                                        <label key={role.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.roles.includes(role.id)}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRoleChange(role.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 capitalize">
                                                {role.display_name || role.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <div className="mt-2 text-sm text-red-600">{errors.roles}</div>
                                )}
                                {data.roles.length === 0 && (
                                    <p className="text-sm text-yellow-600">Please select at least one role for the user.</p>
                                )}
                            </div>

                            {/* Notes */}
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
                                    placeholder="Add any notes about this user..."
                                />
                                {errors.notes && (
                                    <div className="mt-2 text-sm text-red-600">{errors.notes}</div>
                                )}
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
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
