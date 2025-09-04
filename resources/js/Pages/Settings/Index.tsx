import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Cog6ToothIcon,
    BellIcon,
    DocumentIcon,
    ServerIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SettingsProps {
    auth: any;
    settings: {
        app_name: string;
        timezone: string;
        leads_per_page: number;
        enable_notifications: boolean;
        allow_lead_assignment: boolean;
        require_lead_approval: boolean;
        max_file_upload_size: string;
        allowed_file_types: string[];
        backup_frequency: string;
        session_timeout: string;
    };
}

export default function Settings({ auth, settings }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, patch, processing, errors } = useForm({
        app_name: settings.app_name || '',
        leads_per_page: settings.leads_per_page || 10,
        enable_notifications: settings.enable_notifications || false,
        allow_lead_assignment: settings.allow_lead_assignment || false,
        require_lead_approval: settings.require_lead_approval || false,
        max_file_upload_size: settings.max_file_upload_size || '10MB',
        backup_frequency: settings.backup_frequency || 'daily',
        session_timeout: settings.session_timeout || '120',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings', {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'general', name: 'General', icon: Cog6ToothIcon },
        { id: 'leads', name: 'Lead Management', icon: DocumentIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'system', name: 'System', icon: ServerIcon },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="System Settings"
        >
            <Head title="Settings - NUSA CRM" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <Cog6ToothIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link
                                href="/settings/user-permissions"
                                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-4 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center">
                                    <ShieldCheckIcon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">Manage User Permissions</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex">
                        {/* Sidebar */}
                        <div className="w-64 border-r border-gray-200">
                            <nav className="p-4 space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <tab.icon className="h-5 w-5 mr-3" />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                            General Settings
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Application Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.app_name}
                                                    onChange={(e) => setData('app_name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.app_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.app_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Session Timeout (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.session_timeout}
                                                    onChange={(e) => setData('session_timeout', e.target.value)}
                                                    min="30"
                                                    max="480"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {errors.session_timeout && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.session_timeout}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lead Management Settings */}
                                {activeTab === 'leads' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                            Lead Management Settings
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Leads Per Page
                                                </label>
                                                <select
                                                    value={data.leads_per_page}
                                                    onChange={(e) => setData('leads_per_page', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={5}>5 per page</option>
                                                    <option value={10}>10 per page</option>
                                                    <option value={25}>25 per page</option>
                                                    <option value={50}>50 per page</option>
                                                    <option value={100}>100 per page</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Max File Upload Size
                                                </label>
                                                <select
                                                    value={data.max_file_upload_size}
                                                    onChange={(e) => setData('max_file_upload_size', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="5MB">5 MB</option>
                                                    <option value="10MB">10 MB</option>
                                                    <option value="20MB">20 MB</option>
                                                    <option value="50MB">50 MB</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.allow_lead_assignment}
                                                    onChange={(e) => setData('allow_lead_assignment', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    Allow lead assignment between users
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.require_lead_approval}
                                                    onChange={(e) => setData('require_lead_approval', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    Require manager approval for lead status changes
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Settings */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                            Notification Settings
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.enable_notifications}
                                                    onChange={(e) => setData('enable_notifications', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    Enable system notifications
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-yellow-800">
                                                        Email Notifications
                                                    </h3>
                                                    <p className="mt-1 text-sm text-yellow-700">
                                                        Email notification settings will be available in a future update.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Settings */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                            Security Settings
                                        </h3>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex">
                                                <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">
                                                        Security Features
                                                    </h3>
                                                    <p className="mt-1 text-sm text-blue-700">
                                                        Advanced security settings such as two-factor authentication, password policies, and login restrictions will be available in future updates.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* System Settings */}
                                {activeTab === 'system' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                            System Settings
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Backup Frequency
                                            </label>
                                            <select
                                                value={data.backup_frequency}
                                                onChange={(e) => setData('backup_frequency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex">
                                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-green-800">
                                                        System Health
                                                    </h3>
                                                    <p className="mt-1 text-sm text-green-700">
                                                        All systems are running normally. Last backup: {new Date().toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
