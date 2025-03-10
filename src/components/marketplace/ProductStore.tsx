import { useState } from 'react';
import { FaLeaf, FaMicrochip, FaWifi, FaRobot, FaCloudUploadAlt } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { addDevice, createOrder, updateOrder } from '../../services/firebaseService';
import { Timestamp } from 'firebase/firestore';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

// Define the FlutterwaveCheckout type
declare global {
    interface Window {
        FlutterwaveCheckout: (config: any) => {
            open: () => void;
            close: () => void;
        };
    }
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    features: string[];
    type: string;
}

const products: Product[] = [
    {
        id: 'FermWise-bot-basic',
        name: 'FermWise Bot - Basic',
        description: 'Complete AI-powered farming solution with basic sensors for small farms',
        price: 25000, // in Naira
        image: '/images/FermWise-bot-basic.jpg',
        features: [
            'Temperature & Humidity Sensors',
            'Soil Moisture Monitoring',
            'Basic AI Recommendations',
            '3 Month Warranty',
            'Free Setup Support'
        ],
        type: 'smart-device'
    },
    {
        id: 'FermWise-bot-pro',
        name: 'FermWise Bot - Pro',
        description: 'Advanced farming solution with premium sensors and extended AI capabilities',
        price: 45000, // in Naira
        image: '/images/FermWise-bot-pro.jpg',
        features: [
            'All Basic Features',
            'Light Intensity Sensors',
            'pH Soil Testing',
            'Advanced AI Analytics',
            'Weather Prediction',
            '6 Month Warranty',
            'Priority Support'
        ],
        type: 'smart-device'
    },
    {
        id: 'FermWise-bot-enterprise',
        name: 'FermWise Bot - Enterprise',
        description: 'Complete farm management system for large-scale operations',
        price: 75000, // in Naira
        image: '/images/FermWise-bot-enterprise.jpg',
        features: [
            'All Pro Features',
            'Multiple Sensor Network',
            'Drone Integration Ready',
            'Advanced Crop Disease Detection',
            'Farm-wide Monitoring',
            '12 Month Warranty',
            'Dedicated Support Manager'
        ],
        type: 'smart-device'
    }
];

interface ProductStoreProps {
    onOrderComplete?: () => void;
}

// Update the isDevelopment check to ensure it's always true in your current environment
const isDevelopment = false; // Force development mode for now

// You can change it back to this when ready for production:
// const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

