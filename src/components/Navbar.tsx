import { Link } from 'react-router-dom'
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuthStore } from '../stores/authStore'
import { Menu } from '@headlessui/react'

const Navbar = () => {
    const { user, logout } = useAuthStore()

    return (
        <nav className="fixed w-full bg-white border-b border-gray-200 z-30">
            <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.jpeg" alt="Logo" className="h-8 w-8" />
                        <span className="text-xl font-semibold text-primary">FermWise</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button className="btn btn-ghost btn-circle">
                            <FaBell className="h-5 w-5" />
                        </button>

                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FaUser className="text-primary" />
                                </div>
                                <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                            </Menu.Button>

                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                <Menu.Item>
                                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Profile Settings
                                    </Link>
                                </Menu.Item>
                                <Menu.Item>
                                    <button
                                        onClick={() => logout()}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                    >
                                        <FaSignOutAlt /> Sign Out
                                    </button>
                                </Menu.Item>
                            </Menu.Items>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar 