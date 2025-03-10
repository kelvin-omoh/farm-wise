import { useState, useEffect, useCallback } from 'react'
import { DeviceRegistration } from '../../components/dashboard/DeviceRegistration'
import { DeviceHealth } from '../../components/dashboard/DeviceHealth'
import { SensorCard } from '../../components/dashboard/SensorCard'
import { FaThermometerHalf, FaTint, FaSun, FaLeaf, FaPlus, FaQrcode } from 'react-icons/fa'
import { useAuthStore } from '../../stores/authStore'
import { QrScanner } from '../../components/QrScanner'
import { FirebaseConnectionTest } from '../../components/FirebaseConnectionTest'
import { db, auth } from '../../config/firebase'
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    // doc,
    // getDoc,
    // setDoc,
    orderBy,
    limit
} from 'firebase/firestore'
import { User as FirebaseUser } from 'firebase/auth'
import { getDevices } from '../../services/firebaseService'
import { DeviceList } from '../../components/dashboard/DeviceList'
import { Modal } from '../../components/ui/Modal'
import QRCodeGenerator from '../../components/dashboard/QRCodeGenerator'

// Add this interface to define the device data structure
interface DeviceData {
    name: string;
    type: string;
    location?: string;
    description?: string;
    id?: string;
}

// Add interface for device from database
interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    farm_id: string;
    last_reading?: string;
    location?: string;
    health?: {
        battery_level?: number;
        firmware_version?: string;
        last_online?: { seconds: number; } | undefined;
        signal_strength?: number;
        status?: string;
    };
}

// Test data for when not connected to Firebase
const testSensorData = [
    {
        title: "Temperature",
        value: "28",
        unit: "°C",
        icon: FaThermometerHalf,
        color: "text-orange-500"
    },
    {
        title: "Humidity",
        value: "65",
        unit: "%",
        icon: FaTint,
        color: "text-blue-500"
    },
    {
        title: "Light",
        value: "850",
        unit: "lux",
        icon: FaSun,
        color: "text-yellow-500"
    },
    {
        title: "Soil Moisture",
        value: "42",
        unit: "%",
        icon: FaLeaf,
        color: "text-green-500"
    }
]

// Add this interface for the selected device
interface SelectedDevice extends Device {
    // Add any additional fields you might want to display
}

// Add this function to format the timestamp for display
const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Not available';

    if (timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return String(timestamp);
};

