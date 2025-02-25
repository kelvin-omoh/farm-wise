import { useState } from 'react'
import { FaCalendarAlt, FaSeedling, FaWater, FaLeaf } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface CropEvent {
    id: number
    crop: string
    action: 'planting' | 'irrigation' | 'harvesting'
    date: string
    status: 'upcoming' | 'ongoing' | 'completed'
    details: string
}

const cropEvents: CropEvent[] = [
    {
        id: 1,
        crop: 'Tomatoes',
        action: 'planting',
        date: '2024-03-15',
        status: 'upcoming',
        details: 'Plant new batch in Section A'
    },
    {
        id: 2,
        crop: 'Cassava',
        action: 'irrigation',
        date: '2024-03-10',
        status: 'ongoing',
        details: 'Weekly irrigation cycle'
    },
    {
        id: 3,
        crop: 'Maize',
        action: 'harvesting',
        date: '2024-03-20',
        status: 'upcoming',
        details: 'Harvest mature crops in Section C'
    }
]

const getActionIcon = (action: string) => {
    switch (action) {
        case 'planting': return <FaSeedling className="w-5 h-5 text-green-500" />
        case 'irrigation': return <FaWater className="w-5 h-5 text-blue-500" />
        case 'harvesting': return <FaLeaf className="w-5 h-5 text-yellow-500" />
        default: return null
    }
}

export const CropCalendar = () => {
    const [view, setView] = useState<'week' | 'month'>('week')

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Crop Calendar</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('week')}
                        className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setView('month')}
                        className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Month
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {cropEvents.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {getActionIcon(event.action)}
                            <div>
                                <h3 className="font-medium">{event.crop}</h3>
                                <p className="text-sm text-gray-600">{event.details}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                    event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                }`}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
} 