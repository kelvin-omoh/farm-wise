import { useState } from 'react'
import { FarmProfileSetup } from '../../components/dashboard/FarmProfileSetup'
import { Switch } from '../../components/ui/Switch'
import { FaUser, FaFarm, FaMapMarkerAlt, FaEdit, FaCamera } from 'react-icons/fa'

const ProfilePage = () => {
    const [useTestData, setUseTestData] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Farm Profile</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage your farm information</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <FaEdit className="mr-2" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <FarmProfileSetup />
            ) : (
                <>
                    {/* Farm Profile Overview */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="h-48 bg-gradient-to-r from-primary to-blue-600 relative">
                            <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md">
                                <FaCamera className="text-gray-700" />
                            </button>
                        </div>
                        <div className="p-6 relative">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md absolute -top-12 left-6 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                                    J
                                </div>
                            </div>
                            <div className="ml-32">
                                <h2 className="text-2xl font-bold">John's Farm</h2>
                                <p className="text-gray-600 flex items-center">
                                    <FaMapMarkerAlt className="mr-1" /> Lagos, Nigeria
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Farm Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Farm Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Farm Name</h3>
                                <p className="text-lg">John's Farm</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Farm Type</h3>
                                <p className="text-lg">Mixed Farming</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Farm Size</h3>
                                <p className="text-lg">5 hectares</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                <p className="text-lg">Lagos, Nigeria</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Primary Crops</h3>
                                <p className="text-lg">Maize, Cassava, Vegetables</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Livestock</h3>
                                <p className="text-lg">Chickens, Goats</p>
                            </div>
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Owner Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                <p className="text-lg">John Doe</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                <p className="text-lg">john@example.com</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                <p className="text-lg">+234 123 456 7890</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                                <p className="text-lg">5 years</p>
                            </div>
                        </div>
                    </div>

                    {/* Farm Photos */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Farm Photos</h2>
                            <button className="btn btn-sm btn-outline">
                                <FaCamera className="mr-2" /> Add Photos
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-400">Photo {i}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ProfilePage 