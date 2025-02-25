import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

    // Handle window resize to detect mobile/desktop
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024)
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false) // Close mobile sidebar when switching to desktop
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex relative">
                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        className="fixed bottom-4 right-4 z-50 bg-primary text-white p-4 rounded-full shadow-lg"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                    >
                        {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                    </button>
                )}

                {/* Sidebar - Fixed on desktop, slide-in on mobile */}
                <div
                    className={`
                        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'sticky top-0 h-screen'}
                        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                        transition-transform duration-300 ease-in-out
                    `}
                >
                    <Sidebar />
                </div>

                {/* Backdrop - Only shown on mobile when sidebar is open */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`
                        flex-1 p-4 md:p-6 lg:p-8 
                        ${isMobile ? 'w-full' : 'ml-0'} 
                        transition-all duration-300
                    `}
                >
                    <div className="max-w-7xl mx-auto mt-16 lg:mt-[2rem]">
                        <Outlet />
                    </div>
                </motion.main>
            </div>
        </div>
    )
}

export default Layout 