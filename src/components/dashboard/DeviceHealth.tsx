import { useState, useEffect } from 'react'
import { FaMicrochip, FaWifi, FaBatteryThreeQuarters } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { getDevices } from '../../services/firebaseService'
import { useAuthStore } from '../../stores/authStore'
import { User as FirebaseUser } from 'firebase/auth'

// Define the Device interface to match what comes from Firebase
interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    farm_id: string;
    location?: string;
    health?: {
        battery_level?: number;
        signal_strength?: number;
        firmware_version?: string;
        last_online?: { seconds: number; } | undefined;
        status?: string;
    };
}

export const DeviceHealth = () => {
    const { user } = useAuthStore() as { user: FirebaseUser | null }
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch devices from Firebase
    useEffect(() => {
        const fetchDevices = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const fetchedDevices = await getDevices(user.uid);
                setDevices(fetchedDevices);
            } catch (error) {
                console.error('Error fetching devices for health component:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDevices();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'active': return 'text-green-500'
            case 'warning': return 'text-yellow-500'
            case 'offline':
            case 'inactive': return 'text-red-500'
            default: return 'text-gray-500'
        }
    }

    // Format timestamp for display
    const formatLastOnline = (timestamp: any): string => {
        if (!timestamp) return 'Unknown';

        if (timestamp.seconds !== undefined) {
            const date = new Date(timestamp.seconds * 1000);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();

            // Convert to minutes, hours, etc.
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins} mins ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;

            return date.toLocaleDateString();
        }

        return 'Unknown';
    };

    // Filter devices based on selected filter
    const filteredDevices = devices.filter(device => {
        if (filter === 'all') return true;
        const deviceStatus = device.health?.status || device.status;
        if (filter === 'online') return deviceStatus === 'online' || deviceStatus === 'active';
        if (filter === 'offline') return deviceStatus === 'offline' || deviceStatus === 'inactive';
        return true;
    });

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

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredDevices.length > 0 ? (
                <div className="space-y-4">
                    {filteredDevices.map((device, index) => (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-gray-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(device.health?.status || device.status)} animate-pulse`} />
                                    <div>
                                        <h3 className="font-medium">{device.name}</h3>
                                        <p className="text-sm text-gray-500">{device.location || 'Not assigned yet to a location'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <FaBatteryThreeQuarters className={
                                            (device.health?.battery_level || 0) < 20 ? 'text-red-500' : 'text-green-500'
                                        } />
                                        <span className="text-sm">{device.health?.battery_level || 'N/A'}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaWifi className={
                                            (device.health?.signal_strength || 0) < 50 ? 'text-yellow-500' : 'text-green-500'
                                        } />
                                        <span className="text-sm">{device.health?.signal_strength || 'N/A'}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Last update: {device.health?.last_online ?
                                    formatLastOnline(device.health.last_online) :
                                    'Unknown'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No devices found. Add devices to monitor their health.
                </div>
            )}
        </div>
    )
} 