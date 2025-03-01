import { useState } from 'react'
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface Alert {
    id: number
    type: 'warning' | 'info' | 'success'
    message: string
    timestamp: string
    read: boolean
}

const alerts: Alert[] = [
    {
        id: 1,
        type: 'warning',
        message: 'Soil moisture levels critically low in Section B',
        timestamp: '2 hours ago',
        read: false
    },
    {
        id: 2,
        type: 'info',
        message: 'Weather forecast: Rain expected tomorrow',
        timestamp: '5 hours ago',
        read: false
    },
    {
        id: 3,
        type: 'success',
        message: 'Irrigation cycle completed successfully',
        timestamp: '1 day ago',
        read: true
    }
]

// interface AlertNotificationsProps {
//     useTestData?: boolean;
//     farmId?: string | null;
// }

export const AlertNotifications = () => {
    const [showAll, setShowAll] = useState(false)
    const [notifications, setNotifications] = useState(alerts)

    const unreadCount = notifications.filter(n => !n.read).length

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning': return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />
            case 'info': return <FaInfoCircle className="w-5 h-5 text-blue-500" />
            case 'success': return <FaCheckCircle className="w-5 h-5 text-green-500" />
            default: return null
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FaBell className="w-6 h-6 text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold">Alerts</h2>
                </div>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm text-primary hover:text-primary-dark"
                >
                    {showAll ? 'Show Recent' : 'Show All'}
                </button>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                    {notifications
                        .filter(alert => showAll || !alert.read)
                        .map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex items-start gap-4 p-4 rounded-lg ${alert.read ? 'bg-gray-50' : 'bg-primary/5'
                                    }`}
                            >
                                {getAlertIcon(alert.type)}
                                <div className="flex-1">
                                    <p className="text-gray-900">{alert.message}</p>
                                    <span className="text-sm text-gray-500">{alert.timestamp}</span>
                                </div>
                                {!alert.read && (
                                    <button
                                        onClick={() => {
                                            setNotifications(notifications.map(n =>
                                                n.id === alert.id ? { ...n, read: true } : n
                                            ))
                                        }}
                                        className="text-xs text-primary hover:text-primary-dark"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        </div>
    )
} 