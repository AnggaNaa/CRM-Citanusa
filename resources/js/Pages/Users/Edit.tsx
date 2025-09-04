import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
    department?: string;
    position?: string;
    join_date?: string;
    leave_date?: string;
    is_active: boolean;
    profile_picture?: string;
    notes?: string;
    roles: Role[];
}

interface Props extends PageProps {
    user: User;
    roles: Role[];
    departments: string[];
    positions: string[];
}

export default function Edit({ auth, user, roles, departments, positions }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(
        user.profile_picture ? `/storage/${user.profile_picture}` : null
    );

    const { data, setData, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        employee_id: user.employee_id || '',
        department: user.department || '',
        position: user.position || '',
        join_date: user.join_date || '',
        leave_date: user.leave_date || '',
        roles: user.roles.map(role => role.id) || [],
        profile_picture: null as File | null,
        remove_profile_picture: false,
        is_active: user.is_active,
        notes: user.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Prepare the complete form data object
        const submitData: any = {
            name: data.name || user.name || '',
            email: data.email || user.email || '',
            phone: data.phone || user.phone || '',
            employee_id: data.employee_id || user.employee_id || '',
            department: data.department || user.department || '',
            position: data.position || user.position || '',
            join_date: data.join_date || user.join_date || '',
            leave_date: data.leave_date || user.leave_date || '',
            is_active: data.is_active !== undefined ? data.is_active : user.is_active,
            notes: data.notes || user.notes || '',
            remove_profile_picture: data.remove_profile_picture || false,
            roles: data.roles.length > 0 ? data.roles : user.roles.map(role => role.id),
        };

        // Only include profile_picture if a new file is selected
        if (data.profile_picture instanceof File) {
            submitData.profile_picture = data.profile_picture;
        }

        // Add password fields only if provided
        if (data.password && data.password.trim() !== '') {
            submitData.password = data.password;
            submitData.password_confirmation = data.password_confirmation;
        }

        // Debug log
        console.log('Submitting data:', submitData);
        console.log('Has profile picture:', data.profile_picture instanceof File);

        // Use Inertia router for proper CSRF handling and file uploads
        router.post(route('users.update', user.id), {
            ...submitData,
            _method: 'PATCH'
        }, {
            forceFormData: true,
            onSuccess: () => {
                console.log('User updated successfully');
                alert('✅ User updated successfully!');
                // Optional: redirect after success
                // window.location.href = route('users.index');
            },
            onError: (errors) => {
                console.log('Update errors:', errors);

                // Show specific error messages
                let errorMessage = '❌ Failed to update user:\n\n';
                Object.keys(errors).forEach(key => {
                    if (Array.isArray(errors[key])) {
                        errorMessage += `• ${key}: ${errors[key].join(', ')}\n`;
                    } else {
                        errorMessage += `• ${key}: ${errors[key]}\n`;
                    }
                });

                alert(errorMessage);
            }
        });
    };    const handleRoleChange = (roleId: number, checked: boolean) => {
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
            header={`Edit User - ${user.name}`}
        >
            <Head title={`Edit User - ${user.name}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                                    <p className="text-gray-600 mt-1">Update user information and settings</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href={route('users.show', user.id)}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        View Profile
                                    </Link>
                                    <Link
                                        href={route('users.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Back to Users
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-8">
                            {/* Profile Picture */}
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
                                    Change Password (Optional)
                                </h3>
                                <p className="text-sm text-gray-600">Leave blank to keep current password</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
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
                                                placeholder="Enter new password"
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
                                            Confirm New Password
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
                                                placeholder="Confirm new password"
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
                                            {departments?.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        {errors.department && (
                                            <div className="mt-2 text-sm text-red-600">{errors.department}</div>
                                        )}
                                    </div>

                                    <div>
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
                                            {positions?.map((pos) => (
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

                                    <div>
                                        <label htmlFor="leave_date" className="block text-sm font-medium text-gray-700 mb-2">
                                            Leave Date (if applicable)
                                        </label>
                                        <input
                                            id="leave_date"
                                            type="date"
                                            name="leave_date"
                                            value={data.leave_date}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('leave_date', e.target.value)}
                                        />
                                        {errors.leave_date && (
                                            <div className="mt-2 text-sm text-red-600">{errors.leave_date}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center pt-4">
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
                                    {processing ? 'Updating...' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
