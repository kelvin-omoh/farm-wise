import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
    FaTachometerAlt, FaShoppingCart, FaUsers, FaChartBar, FaWrench, FaCloudSun,
    FaClipboardList, FaLayerGroup, FaCog, FaSignOutAlt,
    FaLeaf
} from 'react-icons/fa'
// import { Switch } from './ui/Switch'
// import { useState } from 'react'
// import { TestDataToggle } from './TestDataToggle'

const navItems = [
    { id: 'overview', label: 'Overview', icon: FaTachometerAlt, path: '/dashboard' },
    { id: 'devices', label: 'IoT Devices', icon: FaWrench, path: '/dashboard/devices' },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar, path: '/dashboard/analytics' },
    { id: 'weather', label: 'Weather', icon: FaCloudSun, path: '/dashboard/weather' },
    { id: 'tasks', label: 'Tasks', icon: FaClipboardList, path: '/dashboard/tasks' },
    { id: 'marketplace', label: 'Marketplace', icon: FaShoppingCart, path: '/dashboard/marketplace' },
    { id: 'networking', label: 'Networking', icon: FaUsers, path: '/dashboard/networking' },
    { id: 'profile', label: 'Farm Profile', icon: FaLayerGroup, path: '/dashboard/profile' }
]

const Sidebar = () => {
    const location = useLocation()
    const { user, logout } = useAuthStore()

    const name = user?.displayName || 'Farmer'
    const email = user?.email || 'farmer@example.com'

    return (
        <div className="h-screen bg-white border-r border-gray-200 w-64 flex flex-col overflow-hidden">
            {/* Logo and app name */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <Link to="/dashboard" className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
                        <FaLeaf className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-semibold text-primary ml-2">Fermwise</span>
                </Link>
            </div>

            {/* User profile */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {name.charAt(0)}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{name}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>
                </div>

                {/* Data source toggle */}

            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <nav className="px-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`${isActive
                                    ? 'bg-primary bg-opacity-10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                                <item.icon
                                    className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                                        } mr-3 flex-shrink-0 h-5 w-5`}
                                />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Settings and Logout */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <nav className="space-y-1">
                    <Link
                        to="/dashboard/settings"
                        className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    >
                        <FaCog className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
                        Settings
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full text-left text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    >
                        <FaSignOutAlt className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
                        Sign Out
                    </button>
                </nav>
            </div>
        </div>
    )
}

export default Sidebar 