const DevicesPage = () => {
    const { user } = useAuthStore() as { user: FirebaseUser | null }
    const [showAddDevice, setShowAddDevice] = useState(false)
    const [showQrScanner, setShowQrScanner] = useState(false)
    const [sensorData, setSensorData] = useState(testSensorData)
    const [useTestData, /* setUseTestData */] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [farmId, setFarmId] = useState<string | null>(null)
    const [devices, setDevices] = useState<Device[]>([])
    const [error, setError] = useState<string | null>(null)
    const [addSuccess, /* setAddSuccess */] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState<SelectedDevice | null>(null)
    const [showDeviceModal, setShowDeviceModal] = useState(false)

    // Add this function near the top of your component
    const checkFirebaseConnection = async () => {
        try {
            // Simple test to check if we can access Firestore
            const farmsRef = collection(db, 'devices');
            const q = query(farmsRef, limit(1));
            await getDocs(q);

            console.log('Firebase connection successful');
            return true;
        } catch (err) {
            console.error('Firebase connection error:', err);
            setError(`Database connection error: ${err instanceof Error ? err.message : String(err)}`);
            return false;
        }
    };

    // Call this function when the component mounts
    useEffect(() => {
        if (!useTestData) {
            checkFirebaseConnection();
        }
    }, [useTestData]);

    // Fetch farm ID when component mounts
    useEffect(() => {
        const fetchFarmId = async () => {
            if (!user || useTestData) return;

            try {
                console.log('Fetching farm ID for user:', user?.uid);

                const farmsRef = collection(db, 'farms');
                const q = query(farmsRef, where('owner_id', '==', user?.uid));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log('No farm found, creating one...');

                    // Create a new farm
                    const newFarmRef = await addDoc(collection(db, 'farms'), {
                        name: 'My Farm',
                        owner_id: user?.uid,
                        location: 'Default Location',
                        size: 10,
                        size_unit: 'hectares',
                        created_at: new Date().toISOString()
                    });

                    console.log('Created new farm:', newFarmRef.id);
                    setFarmId(newFarmRef.id);
                } else {
                    // Use the first farm found
                    const farmDoc = querySnapshot.docs[0];
                    console.log('Found farm ID:', farmDoc.id);
                    setFarmId(farmDoc.id);
                }
            } catch (err) {
                console.error('Error in fetchFarmId:', err);
                setError(`Failed to fetch farm: ${err instanceof Error ? err.message : String(err)}`);
            }
        };

        fetchFarmId();
    }, [user, useTestData]);

    // Update the fetchDevices function
    const fetchDevices = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Get devices for the current user
            const fetchedDevices = await getDevices(user.uid);
            setDevices(fetchedDevices);
        } catch (error) {
            console.error('Error fetching devices:', error);
            setError('Failed to fetch devices. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Add useEffect to fetch devices when user changes
    useEffect(() => {
        if (user) {
            console.log('Fetching devices for user:', user.uid);
            fetchDevices();
        }
    }, [user, fetchDevices]);

    useEffect(() => {
        const fetchSensorData = async () => {
            if (useTestData) {
                setSensorData(testSensorData)
                return
            }

            if (!farmId) {
                console.log('No farm ID available, using test data');
                setSensorData(testSensorData);
                return;
            }

            try {
                setIsLoading(true)

                // Fetch the latest sensor readings from Firestore
                const readingsRef = collection(db, 'sensor_readings');
                const q = query(
                    readingsRef,
                    where('farm_id', '==', farmId),
                    orderBy('timestamp', 'desc'),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const latestReading = querySnapshot.docs[0].data();

                    // Transform the data to match our format
                    const formattedData = [
                        {
                            title: "Temperature",
                            value: latestReading.temperature?.toString() || "N/A",
                            unit: "°C",
                            icon: FaThermometerHalf,
                            color: "text-orange-500"
                        },
                        {
                            title: "Humidity",
                            value: latestReading.humidity?.toString() || "N/A",
                            unit: "%",
                            icon: FaTint,
                            color: "text-blue-500"
                        },
                        {
                            title: "Light",
                            value: latestReading.light_intensity?.toString() || "N/A",
                            unit: "lux",
                            icon: FaSun,
                            color: "text-yellow-500"
                        },
                        {
                            title: "Soil Moisture",
                            value: latestReading.soil_moisture?.toString() || "N/A",
                            unit: "%",
                            icon: FaLeaf,
                            color: "text-green-500"
                        }
                    ]
                    setSensorData(formattedData)
                } else {
                    // No readings found, use test data
                    setSensorData(testSensorData)
                }
            } catch (error) {
                console.error('Error fetching sensor data:', error)
                // Fallback to test data
                setSensorData(testSensorData)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSensorData()
    }, [useTestData, farmId])

    // Add this at the beginning of your component
    useEffect(() => {
        const checkAuth = async () => {
            if (!auth.currentUser) {
                console.warn('No active session found');
                setError('No active session. Please log in again.');
                return;
            }

            console.log('Authenticated as:', auth.currentUser.email);
        };

        if (!useTestData) {
            checkAuth();
        }
    }, [useTestData]);

    const handleAddDevice = async (deviceData: DeviceData) => {
        if (!user) {
            setError('You must be logged in to add devices');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Add the user ID to the device data
            const deviceWithUserId = {
                ...deviceData,
                user_id: user.uid,
                farm_id: user.uid, // Use the user ID as the farm ID
                created_at: new Date()
            };

            console.log('Adding device with user ID:', user.uid);

            // Add the device to Firestore
            await addDoc(collection(db, 'devices'), deviceWithUserId);

            // Refresh the devices list
            fetchDevices();

            // Close the add device form
            setShowAddDevice(false);
        } catch (err) {
            console.error('Error adding device:', err);
            setError('Failed to add device. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQrCodeScanned = (data: string) => {
        console.log('QR code scanned with data:', data);

        try {
            // Parse the QR code data
            const deviceInfo = JSON.parse(data);
            console.log('Parsed device info:', deviceInfo);

            // Validate the data
            if (!deviceInfo.id || !deviceInfo.type) {
                throw new Error('Invalid QR code data');
            }

            // Create a device with the scanned data
            const deviceData: DeviceData = {
                name: deviceInfo.name || `Device ${deviceInfo.id}`,
                type: deviceInfo.type,
                id: deviceInfo.id,
                location: deviceInfo.location || 'Unknown'
            };

            console.log('Created device data:', deviceData);

            // Add the device (handleAddDevice will add the user_id)
            handleAddDevice(deviceData);

            // Close the scanner
            setShowQrScanner(false);
        } catch (err) {
            console.error('Error processing QR code:', err);
            setError(`Invalid QR code format: ${data}`);
        }
    };

    // Add this function to the DevicesPage component
    const requestCameraPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            return true;
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            return false;
        }
    };

    // Update the handleScanClick function
    const handleScanClick = async () => {
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
            setShowQrScanner(true);
        } else {
            setError('Camera permission denied. Please allow camera access in your browser settings.');
        }
    };

    const handleViewDevice = (deviceId: string) => {
        console.log('View device:', deviceId);
        const device = devices.find(d => d.id === deviceId);
        if (device) {
            setSelectedDevice(device as SelectedDevice);
            setShowDeviceModal(true);

            console.log('Device health data:', device.health);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">IoT Devices</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage your connected farm devices</p>
                    </div>
                </div>
            </div>

            {/* Add the connection test component */}
            {!useTestData && <FirebaseConnectionTest />}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    {error}
                    <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Add Device Buttons */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleScanClick}
                    className="btn btn-outline"
                >
                    <FaQrcode className="mr-2" /> Scan QR Code
                </button>
                <button
                    onClick={() => {
                        setShowAddDevice(!showAddDevice);
                        setShowQrScanner(false);
                    }}
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <FaPlus className="mr-2" /> {showAddDevice ? 'Cancel' : 'Add Device Manually'}
                        </>
                    )}
                </button>
            </div>

            {/* QR Scanner */}
            {showQrScanner && (
                <QrScanner
                    onScanSuccess={handleQrCodeScanned}
                    onClose={() => setShowQrScanner(false)}
                />
            )}

            {/* Add Device Form */}
            {showAddDevice && (
                <DeviceRegistration
                    onSubmit={handleAddDevice}
                    onCancel={() => setShowAddDevice(false)}
                />
            )}

            {/* Devices List */}
            {!isLoading ? (
                devices.filter(device => device.status !== 'pending' && device.status !== 'rejected').length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Your Active Devices</h2>
                        {/* Replace the table with this: */}
                        <DeviceList
                            devices={devices.filter(device => device.status !== 'pending' && device.status !== 'rejected')}
                            onViewDevice={handleViewDevice}
                        />
                    </div>) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't added any devices yet.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAddDevice(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                    Add your first device
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Sensor Data */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Latest Sensor Readings</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sensorData.map((sensor, index) => (
                        <SensorCard key={sensor.title} {...sensor} index={index} />
                    ))}
                </div>
            </div>

            {/* Device Health */}
            <DeviceHealth />

            {/* QR Code Generator for Testing */}
            {process.env.NODE_ENV === 'development' && <QRCodeGenerator />}

            {/* Success message */}
            {addSuccess && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                    Device added successfully!
                </div>
            )}

            {/* Device Details Modal */}
            {showDeviceModal && selectedDevice && (
                <Modal
                    title={`Device Details: ${selectedDevice.name}`}
                    onClose={() => {
                        setShowDeviceModal(false);
                        setSelectedDevice(null);
                    }}
                >
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Device ID</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedDevice.id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedDevice.type}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedDevice.status === 'active' ? 'bg-green-100 text-green-800' :
                                        selectedDevice.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                            'bg-green-400 text-green-800'
                                        }`}>
                                        {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
                                    </span>
                                </p>
                            </div>

                            {/* Battery Level */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Battery Level</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedDevice.health?.battery_level !== undefined ?
                                        `${selectedDevice.health.battery_level}%` :
                                        'Not available'}
                                </p>
                            </div>

                            {/* Firmware Version */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Firmware Version</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedDevice.health?.firmware_version || 'Not available'}
                                </p>
                            </div>

                            {/* Last Online */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Last Online</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedDevice.health?.last_online ?
                                        formatTimestamp(selectedDevice.health.last_online) :
                                        'Not available'}
                                </p>
                            </div>

                            {/* Signal Strength */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Signal Strength</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedDevice.health?.signal_strength !== undefined ?
                                        `${selectedDevice.health.signal_strength}%` :
                                        'Not available'}
                                </p>
                            </div>

                            {selectedDevice.last_reading && (
                                <div className="col-span-1 md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500">Last Reading</h3>
                                    <p className="mt-1 text-sm text-gray-900">{selectedDevice.last_reading}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowDeviceModal(false);
                                    setSelectedDevice(null);
                                }}
                                className="btn btn-outline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default DevicesPage 