export const ProductStore = ({ onOrderComplete }: ProductStoreProps) => {
    const { user } = useAuthStore();
    const [, setSelectedProduct] = useState<Product | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    const handlePurchase = async (product: Product) => {
        setSelectedProduct(product);
        setIsProcessing(true);
        setOrderError(null);

        if (!user) {
            setOrderError('You must be logged in to make a purchase');
            setIsProcessing(false);
            return;
        }

        try {
            // Generate a unique reference for this transaction
            const reference = `FWB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Create initial order in database
            const orderData = {
                user_id: user.uid,
                product_id: product.id,
                product_name: product.name,
                amount: product.price,
                currency: 'NGN',
                payment_reference: reference,
                status: 'pending',
                created_at: Timestamp.now()
            };

            const order = await createOrder(orderData);
            console.log('Initial order created:', order.id);

            // Use development mode fallback if in development environment
            if (isDevelopment) {
                // Simulate payment processing
                setTimeout(async () => {
                    try {
                        // Simulate successful payment
                        const mockResponse = {
                            status: 'successful',
                            transaction_id: `TEST-${Date.now()}`,
                            tx_ref: reference
                        };

                        // Generate a unique device ID
                        const deviceId = `device-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

                        // Register the device automatically
                        const deviceData = {
                            name: `${product.name}`,
                            type: product.type,
                            status: 'online',
                            farm_id: user.uid,
                            user_id: user.uid,
                            purchase_date: Timestamp.now(),
                            order_id: order.id,
                            device_id: deviceId,
                            serial_no: deviceId,
                            health: {
                                battery_level: 100,
                                signal_strength: 95,
                                firmware_version: '1.0.0',
                                last_online: Timestamp.now(),
                                status: 'online'
                            }
                        };

                        // Add device first
                        const newDevice = await addDevice(deviceData);
                        console.log('Device added:', newDevice.id);

                        // Update order with payment details - use updateOrder instead of createOrder
                        await updateOrder(order.id, {
                            flutterwave_reference: mockResponse.transaction_id,
                            status: 'completed',
                            payment_details: mockResponse,
                            device_id: newDevice.id
                        });
                        console.log('Order updated with device ID:', newDevice.id);

                        setOrderSuccess(true);
                        if (onOrderComplete) onOrderComplete();

                        alert(`[DEV MODE] Your ${product.name} has been successfully purchased and registered!`);
                    } catch (error) {
                        console.error('Error processing payment:', error);
                        setOrderError('Payment processing failed. Please try again.');
                    } finally {
                        setIsProcessing(false);
                    }
                }, 2000);

                return;
            }

            // Production mode - use Flutterwave
            const config = {
                public_key: 'FLWPUBK_TEST-841c10b026f35195c62cfc032d14c5a0-X',
                tx_ref: reference,
                amount: product.price,
                currency: 'NGN',
                payment_options: 'card,banktransfer,ussd',
                customer: {
                    email: user.email || 'customer@FermWise.com',
                    phone_number: user.phoneNumber || '',
                    name: user.displayName || 'Valued Customer',
                },
                customizations: {
                    title: 'FermWise Bot Purchase',
                    description: `Purchase of ${product.name}`,
                    logo: 'https://FermWise.com/logo.png',
                },
            };

            const handleFlutterPayment = useFlutterwave(config);

            // Open Flutterwave payment modal
            handleFlutterPayment({
                callback: async (response) => {
                    closePaymentModal();
                    console.log(response);

                    // Check for successful payment with different possible status values
                    if (response.status === 'completed' || response.status === 'successful') {
                        try {
                            // Clean the response object to remove undefined values
                            const cleanResponse = Object.fromEntries(
                                Object.entries(response).filter(([_, v]) => v !== undefined)
                            );

                            // Generate a unique device ID
                            const deviceId = `device-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

                            // Register the device automatically
                            const deviceData = {
                                name: `${product.name}`,
                                type: product.type,
                                status: 'online',
                                farm_id: user.uid,
                                user_id: user.uid,
                                purchase_date: Timestamp.now(),
                                order_id: order.id,
                                device_id: deviceId,
                                health: {
                                    battery_level: 100,
                                    signal_strength: 95,
                                    firmware_version: '1.0.0',
                                    last_online: Timestamp.now(),
                                    status: 'online'
                                }
                            };

                            console.log('Registering device with data:', deviceData);

                            // Add device first
                            const newDevice = await addDevice(deviceData);
                            console.log('Device registered successfully with ID:', newDevice.id);

                            // Update order with payment details and device ID
                            await updateOrder(order.id, {
                                flutterwave_reference: response.transaction_id,
                                status: 'completed',
                                payment_details: cleanResponse,
                                device_id: newDevice.id
                            });
                            console.log('Order updated with device ID:', newDevice.id);

                            setOrderSuccess(true);
                            if (onOrderComplete) onOrderComplete();

                            alert(`Your ${product.name} has been successfully purchased and registered!`);
                        } catch (error) {
                            console.error('Error processing payment:', error);
                            setOrderError('Payment successful but device registration failed.');
                        }
                    } else {
                        setOrderError('Payment was not successful. Please try again.');
                    }
                    setIsProcessing(false);
                },
                onClose: () => {
                    setIsProcessing(false);
                }
            });
        } catch (error) {
            console.error('Error initiating payment:', error);
            setOrderError('Could not initiate payment. Please try again later.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            {orderError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{orderError}</p>
                        </div>
                    </div>
                </div>
            )}

            {orderSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Your purchase was successful! Your device has been registered to your account.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="text-6xl text-primary">
                                    <FaRobot />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                            <div className="mb-4">
                                <h4 className="font-medium text-sm mb-2">Features:</h4>
                                <ul className="text-sm space-y-1">
                                    {product.features.map((feature, index) => (
                                        <li key={`${product.id}-feature-${index}`} className="flex items-start">
                                            <span className="text-green-500 mr-2 mt-0.5">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold">₦{product.price.toLocaleString()}</span>
                                <button
                                    onClick={() => handlePurchase(product)}
                                    disabled={isProcessing}
                                    className="btn btn-primary btn-sm"
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs mr-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Buy Now'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-primary bg-opacity-5 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Why Choose FermWise Bot?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary mr-3">
                            <FaMicrochip className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">Smart Sensors</h4>
                            <p className="text-sm text-gray-600">Advanced sensors to monitor all aspects of your farm</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary mr-3">
                            <FaWifi className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">Wireless Connectivity</h4>
                            <p className="text-sm text-gray-600">Real-time data transmission to your dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary mr-3">
                            <FaRobot className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">AI-Powered</h4>
                            <p className="text-sm text-gray-600">Intelligent recommendations based on your farm's data</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary mr-3">
                            <FaLeaf className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">Crop Optimization</h4>
                            <p className="text-sm text-gray-600">Maximize yields with data-driven farming</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary mr-3">
                            <FaCloudUploadAlt className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">Cloud Storage</h4>
                            <p className="text-sm text-gray-600">Secure storage of all your farm data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 