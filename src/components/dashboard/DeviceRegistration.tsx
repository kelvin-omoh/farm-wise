import { useState, useEffect, useRef } from 'react'
import { FaQrcode, FaPlus, FaCheck, FaShoppingCart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { getUserOrders } from '../../services/firebaseService'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import jsQR from 'jsqr'

// Add this interface to define the device data structure
interface DeviceData {
    name: string;
    type: string;
    location?: string;
    description?: string;
    id?: string;
    farm_id?: string;
}

// Add this interface to define the order item structure
interface OrderItem {
    id?: string;
    type: string;
    name?: string;
    device_type?: string;
    registered?: boolean;
    order_id?: string;
    price?: number;
    currency?: string;
}

// Update the Order interface to match your actual data structure
interface Order {
    id: string;
    status: string;
    product_id?: string;
    product_name?: string;
    device_id?: string;
    amount?: number;
    currency?: string;
    payment_reference?: string;
    flutterwave_reference?: number;
    payment_details?: any;
    created_at?: any;
    updated_at?: any;
    user_id?: string;
}

// Then the props interface
interface DeviceRegistrationProps {
    onSubmit: (deviceData: DeviceData) => Promise<any>;
    onCancel: () => void;
    farmId?: string; // Make it optional to maintain backward compatibility
}

// Then update the component definition
export const DeviceRegistration = ({ onSubmit, onCancel, farmId }: DeviceRegistrationProps) => {
    const [isRegistering, setIsRegistering] = useState(false)
    const [registrationMethod, setRegistrationMethod] = useState<'qr' | 'manual' | null>(null)
    const [deviceId, setDeviceId] = useState('')
    const [deviceType, setDeviceType] = useState('soil_sensor')
    const [deviceName, setDeviceName] = useState('')
    const [location, setLocation] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [error, setError] = useState('')
    const [orderedDevices, setOrderedDevices] = useState<any[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(false)
    const [scanError, setScanError] = useState<string | null>(null)

    // Refs for QR code scanning
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const scanIntervalRef = useRef<number | null>(null)

    const { user } = useAuthStore()

    useEffect(() => {
        if (user) {
            console.log("User is logged in:", user.email);
            fetchOrderedDevices();
        }
    }, [user]);

    // Cleanup function for QR scanner
    useEffect(() => {
        return () => {
            // Stop the video stream when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            // Clear the scanning interval
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        };
    }, []);

    // Update the fetchRegisteredDevices function to check for device_id
    const fetchRegisteredDevices = async () => {
        if (!user) return [];

        try {
            // Query the devices collection to find all devices registered by this user
            const devicesRef = collection(db, 'devices');
            const q = query(devicesRef, where('owner_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            // Log the raw device data for debugging
            console.log("All user devices:", querySnapshot.docs.map(doc => doc.data()));

            // Extract the device IDs - check both id and device_id fields
            const registeredIds = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return data.device_id || '';
            }).filter(id => id !== '');

            console.log("Registered device IDs:", registeredIds);
            return registeredIds;
        } catch (err) {
            console.error('Error fetching registered devices:', err);
            return [];
        }
    };

    // Update the fetchOrderedDevices function
    const fetchOrderedDevices = async () => {
        if (!user) return;

        setIsLoadingOrders(true);
        try {
            // Get already registered device IDs
            const registeredDeviceIds = await fetchRegisteredDevices();

            // Use a simpler query that doesn't require complex indexes
            const userOrders = await getUserOrders(user.uid) as Order[];

            console.log(userOrders);

            // Process the orders client-side instead of in the query
            const devices: OrderItem[] = [];

            // Loop through orders and extract devices
            for (const order of userOrders) {
                // Only process completed orders with device_id
                if (order.status === 'completed' && order.id) {
                    // Skip already registered devices
                    if (registeredDeviceIds.includes(order.id)) {
                        continue;
                    }

                    // Create a device object from the order
                    devices.push({
                        id: order.device_id,
                        name: order.product_name || 'IoT Device',
                        type: 'device',
                        device_type: order.product_id?.includes('bot') ? 'FermWise Bot' : 'FermWise Bot',
                        order_id: order.id,
                        price: order.amount,
                        currency: order.currency
                    });
                }
            }

            setOrderedDevices(devices);
        } catch (err) {
            console.error('Error fetching ordered devices:', err);
            setError('Failed to load your purchased devices');
        } finally {
            setIsLoadingOrders(false);
        }
    };

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
        // Stop the video stream if it's running
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Clear the scanning interval
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        setIsRegistering(false)
        setRegistrationMethod(null)
        setIsScanning(false)
        setScanError(null)
        onCancel()
    }

    const startQrScanner = async () => {
        setRegistrationMethod('qr')
        setIsScanning(true)
        setScanError(null)

        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Store the stream in the ref
            streamRef.current = stream;

            // Set the video source
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(err => {
                        console.error('Error playing video:', err);
                        setScanError('Could not start video stream. Please try again.');
                    });

                    // Start scanning for QR codes
                    scanIntervalRef.current = window.setInterval(() => {
                        scanQrCode();
                    }, 200); // Scan every 200ms
                };
            } else {
                throw new Error('Video element not found');
            }

        } catch (err) {
            console.error('Error accessing camera:', err);

            // Provide more specific error messages
            if (err instanceof DOMException && err.name === 'NotAllowedError') {
                setScanError('Camera access denied. Please allow camera access and try again.');
            } else if (err instanceof DOMException && err.name === 'NotFoundError') {
                setScanError('No camera found. Please make sure your device has a camera.');
            } else if (err instanceof DOMException && err.name === 'NotReadableError') {
                setScanError('Camera is in use by another application. Please close other apps using the camera.');
            } else {
                setScanError('Could not access camera. Please check permissions and try again.');
            }

            setIsScanning(false);
        }
    }

    const scanQrCode = () => {
        if (!videoRef.current || !canvasRef.current) {
            return;
        }

        // Make sure video is ready
        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        try {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame to the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get the image data from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Scan for QR code
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            // If a QR code is found
            if (code) {
                console.log("QR code detected:", code.data);

                // Validate the QR code data
                if (!code.data || code.data.trim() === '') {
                    console.warn('Empty QR code detected, continuing scanning...');
                    return;
                }

                // Stop scanning
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                if (scanIntervalRef.current) {
                    clearInterval(scanIntervalRef.current);
                    scanIntervalRef.current = null;
                }

                // Set the device ID from the QR code
                setDeviceId(code.data);
                setIsScanning(false);

                // Play a success sound if available
                try {
                    const audio = new Audio('/sounds/beep.mp3');
                    audio.play().catch(e => console.log('Could not play success sound', e));
                } catch (e) {
                    console.log('Sound not supported or not available');
                }
            }
        } catch (err) {
            console.error('Error scanning QR code:', err);
            // Continue scanning despite errors
        }
    }

    const handleQrScan = () => {
        startQrScanner();
    }

    const handleManualEntry = () => {
        setRegistrationMethod('manual')
    }

    const handleSubmit = async (e: React.FormEvent) => {
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
            id: deviceId || undefined,
            farm_id: farmId
        }

        try {
            setError('') // Clear any previous errors
            setRegistrationSuccess(false) // Reset success state

            // Call the onSubmit prop with the device data
            await onSubmit(deviceData)

            // Show success message
            setRegistrationSuccess(true)

            // Reset form after 2 seconds
            setTimeout(() => {
                setIsRegistering(false)
                setRegistrationMethod(null)
            }, 2000)
        } catch (err) {
            console.error('Error registering device:', err)
            setError(`Failed to register device: ${err instanceof Error ? err.message : String(err)}`)
            setRegistrationSuccess(false) // Ensure success message is not shown
        }
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

            {!isRegistering && (
                <div className="mb-6 border-b pb-6">
                    <div className="flex items-center mb-4">
                        <FaShoppingCart className="text-primary mr-2" />
                        <h3 className="text-lg font-medium">Your Purchased Devices</h3>
                    </div>

                    {isLoadingOrders ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500">Loading your purchased devices...</p>
                        </div>
                    ) : orderedDevices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orderedDevices.map((device, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col h-full">
                                        <div>
                                            <h4 className="font-medium">{device.name || `Device ${index + 1}`}</h4>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {device.device_type || 'IoT Device'} • Order #{device.order_id?.substring(0, 8)}
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-2">
                                            <button
                                                onClick={() => {
                                                    setDeviceId(device.id || '')
                                                    setDeviceType(device.device_type || 'soil_sensor')
                                                    setDeviceName(device.name || '')
                                                    setRegistrationMethod('manual')
                                                    setIsRegistering(true)
                                                }}
                                                className="btn btn-sm btn-primary w-full"
                                            >
                                                Add to Farm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-md p-4 text-center">
                            <p className="text-gray-600">
                                {isLoadingOrders ? 'Loading your devices...' :
                                    'All your purchased devices have been registered or you haven\'t purchased any devices yet.'}
                            </p>
                            <a href="/dashboard/marketplace" className="text-primary hover:underline mt-2 inline-block">
                                Visit Marketplace
                            </a>
                        </div>
                    )}
                </div>
            )}

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
                    className="flex flex-col items-center gap-6 py-8 w-full"
                >
                    {isScanning ? (
                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                            <div className="w-full aspect-square max-w-xs border-4 border-primary relative overflow-hidden rounded-lg">
                                {/* Hidden canvas for processing video frames */}
                                <canvas ref={canvasRef} className="hidden"></canvas>

                                {/* Video element for camera feed */}
                                <video
                                    ref={videoRef}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    playsInline
                                    muted
                                    autoPlay
                                ></video>

                                {/* Scanning animation */}
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-1 bg-primary absolute animate-scan"></div>
                                </div>

                                {/* Targeting corners for better UX */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                            </div>
                            <p className="text-center font-medium">Position the QR code within the frame</p>

                            {scanError && (
                                <div className="text-error text-sm mt-2 text-center bg-error-light bg-opacity-20 p-3 rounded-lg">
                                    {scanError}
                                </div>
                            )}

                            {process.env.NODE_ENV === 'development' && (
                                <div className="text-sm text-primary mt-2 text-center bg-primary-50 p-3 rounded-lg">
                                    <p>Testing in development mode:</p>
                                    <p>Scroll down to use the QR Code Generator to create a test QR code.</p>
                                </div>
                            )}

                            <button
                                onClick={handleCancel}
                                className="btn btn-outline btn-sm mt-2"
                            >
                                Cancel Scanning
                            </button>
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
                                        placeholder="e.g. Maize farm device"
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
                                        placeholder="e.g. 31, Adeyemi Street, Ojota, Lagos"
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

            {!isRegistering && !registrationSuccess && !orderedDevices.length && (
                <div className="text-center py-8 text-gray-500">
                    <p>Register your IoT devices to start monitoring your farm in real-time</p>
                </div>
            )}
        </div>
    )
} 