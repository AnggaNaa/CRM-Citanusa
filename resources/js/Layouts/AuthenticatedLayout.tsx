import { Fragment, useState } from 'react';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    BellIcon,
    HomeIcon,
    UsersIcon,
    XMarkIcon,
    Cog6ToothIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    DocumentChartBarIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        // Dashboard available to all users by default
        permission: null
    },
    {
        name: 'Leads Management',
        href: '/leads',
        icon: ClipboardDocumentListIcon,
        permission: 'view_leads'
    },
    {
        name: 'User Management',
        href: '/users',
        icon: UserGroupIcon,
        roles: ['superadmin', 'director'], // Only superadmin and director can see full user management
        permission: null
    },
    {
        name: 'HA Management',
        href: '/ha-management',
        icon: UsersIcon,
        permission: 'create_users' // Users with create_users permission can manage HA
    },
    {
        name: 'Reports & Analytics',
        href: '/reports',
        icon: DocumentChartBarIcon,
        permission: 'view_reports'
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Cog6ToothIcon,
        roles: ['superadmin', 'director'], // Superadmin and Director
        permission: null
    },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    user?: any;
}

export default function AuthenticatedLayout({ children, header, user }: AuthenticatedLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { auth, url } = usePage<PageProps>().props;
    const currentUser = user || auth.user;

    // Get user role for filtering navigation
    const userRole = currentUser?.roles?.[0] || currentUser?.role || 'ha';

    // Filter navigation based on permissions and roles
    const filteredNavigation = navigation.filter(item => {
        // Superadmin and Director can see everything
        if (userRole === 'superadmin' || userRole === 'director') {
            return true;
        }

        // Dashboard is available to everyone
        if (item.name === 'Dashboard') {
            return true;
        }

        // Check role-based access for specific items
        if (item.roles && item.roles.length > 0) {
            const hasRoleAccess = item.roles.includes(userRole);
            if (!hasRoleAccess) {
                return false;
            }
        }

        // Check permission-based access
        if (item.permission) {
            const userPermissions = currentUser?.permissions || [];
            const rolePermissions = currentUser?.role_permissions || [];
            const allPermissions = [...userPermissions, ...rolePermissions];

            const hasPermission = allPermissions.some(permission =>
                permission.name === item.permission || permission === item.permission
            );

            return hasPermission;
        }

        // If no specific permission required and role check passed, allow access
        return true;
    });

    // Check if current page matches navigation item
    const isCurrentPage = (href: string) => {
        if (href === '/dashboard' && url === '/') return true;
        return typeof url === 'string' && url.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button
                                            type="button"
                                            className="-m-2.5 p-2.5"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>

                                {/* Mobile Sidebar Content */}
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
                                    <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">NC</span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <h1 className="text-lg font-bold text-gray-900">NUSA CRM</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-1">
                                                    {filteredNavigation.map((item) => (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                className={classNames(
                                                                    isCurrentPage(item.href)
                                                                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
                                                                    'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-colors duration-200'
                                                                )}
                                                            >
                                                                <item.icon
                                                                    className={classNames(
                                                                        isCurrentPage(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                                        'h-5 w-5 shrink-0'
                                                                    )}
                                                                    aria-hidden="true"
                                                                />
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg border-r border-gray-200">
                    <div className="flex h-16 shrink-0 items-center border-b border-gray-200 justify-between">
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">NC</span>
                                </div>
                            </div>
                            {!sidebarCollapsed && (
                                <div className="ml-4">
                                    <h1 className="text-xl font-bold text-gray-900">NUSA CRM</h1>
                                    <p className="text-xs text-gray-500">Lead Management System</p>
                                </div>
                            )}
                        </div>
                        {/* <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <svg
                                className={`h-5 w-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button> */}
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-2">
                                    {filteredNavigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={classNames(
                                                    isCurrentPage(item.href)
                                                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 shadow-sm'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
                                                    'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 hover:shadow-sm',
                                                    sidebarCollapsed ? 'justify-center' : ''
                                                )}
                                                title={sidebarCollapsed ? item.name : ''}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        isCurrentPage(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                        'h-6 w-6 shrink-0'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {!sidebarCollapsed && item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>

                            {/* User info at bottom */}
                            <li className="mt-auto">
                                <div className={`bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
                                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                                        <div className="flex-shrink-0">
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        {!sidebarCollapsed && (
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {currentUser?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {userRole.toUpperCase()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content area */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {/* Top navbar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="rounded-lg text-gray-400  transition-colors duration-200 hidden lg:block"
                            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <svg
                                className={`h-5 w-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="relative flex flex-1 items-center">
                            {header && (
                                <h1 className="text-xl font-semibold leading-6 text-gray-900">
                                    {header}
                                </h1>
                            )}
                        </div>

                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Notifications */}
                            <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                                <span className="sr-only">View notifications</span>
                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                            </button>

                            {/* Separator */}
                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                            {/* Profile dropdown */}
                            <Menu as="div" className="relative">
                                <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                    <span className="sr-only">Open user menu</span>
                                    {currentUser?.profile_picture ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={`/storage/${user?.profile_picture}`}
                                            alt={user?.name}
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-gray-400" />

                                    )}
                                    <span className="hidden lg:flex lg:items-center">
                                        <span className="ml-2 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                                            {currentUser?.name}
                                        </span>
                                        <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href="/profile"
                                                    className={classNames(
                                                        active ? 'bg-gray-50' : '',
                                                        'block px-3 py-1 text-sm leading-6 text-gray-900'
                                                    )}
                                                >
                                                    Your profile
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href="/security"
                                                    className={classNames(
                                                        active ? 'bg-gray-50' : '',
                                                        'block px-3 py-1 text-sm leading-6 text-gray-900'
                                                    )}
                                                >
                                                    Change Password
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={classNames(
                                                        active ? 'bg-gray-50' : '',
                                                        'block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900'
                                                    )}
                                                >
                                                    Sign out
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
