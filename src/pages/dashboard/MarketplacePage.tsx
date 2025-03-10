import { useState, useEffect } from 'react';
import { ProductStore } from '../../components/marketplace/ProductStore';
import { FaStore, FaExchangeAlt, FaShoppingBasket, FaBox, FaDownload, FaEye } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { getUserOrders } from '../../services/firebaseService';
import { Timestamp } from 'firebase/firestore';

interface Order {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    amount: number;
    currency: string;
    payment_reference: string;
    flutterwave_reference: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: Timestamp;
    device_id?: string;
}

const MarketplacePage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('products');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user orders when the orders tab is selected
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const userOrders = await getUserOrders(user.uid) as unknown as Order[];
            setOrders(userOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load your orders. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp || !timestamp.seconds) return 'Unknown';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
            case 'pending':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'failed':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span>;
            default:
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Marketplace</h1>
                <div className="tabs tabs-boxed">
                    <button
                        className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FaStore className="mr-2" /> Products
                    </button>
                    <button
                        className={`tab ${activeTab === 'produce' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('produce')}
                    >
                        <FaExchangeAlt className="mr-2" /> Produce Exchange
                    </button>
                    <button
                        className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaShoppingBasket className="mr-2" /> My Orders
                    </button>
                </div>
            </div>

            {activeTab === 'products' && (
                <ProductStore onOrderComplete={fetchOrders} />
            )}

            {activeTab === 'produce' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <FaExchangeAlt className="text-primary mr-3 text-xl" />
                        <h2 className="text-xl font-semibold">Produce Exchange</h2>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Coming soon! The produce exchange will allow you to list your farm produce and connect with buyers directly.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center py-12">
                        <FaBox className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Produce Exchange Coming Soon</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            We're working on building a marketplace where you can sell your farm produce directly to buyers.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <FaShoppingBasket className="text-primary mr-3 text-xl" />
                        <h2 className="text-xl font-semibold">My Orders</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.payment_reference || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.product_name || 'Unknown Product'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">₦{order.amount ? order.amount.toLocaleString() : '0'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    className="text-primary hover:text-primary-focus mr-3"
                                                    onClick={() => window.open(`/dashboard/devices?device=${order.device_id}`, '_blank')}
                                                    disabled={!order.device_id}
                                                >
                                                    <FaEye className="inline mr-1" /> View Device
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-gray-900"
                                                    onClick={() => {
                                                        // Generate and download receipt
                                                        alert('Receipt download functionality coming soon');
                                                    }}
                                                >
                                                    <FaDownload className="inline mr-1" /> Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaShoppingBasket className="mx-auto h-16 w-16 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No Orders Yet</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                You haven't made any purchases yet. Browse our products to get started.
                            </p>
                            <button
                                onClick={() => setActiveTab('products')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <FaStore className="-ml-1 mr-2 h-5 w-5" />
                                Browse Products
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarketplacePage; 