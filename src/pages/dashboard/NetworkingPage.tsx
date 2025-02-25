import { useState } from 'react'
import { NetworkingHub } from '../../components/dashboard/NetworkingHub'
import { Switch } from '../../components/ui/Switch'
import { FaUsers, FaUserPlus, FaComments, FaSearch } from 'react-icons/fa'

const NetworkingPage = () => {
    const [useTestData, setUseTestData] = useState(true)
    const [activeTab, setActiveTab] = useState('farmers')

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Farmer Network</h1>
                        <p className="text-sm md:text-base text-gray-600">Connect with other farmers and experts</p>
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

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search for farmers, experts, or topics..."
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex overflow-x-auto space-x-4 pb-2">
                    <button
                        onClick={() => setActiveTab('farmers')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'farmers' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaUsers className="mr-2" /> Farmers
                    </button>
                    <button
                        onClick={() => setActiveTab('experts')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'experts' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaUserPlus className="mr-2" /> Experts
                    </button>
                    <button
                        onClick={() => setActiveTab('discussions')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'discussions' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaComments className="mr-2" /> Discussions
                    </button>
                </div>
            </div>

            {/* Main Networking Component */}
            <NetworkingHub />

            {/* Recommended Connections */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Recommended Connections</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-start">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold mr-4">
                                JD
                            </div>
                            <div>
                                <h3 className="font-medium">John Doe</h3>
                                <p className="text-sm text-gray-600">Maize Farmer • 15km away</p>
                                <button className="mt-2 btn btn-sm btn-outline">Connect</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Upcoming Farming Events</h2>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">Local Farmers Market</h3>
                                <p className="text-sm text-gray-600">June 15, 2023 • 9:00 AM - 2:00 PM</p>
                                <p className="text-sm text-gray-600 mt-2">Central Market Square, Lagos</p>
                            </div>
                            <button className="btn btn-sm btn-outline">Interested</button>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">Agricultural Workshop</h3>
                                <p className="text-sm text-gray-600">June 22, 2023 • 10:00 AM - 12:00 PM</p>
                                <p className="text-sm text-gray-600 mt-2">Community Center, Lagos</p>
                            </div>
                            <button className="btn btn-sm btn-outline">Interested</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NetworkingPage 