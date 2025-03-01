import { useState, useEffect } from 'react'
import { FaQrcode, FaPlus, FaCheck } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'

// Add this interface to define the device data structure
interface DeviceData {
    name: string;
    type: string;
    location?: string;
    description?: string;
    id?: string;
}

// Then the props interface
interface DeviceRegistrationProps {
    onSubmit: (deviceData: DeviceData) => void;
    onCancel: () => void;
}

// Then update the component definition
export const DeviceRegistration = ({ onSubmit, onCancel }: DeviceRegistrationProps) => {
    const [isRegistering, setIsRegistering] = useState(false)
    const [registrationMethod, setRegistrationMethod] = useState<'qr' | 'manual' | null>(null)
    const [deviceId, setDeviceId] = useState('')
    const [deviceType, setDeviceType] = useState('soil_sensor')
    const [deviceName, setDeviceName] = useState('')
    const [location, setLocation] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [error, setError] = useState('')

    const { user } = useAuthStore()

    useEffect(() => {
        if (user) {
            console.log("User is logged in:", user.email);
        }
    }, [user]);

    const handleStartRegistration = () => {
        setIsRegistering(true)
        setRegistrationMethod(null)
        setDeviceId('')
        setDeviceType('soil_sensor')
        setDeviceName('')
        setLocation('')
        setError('')
        setRegistrationSuccess(false)
    }

    const handleCancel = () => {
        setIsRegistering(false)
        setRegistrationMethod(null)
        onCancel()
    }

    const handleQrScan = () => {
        setRegistrationMethod('qr')
        setIsScanning(true)
        // Simulate QR code scanning
        setTimeout(() => {
            setIsScanning(false)
            setDeviceId('IOT' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'))
        }, 2000)
    }

    const handleManualEntry = () => {
        setRegistrationMethod('manual')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!deviceName) {
            setError('Device name is required')
            return
        }

        // Create device data object
        const deviceData: DeviceData = {
            name: deviceName,
            type: deviceType,
            location: location,
            id: deviceId || undefined
        }

        // Call the onSubmit prop with the device data
        onSubmit(deviceData)

        // Show success message
        setRegistrationSuccess(true)

        // Reset form after 2 seconds
        setTimeout(() => {
            setIsRegistering(false)
            setRegistrationMethod(null)
        }, 2000)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">IoT Device Registration</h2>
                {!isRegistering && (
                    <button
                        onClick={handleStartRegistration}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <FaPlus /> Register New Device
                    </button>
                )}
            </div>

            {isRegistering && !registrationMethod && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6 py-8"
                >
                    <h3 className="text-lg font-medium">How would you like to register your device?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleQrScan}
                            className="btn btn-outline btn-lg gap-2"
                        >
                            <FaQrcode className="w-5 h-5" /> Scan QR Code
                        </button>
                        <button
                            onClick={handleManualEntry}
                            className="btn btn-outline btn-lg gap-2"
                        >
                            Manual Entry
                        </button>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="btn btn-ghost btn-sm mt-4"
                    >
                        Cancel
                    </button>
                </motion.div>
            )}

            {registrationMethod === 'qr' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6 py-8"
                >
                    {isScanning ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-64 h-64 border-4 border-primary relative">
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <div className="w-full h-1 bg-primary absolute animate-[scan_2s_ease-in-out_infinite]"></div>
                                </div>
                            </div>
                            <p className="text-center">Position the QR code within the frame</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-md">
                            <div className="mb-6 text-center">
                                <FaCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                <h3 className="text-lg font-medium">QR Code Scanned Successfully</h3>
                                <p className="text-gray-600">Device ID: {deviceId}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Device Name</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={deviceName}
                                        onChange={(e) => setDeviceName(e.target.value)}
                                        placeholder="e.g. Soil Sensor A1"
                                    />
                                </div>

                                <div>
                                    <label className="label">Device Type</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={deviceType}
                                        onChange={(e) => setDeviceType(e.target.value)}
                                    >
                                        <option value="soil_sensor">Soil Sensor</option>
                                        <option value="weather_sensor">Weather Station</option>
                                        <option value="irrigation_controller">Irrigation Controller</option>
                                        <option value="livestock_tracker">Livestock Tracker</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Location</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Section A"
                                    />
                                </div>

                                {error && (
                                    <div className="text-error text-sm">{error}</div>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Register Device
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </motion.div>
            )}

            {registrationMethod === 'manual' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md mx-auto"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Device ID</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                placeholder="Enter the device ID (e.g. IOT1234)"
                            />
                        </div>

                        <div>
                            <label className="label">Device Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                placeholder="e.g. Soil Sensor A1"
                            />
                        </div>

                        <div>
                            <label className="label">Device Type</label>
                            <select
                                className="select select-bordered w-full"
                                value={deviceType}
                                onChange={(e) => setDeviceType(e.target.value)}
                            >
                                <option value="soil_sensor">Soil Sensor</option>
                                <option value="weather_sensor">Weather Station</option>
                                <option value="irrigation_controller">Irrigation Controller</option>
                                <option value="livestock_tracker">Livestock Tracker</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Location</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Section A"
                            />
                        </div>

                        {error && (
                            <div className="text-error text-sm">{error}</div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Register Device
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {registrationSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-4 rounded-lg text-center"
                >
                    <FaCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-green-800">Device Registered Successfully</h3>
                    <p className="text-green-600">Your device has been added to your farm profile</p>
                </motion.div>
            )}

            {!isRegistering && !registrationSuccess && (
                <div className="text-center py-8 text-gray-500">
                    <p>Register your IoT devices to start monitoring your farm in real-time</p>
                </div>
            )}
        </div>
    )
} 