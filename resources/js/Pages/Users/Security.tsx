import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    KeyIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Props extends PageProps {
    // Add any additional props if needed
}

export default function Security({ auth }: Props) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('password.update'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password),
        ];

        strength = checks.filter(Boolean).length;

        if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
        if (strength <= 3) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
        if (strength <= 4) return { level: 'good', color: 'bg-blue-500', text: 'Good' };
        return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
    };

    const passwordStrength = data.password ? getPasswordStrength(data.password) : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Security Settings</h2>}
        >
            <Head title="Security Settings" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Security Header */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                                    <p className="text-gray-600 mt-1">Manage your password and security preferences</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="current_password"
                                            value={data.current_password}
                                            className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            autoComplete="current-password"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('current_password', e.target.value)}
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.current_password && (
                                        <div className="mt-2 text-sm text-red-600">{errors.current_password}</div>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            autoComplete="new-password"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {data.password && passwordStrength && (
                                        <div className="mt-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{ width: `${(passwordStrength.level === 'weak' ? 20 : passwordStrength.level === 'medium' ? 40 : passwordStrength.level === 'good' ? 60 : passwordStrength.level === 'strong' ? 80 : 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength.level === 'weak' ? 'text-red-600' :
                                                    passwordStrength.level === 'medium' ? 'text-yellow-600' :
                                                    passwordStrength.level === 'good' ? 'text-blue-600' : 'text-green-600'
                                                }`}>
                                                    {passwordStrength.text}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <div className="mt-2 text-sm text-red-600">{errors.password}</div>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password *
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
                                            placeholder="Confirm your new password"
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

                                {/* Password Requirements */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li className="flex items-center space-x-2">
                                            {data.password.length >= 8 ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>At least 8 characters long</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            {/[a-z]/.test(data.password) ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>Contains lowercase letters</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            {/[A-Z]/.test(data.password) ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>Contains uppercase letters</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            {/[0-9]/.test(data.password) ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>Contains numbers</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            {/[^A-Za-z0-9]/.test(data.password) ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>Contains special characters</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => reset()}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h2>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Use a strong password</h3>
                                        <p className="text-sm text-gray-600">Choose a password that's at least 8 characters long and includes a mix of letters, numbers, and special characters.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Keep it private</h3>
                                        <p className="text-sm text-gray-600">Never share your password with anyone, and don't write it down where others can see it.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Update regularly</h3>
                                        <p className="text-sm text-gray-600">Change your password periodically, especially if you suspect it may have been compromised.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Be aware of phishing</h3>
                                        <p className="text-sm text-gray-600">Always verify the URL before entering your password, and be cautious of suspicious emails or links.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
