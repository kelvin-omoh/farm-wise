import { useState } from 'react'
import { FaMicrochip, FaCheck, FaExclamationTriangle, FaWifi, FaBatteryThreeQuarters } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface Device {
    id: number
    name: string
    type: string
    status: 'online' | 'offline' | 'warning'
    battery: number
    signal: number
    lastUpdate: string
    location: string
}

const devices: Device[] = [
    {
        id: 1,
        name: 'Soil Sensor A1',
        type: 'soil_sensor',
        status: 'online',
        battery: 85,
        signal: 92,
        lastUpdate: '2 mins ago',
        location: 'Section A'
    },
    {
        id: 2,
        name: 'Weather Station',
        type: 'weather_sensor',
        status: 'warning',
        battery: 15,
        signal: 78,
        lastUpdate: '5 mins ago',
        location: 'Main Field'
    },
    {
        id: 3,
        name: 'Irrigation Controller',
        type: 'controller',
        status: 'offline',
        battery: 0,
        signal: 0,
        lastUpdate: '1 hour ago',
        location: 'Section B'
    }
]

export const DeviceHealth = () => {
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-500'
            case 'warning': return 'text-yellow-500'
            case 'offline': return 'text-red-500'
            default: return 'text-gray-500'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaMicrochip className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Device Health</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('online')}
                        className={`btn btn-sm ${filter === 'online' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Online
                    </button>
                    <button
                        onClick={() => setFilter('offline')}
                        className={`btn btn-sm ${filter === 'offline' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Offline
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {devices.map((device, index) => (
                    <motion.div
                        key={device.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-gray-50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)} animate-pulse`} />
                                <div>
                                    <h3 className="font-medium">{device.name}</h3>
                                    <p className="text-sm text-gray-500">{device.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FaBatteryThreeQuarters className={device.battery < 20 ? 'text-red-500' : 'text-green-500'} />
                                    <span className="text-sm">{device.battery}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaWifi className={device.signal < 50 ? 'text-yellow-500' : 'text-green-500'} />
                                    <span className="text-sm">{device.signal}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Last update: {device.lastUpdate}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
} 