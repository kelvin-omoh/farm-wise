// import { useState } from 'react';
// import { useFirestore } from '../../hooks/useFirestore';
// import { where } from 'firebase/firestore';
// import { addDevice } from '../../services/firebaseService';
import { FaMicrochip, FaEye } from 'react-icons/fa';

interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
    farm_id: string;
    last_reading?: string;
    serial_no?: string;
    device_id?: string;
    health?: {
        battery_level?: number;
        signal_strength?: number;
        firmware_version?: string;
        last_online?: {
            seconds: number;
        };
    };
}

interface DeviceListProps {
    devices: Device[];
    onViewDevice: (deviceId: string) => void;
}

export const DeviceList = ({ devices, onViewDevice }: DeviceListProps) => {
    { console.log(devices) }
    return (
        <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Device
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device) => (
                        <tr key={device.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                                        <FaMicrochip className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                        <div className="text-sm text-gray-500">{device.serial_no || device.device_id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${device.status === 'online' ? 'bg-green-100 text-green-800' :
                                    device.status === 'offline' ? 'bg-red-100 text-red-800' :
                                        'bg-green-400 text-yellow-800'
                                    }`}>
                                    {device.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {device.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {device.health?.last_online ?
                                    new Date(device.health.last_online.seconds * 1000).toLocaleString() :
                                    'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onViewDevice(device.id)}
                                    className="text-primary hover:text-primary-focus mr-3"
                                >
                                    <FaEye className="inline mr-1" /> View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 