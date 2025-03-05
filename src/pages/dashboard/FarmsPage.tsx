import { useState, useEffect } from 'react';
import { FaPlus, FaLeaf, FaMapMarkerAlt, FaRuler, FaCalendarAlt, FaChartLine, FaMicrochip, FaLink } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../../config/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp,
    getDoc
} from 'firebase/firestore';
import { Modal } from '../../components/ui/Modal';
import { DeviceRegistration } from '../../components/dashboard/DeviceRegistration';
import { Link } from 'react-router-dom';

// Farm interface
interface Farm {
    id: string;
    name: string;
    location: string;
    size: number;
    size_unit: string;
    crop_type?: string;
    planting_date?: Timestamp;
    expected_harvest_date?: Timestamp;
    owner_id: string;
    created_at: Timestamp;
    device_count?: number;
    yield_estimate?: number;
    yield_unit?: string;
    notes?: string;
    status?: 'active' | 'inactive' | 'archived';
}

// Form data interface
interface FarmFormData {
    name: string;
    location: string;
    size: number;
    size_unit: string;
    crop_type?: string;
    planting_date?: string;
    expected_harvest_date?: string;
    notes?: string;
}

// Add Device interface
interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    farm_id: string;
    device_id?: string;
}

// Add this new interface for device form data
interface DeviceFormData {
    name: string;
    type: string;
    location?: string;
    description?: string;
    order_id?: string;
    id?: string;
}

