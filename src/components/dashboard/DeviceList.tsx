import { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { where } from 'firebase/firestore';
import { addDevice } from '../../services/firebaseService';

interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    farm_id: string;
    last_reading?: string;
}

export const DeviceList = ({ farmId }: { farmId: string }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [newDeviceType, setNewDeviceType] = useState('sensor');

    // Use our custom hook to get real-time device data
    const { data: devices, loading, error } = useFirestore<Device>({
        collectionName: 'devices',
        constraints: [where('farm_id', '==', farmId)],
        orderByField: 'name'
    });

    const handleAddDevice = async () => {
        if (!newDeviceName.trim()) return;

        try {
            setIsAdding(true);
            await addDevice({
                name: newDeviceName,
                type: newDeviceType,
                farm_id: farmId,
                status: 'active'
            });

            // Reset form
            setNewDeviceName('');
            setNewDeviceType('sensor');
        } catch (err) {
            console.error('Error adding device:', err);
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return <div className="loading loading-spinner loading-lg"></div>;
    }

    if (error) {
        return <div className="alert alert-error">Error loading devices: {error.message}</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Devices</h2>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? 'Cancel' : 'Add Device'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-3">Add New Device</h3>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Device Name"
                            className="input input-bordered w-full"
                            value={newDeviceName}
                            onChange={(e) => setNewDeviceName(e.target.value)}
                        />
                        <select
                            className="select select-bordered w-full"
                            value={newDeviceType}
                            onChange={(e) => setNewDeviceType(e.target.value)}
                        >
                            <option value="sensor">Sensor</option>
                            <option value="controller">Controller</option>
                            <option value="camera">Camera</option>
                        </select>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddDevice}
                            disabled={!newDeviceName.trim()}
                        >
                            Add Device
                        </button>
                    </div>
                </div>
            )}

            {devices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No devices found. Add your first device to get started.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Last Reading</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device) => (
                                <tr key={device.id}>
                                    <td>{device.name}</td>
                                    <td>{device.type}</td>
                                    <td>
                                        <span className={`badge ${device.status === 'active' ? 'badge-success' :
                                            device.status === 'inactive' ? 'badge-warning' :
                                                'badge-error'
                                            }`}>
                                            {device.status}
                                        </span>
                                    </td>
                                    <td>{device.last_reading || 'No readings'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-ghost">View</button>
                                        <button className="btn btn-sm btn-ghost text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}; 