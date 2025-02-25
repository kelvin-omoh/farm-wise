import { useState, useEffect } from 'react'
import { DeviceRegistration } from '../../components/dashboard/DeviceRegistration'
import { DeviceHealth } from '../../components/dashboard/DeviceHealth'
import { SensorCard } from '../../components/dashboard/SensorCard'
import { FaThermometerHalf, FaTint, FaSun, FaLeaf, FaPlus, FaQrcode } from 'react-icons/fa'
import { Switch } from '../../components/ui/Switch'
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
    doc,
    getDoc,
    setDoc,
    orderBy,
    limit
} from 'firebase/firestore'
import { User as FirebaseUser } from 'firebase/auth'

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

const DevicesPage = () => {
    const { user } = useAuthStore() as { user: FirebaseUser | null }
    const [showAddDevice, setShowAddDevice] = useState(false)
    const [showQrScanner, setShowQrScanner] = useState(false)
    const [sensorData, setSensorData] = useState(testSensorData)
    const [useTestData, setUseTestData] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [farmId, setFarmId] = useState<string | null>(null)
    const [devices, setDevices] = useState<Device[]>([])
    const [error, setError] = useState<string | null>(null)
    const [addSuccess, setAddSuccess] = useState(false)

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

    // Fetch devices when farmId changes
    useEffect(() => {
        const fetchDevices = async () => {
            if (!farmId || useTestData) return;

            try {
                setIsLoading(true);

                const devicesRef = collection(db, 'devices');
                const q = query(devicesRef, where('farm_id', '==', farmId));
                const querySnapshot = await getDocs(q);

                const devicesList: Device[] = [];
                querySnapshot.forEach((doc) => {
                    devicesList.push({
                        id: doc.id,
                        ...doc.data()
                    } as Device);
                });

                setDevices(devicesList);
            } catch (err) {
                console.error('Error fetching devices:', err);
                setError('Failed to fetch devices');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDevices();
    }, [farmId, useTestData]);

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
        if (!farmId && !useTestData) {
            setError('No farm ID available. Cannot add device.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setAddSuccess(false);

            if (useTestData) {
                // Just log the data in test mode
                console.log('Adding device (test mode):', deviceData);
                setShowAddDevice(false);
                return;
            }

            console.log('Attempting to add device to Firebase:', {
                name: deviceData.name,
                type: deviceData.type,
                status: 'active',
                farm_id: farmId,
                location: deviceData.location || 'Unknown'
            });

            // Add the device to Firebase
            const newDeviceRef = await addDoc(collection(db, 'devices'), {
                name: deviceData.name,
                type: deviceData.type,
                status: 'active',
                farm_id: farmId,
                location: deviceData.location || 'Unknown',
                last_reading: new Date().toISOString()
            });

            console.log('Device added successfully:', newDeviceRef.id);
            setAddSuccess(true);

            // Show success message for 2 seconds before closing
            setTimeout(() => {
                setShowAddDevice(false);
                setAddSuccess(false);
            }, 2000);

            // Refresh the devices list
            const devicesRef = collection(db, 'devices');
            const q = query(devicesRef, where('farm_id', '==', farmId));
            const querySnapshot = await getDocs(q);

            const updatedDevices: Device[] = [];
            querySnapshot.forEach((doc) => {
                updatedDevices.push({
                    id: doc.id,
                    ...doc.data()
                } as Device);
            });

            setDevices(updatedDevices);
        } catch (err) {
            console.error('Error adding device:', err);
            setError(`Failed to add device: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleQrCodeScanned = (data: string) => {
        try {
            // Parse the QR code data
            const deviceInfo = JSON.parse(data);

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

            // Add the device
            handleAddDevice(deviceData);

            // Close the scanner
            setShowQrScanner(false);
        } catch (err) {
            console.error('Error processing QR code:', err);
            setError('Invalid QR code format');
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">IoT Devices</h1>
                        <p className="text-gray-600">Manage your connected devices and sensor data</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Data Source:</span>
                        <Switch
                            checked={useTestData}
                            onChange={() => setUseTestData(!useTestData)}
                            label={useTestData ? "Test" : "Live"}
                        />
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
                    onClick={() => {
                        setShowQrScanner(true);
                        setShowAddDevice(false);
                    }}
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Scan Device QR Code</h2>
                    <QrScanner onScan={handleQrCodeScanned} onClose={() => setShowQrScanner(false)} />
                </div>
            )}

            {/* Add Device Form */}
            {showAddDevice && (
                <DeviceRegistration
                    onSubmit={handleAddDevice}
                    onCancel={() => setShowAddDevice(false)}
                />
            )}

            {/* Devices List */}
            {!useTestData && devices.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6">Your Devices</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Reading</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {devices.map((device) => (
                                    <tr key={device.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{device.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{device.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{device.location || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {device.last_reading ? new Date(device.last_reading).toLocaleString() : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

            {/* Success message */}
            {addSuccess && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                    Device added successfully!
                </div>
            )}
        </div>
    )
}

export default DevicesPage 