const FarmsPage = () => {
    const { user } = useAuthStore() as { user: FirebaseUser | null };
    const [farms, setFarms] = useState<Farm[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddFarm, setShowAddFarm] = useState(false);
    const [showEditFarm, setShowEditFarm] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [formData, setFormData] = useState<FarmFormData>({
        name: '',
        location: '',
        size: 0,
        size_unit: 'hectares',
        crop_type: '',
        planting_date: '',
        expected_harvest_date: '',
        notes: ''
    });
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [selectedFarmForDevice, setSelectedFarmForDevice] = useState<Farm | null>(null);
    const [farmDevices, setFarmDevices] = useState<{ [farmId: string]: Device[] }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [farmsPerPage] = useState(6); // Number of farms to display per page

    // Fetch farms when component mounts
    useEffect(() => {
        if (user) {
            fetchFarms();
        }
    }, [user]);

    // Fetch devices for each farm
    const fetchDevicesForFarm = async (farmId: string) => {
        try {
            const devicesRef = collection(db, 'devices');
            const q = query(devicesRef, where('farm_id', '==', farmId));
            const querySnapshot = await getDocs(q);

            const devices: Device[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                devices.push({
                    id: doc.id,
                    name: data.name || 'Unnamed Device',
                    type: data.type || 'unknown',
                    status: data.status || 'inactive',
                    farm_id: data.farm_id,
                    device_id: data.device_id
                } as Device);
            });
            console.log(`Devices for farm ${farmId}:`, devices);

            return devices;
        } catch (err) {
            console.error(`Error fetching devices for farm ${farmId}:`, err);
            return [];
        }
    };

    // Fetch farms from Firestore
    const fetchFarms = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, where('owner_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const farmsData: Farm[] = [];
            const devicesData: { [farmId: string]: Device[] } = {};

            for (const doc of querySnapshot.docs) {
                const farmData = doc.data() as Omit<Farm, 'id'>;
                const farmId = doc.id;

                // Fetch devices for this farm
                const devices = await fetchDevicesForFarm(farmId);
                console.log(devices);

                devicesData[farmId] = devices;

                farmsData.push({
                    ...farmData,
                    id: farmId,
                    device_count: devices.length
                } as Farm);
            }

            setFarms(farmsData);
            setFarmDevices(devicesData);
        } catch (err) {
            console.error('Error fetching farms:', err);
            setError(`Failed to fetch farms: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'size' ? parseFloat(value) || 0 : value
        }));
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            name: '',
            location: '',
            size: 0,
            size_unit: 'hectares',
            crop_type: '',
            planting_date: '',
            expected_harvest_date: '',
            notes: ''
        });
    };

    // Handle form submission for adding a new farm
    const handleAddFarm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const newFarm = {
                ...formData,
                owner_id: user.uid,
                created_at: Timestamp.now(),
                status: 'active' as const,
                planting_date: formData.planting_date ? Timestamp.fromDate(new Date(formData.planting_date)) : null,
                expected_harvest_date: formData.expected_harvest_date ? Timestamp.fromDate(new Date(formData.expected_harvest_date)) : null
            };

            await addDoc(collection(db, 'farms'), newFarm);
            setShowAddFarm(false);
            resetForm();
            fetchFarms();
        } catch (err) {
            console.error('Error adding farm:', err);
            setError(`Failed to add farm: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle editing a farm
    const handleEditFarm = (farm: Farm) => {
        setSelectedFarm(farm);
        setFormData({
            name: farm.name,
            location: farm.location,
            size: farm.size,
            size_unit: farm.size_unit,
            crop_type: farm.crop_type || '',
            planting_date: farm.planting_date ? new Date(farm.planting_date.seconds * 1000).toISOString().split('T')[0] : '',
            expected_harvest_date: farm.expected_harvest_date ? new Date(farm.expected_harvest_date.seconds * 1000).toISOString().split('T')[0] : '',
            notes: farm.notes || ''
        });
        setShowEditFarm(true);
    };

    // Handle form submission for updating a farm
    const handleUpdateFarm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedFarm) return;

        setIsLoading(true);
        try {
            // Create a clean object with only defined values
            const updatedFarmData: any = {};

            // Only add fields that have values
            if (formData.name) updatedFarmData.name = formData.name;
            if (formData.location) updatedFarmData.location = formData.location;
            if (formData.size !== undefined) updatedFarmData.size = formData.size;
            if (formData.size_unit) updatedFarmData.size_unit = formData.size_unit;
            if (formData.crop_type) updatedFarmData.crop_type = formData.crop_type;

            // Handle dates
            if (formData.planting_date) {
                updatedFarmData.planting_date = Timestamp.fromDate(new Date(formData.planting_date));
            }

            if (formData.expected_harvest_date) {
                updatedFarmData.expected_harvest_date = Timestamp.fromDate(new Date(formData.expected_harvest_date));
            }

            // Add notes if present
            if (formData.notes !== undefined) updatedFarmData.notes = formData.notes;

            const farmRef = doc(db, 'farms', selectedFarm.id);
            await updateDoc(farmRef, updatedFarmData);

            setShowEditFarm(false);
            setSelectedFarm(null);
            resetForm();
            fetchFarms();
        } catch (err) {
            console.error('Error updating farm:', err);
            setError(`Failed to update farm: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting a farm
    const handleDeleteFarm = async (farmId: string) => {
        if (!confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        try {
            await deleteDoc(doc(db, 'farms', farmId));
            fetchFarms();
        } catch (err) {
            console.error('Error deleting farm:', err);
            setError(`Failed to delete farm: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Format date for display
    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'Not set';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    // Handle adding a device to a farm
    const handleAddDeviceToFarm = (farm: Farm) => {
        setSelectedFarmForDevice(farm);
        setShowAddDevice(true);
    };

    // Handle device form submission
    const handleDeviceSubmit = async (deviceData: DeviceFormData) => {
        if (!user || !selectedFarmForDevice) return;

        setIsLoading(true);
        setError(null); // Clear any previous errors

        try {
            console.log('Received device data:', deviceData);

            // First, check if this device is already registered to this farm
            const devicesRef = collection(db, 'devices');
            const deviceQuery = query(
                devicesRef,
                where('farm_id', '==', selectedFarmForDevice.id),
                where('device_id', '==', deviceData.id)
            );

            const existingDevices = await getDocs(deviceQuery);

            if (!existingDevices.empty) {
                throw new Error('This device is already registered to this farm');
            }

            // Add the device to Firestore with all required fields
            const newDevice = {
                name: deviceData.name,
                type: deviceData.type || 'soil_sensor',
                location: deviceData.location || '',
                description: deviceData.description || '',
                device_id: deviceData.id, // Store the original device ID from the order
                farm_id: selectedFarmForDevice.id,
                owner_id: user.uid,
                status: 'active',
                created_at: Timestamp.now()
            };

            console.log('Adding new device:', newDevice);
            const docRef = await addDoc(collection(db, 'devices'), newDevice);
            console.log('Device added with ID:', docRef.id);

            // If this was a device from an order, mark it as registered
            if (deviceData.order_id) {
                const orderRef = doc(db, 'orders', deviceData.order_id);
                const orderDoc = await getDoc(orderRef);

                if (orderDoc.exists()) {
                    // Update the order to mark this device as registered
                    await updateDoc(orderRef, {
                        device_registered: true,
                        device_registered_at: Timestamp.now(),
                        device_registered_to_farm: selectedFarmForDevice.id
                    });
                    console.log('Order updated to mark device as registered');
                }
            }

            // Close the modal and refresh data
            setShowAddDevice(false);
            setSelectedFarmForDevice(null);
            await fetchFarms(); // Make sure to await this
            return true; // Return true to indicate success
        } catch (err) {
            console.error('Error adding device:', err);
            setError(`Failed to add device: ${err instanceof Error ? err.message : String(err)}`);
            throw err; // Re-throw the error so the DeviceRegistration component can handle it
        } finally {
            setIsLoading(false);
        }
    };

    // Add this to the farm card rendering section
    const renderFarmDevices = (farm: Farm) => {
        const devices = farmDevices[farm.id] || [];

        if (devices.length === 0) {
            return (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">No devices connected to this farm</p>
                    <button
                        onClick={() => handleAddDeviceToFarm(farm)}
                        className="mt-2 text-sm text-primary hover:text-primary-focus flex items-center"
                    >
                        <FaPlus className="mr-1" size={12} /> Add a device
                    </button>
                </div>
            );
        }

        return (
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Connected Devices ({devices.length})</h3>
                    <button
                        onClick={() => handleAddDeviceToFarm(farm)}
                        className="text-sm text-primary hover:text-primary-focus flex items-center"
                    >
                        <FaPlus className="mr-1" size={12} /> Add
                    </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {devices.map(device => (
                        <div key={device.id} className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
                            <div className="flex items-center">
                                <FaMicrochip className="text-gray-400 mr-2" />
                                <div>
                                    <p className="text-sm font-medium">{device.name}</p>
                                    <p className="text-xs text-gray-500">{device.type}</p>
                                </div>
                            </div>
                            <Link
                                to="/dashboard/devices"
                                className="text-xs text-primary hover:text-primary-focus"
                            >
                                <FaLink />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Add this function to calculate pagination
    const indexOfLastFarm = currentPage * farmsPerPage;
    const indexOfFirstFarm = indexOfLastFarm - farmsPerPage;
    const currentFarms = farms.slice(indexOfFirstFarm, indexOfLastFarm);
    const totalPages = Math.ceil(farms.length / farmsPerPage);

    // Add this function to handle page changes
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to top of the farms section
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add this component for pagination controls
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center mt-8">
                <div className="join">
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        «
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        className="join-item btn btn-sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Farm Management</h1>
                        <p className="text-sm md:text-base text-gray-600">Create and manage your farming workspaces</p>
                    </div>
                    <button
                        onClick={() => setShowAddFarm(true)}
                        className="mt-4 md:mt-0 btn btn-primary"
                    >
                        <FaPlus className="mr-2" /> Add New Farm
                    </button>
                </div>
            </div>

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

            {/* Farms Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : farms.length > 0 ? (
                    currentFarms.map(farm => (
                        <div key={farm.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-semibold">{farm.name}</h2>
                                    <span className={`px-2 py-1 text-xs rounded-full ${farm.status === 'active' ? 'bg-green-100 text-green-800' :
                                        farm.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {farm.status ? (farm.status.charAt(0).toUpperCase() + farm.status.slice(1)) : 'Unknown'}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <FaMapMarkerAlt className="mr-2" />
                                        <span>{farm.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FaRuler className="mr-2" />
                                        <span>{farm.size} {farm.size_unit}</span>
                                    </div>
                                    {farm.crop_type && (
                                        <div className="flex items-center text-gray-600">
                                            <FaLeaf className="mr-2" />
                                            <span>{farm.crop_type}</span>
                                        </div>
                                    )}
                                    {farm.planting_date && (
                                        <div className="flex items-center text-gray-600">
                                            <FaCalendarAlt className="mr-2" />
                                            <span>Planted: {formatDate(farm.planting_date)}</span>
                                        </div>
                                    )}
                                    {farm.expected_harvest_date && (
                                        <div className="flex items-center text-gray-600">
                                            <FaChartLine className="mr-2" />
                                            <span>Expected harvest: {formatDate(farm.expected_harvest_date)}</span>
                                        </div>
                                    )}
                                </div>

                                {renderFarmDevices(farm)}

                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEditFarm(farm)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFarm(farm.id)}
                                        className="btn btn-sm btn-error btn-outline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="py-12">
                            <FaLeaf className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No farms</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't created any farms yet.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAddFarm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                    Create your first farm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add pagination controls */}
            {farms.length > 0 && <PaginationControls />}

            {/* Add Farm Modal */}
            {showAddFarm && (
                <Modal
                    title="Add New Farm"
                    onClose={() => {
                        setShowAddFarm(false);
                        resetForm();
                    }}
                >
                    <form onSubmit={handleAddFarm} className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Farm Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                                    <input
                                        type="number"
                                        id="size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="size_unit" className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select
                                        id="size_unit"
                                        name="size_unit"
                                        value={formData.size_unit}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    >
                                        <option value="hectares">Hectares</option>
                                        <option value="acres">Acres</option>
                                        <option value="square_meters">Square Meters</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="crop_type" className="block text-sm font-medium text-gray-700">Crop Type</label>
                                <input
                                    type="text"
                                    id="crop_type"
                                    name="crop_type"
                                    value={formData.crop_type}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="planting_date" className="block text-sm font-medium text-gray-700">Planting Date</label>
                                    <input
                                        type="date"
                                        id="planting_date"
                                        name="planting_date"
                                        value={formData.planting_date}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-gray-700">Expected Harvest</label>
                                    <input
                                        type="date"
                                        id="expected_harvest_date"
                                        name="expected_harvest_date"
                                        value={formData.expected_harvest_date}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddFarm(false);
                                    resetForm();
                                }}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : 'Create Farm'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Farm Modal */}
            {showEditFarm && selectedFarm && (
                <Modal
                    title={`Edit Farm: ${selectedFarm.name}`}
                    onClose={() => {
                        setShowEditFarm(false);
                        setSelectedFarm(null);
                        resetForm();
                    }}
                >
                    <form onSubmit={handleUpdateFarm} className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Farm Name</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    id="edit-location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-size" className="block text-sm font-medium text-gray-700">Size</label>
                                    <input
                                        type="number"
                                        id="edit-size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-size_unit" className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select
                                        id="edit-size_unit"
                                        name="size_unit"
                                        value={formData.size_unit}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    >
                                        <option value="hectares">Hectares</option>
                                        <option value="acres">Acres</option>
                                        <option value="square_meters">Square Meters</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-crop_type" className="block text-sm font-medium text-gray-700">Crop Type</label>
                                <input
                                    type="text"
                                    id="edit-crop_type"
                                    name="crop_type"
                                    value={formData.crop_type}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-planting_date" className="block text-sm font-medium text-gray-700">Planting Date</label>
                                    <input
                                        type="date"
                                        id="edit-planting_date"
                                        name="planting_date"
                                        value={formData.planting_date}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-expected_harvest_date" className="block text-sm font-medium text-gray-700">Expected Harvest</label>
                                    <input
                                        type="date"
                                        id="edit-expected_harvest_date"
                                        name="expected_harvest_date"
                                        value={formData.expected_harvest_date}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    id="edit-notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditFarm(false);
                                    setSelectedFarm(null);
                                    resetForm();
                                }}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : 'Update Farm'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Device Modal */}
            {showAddDevice && selectedFarmForDevice && (
                <Modal
                    title={`Add Device to ${selectedFarmForDevice.name}`}
                    onClose={() => {
                        setShowAddDevice(false);
                        setSelectedFarmForDevice(null);
                    }}
                >
                    <DeviceRegistration
                        onSubmit={handleDeviceSubmit}
                        onCancel={() => {
                            setShowAddDevice(false);
                            setSelectedFarmForDevice(null);
                        }}
                        farmId={selectedFarmForDevice.id}
                    />
                </Modal>
            )}
        </div>
    );
};

export default FarmsPage; 