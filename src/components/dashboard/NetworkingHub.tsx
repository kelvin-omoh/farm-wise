import { useState } from 'react'
import { FaUsers, FaUserPlus, FaComments, FaSearch, FaFilter } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface FarmerProfile {
    id: number
    name: string
    location: string
    farmType: string
    avatar: string
    isConnected: boolean
}

const mockFarmers: FarmerProfile[] = [
    {
        id: 1,
        name: 'John Adewale',
        location: 'Lagos, Nigeria',
        farmType: 'Crop Farming',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        isConnected: false
    },
    {
        id: 2,
        name: 'Amina Ibrahim',
        location: 'Kano, Nigeria',
        farmType: 'Livestock',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        isConnected: true
    },
    {
        id: 3,
        name: 'Emmanuel Okonkwo',
        location: 'Enugu, Nigeria',
        farmType: 'Mixed Farming',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        isConnected: false
    },
    {
        id: 4,
        name: 'Fatima Bello',
        location: 'Abuja, Nigeria',
        farmType: 'Poultry',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        isConnected: true
    }
]

export const NetworkingHub = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [farmers, setFarmers] = useState(mockFarmers)
    const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover')

    const filteredFarmers = farmers.filter(farmer => {
        const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            farmer.farmType.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'connections') {
            return matchesSearch && farmer.isConnected
        }

        return matchesSearch
    })

    const handleConnect = (id: number) => {
        setFarmers(farmers.map(farmer =>
            farmer.id === id ? { ...farmer, isConnected: !farmer.isConnected } : farmer
        ))
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaUsers className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Farmer Network</h2>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            className="input input-bordered w-full pl-10"
                            placeholder="Search farmers by name, location, or farm type"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button className="btn btn-outline btn-sm gap-2">
                        <FaFilter /> Filter
                    </button>
                </div>

                <div className="tabs tabs-boxed bg-gray-100 p-1">
                    <button
                        className={`tab ${activeTab === 'discover' ? 'bg-white' : ''}`}
                        onClick={() => setActiveTab('discover')}
                    >
                        Discover Farmers
                    </button>
                    <button
                        className={`tab ${activeTab === 'connections' ? 'bg-white' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        My Connections
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredFarmers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No farmers found matching your search criteria</p>
                    </div>
                ) : (
                    filteredFarmers.map(farmer => (
                        <motion.div
                            key={farmer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={farmer.avatar}
                                    alt={farmer.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-medium">{farmer.name}</h3>
                                    <div className="text-sm text-gray-500">
                                        {farmer.location} • {farmer.farmType}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`btn btn-sm ${farmer.isConnected ? 'btn-outline' : 'btn-primary'}`}
                                    onClick={() => handleConnect(farmer.id)}
                                >
                                    {farmer.isConnected ? 'Connected' : (
                                        <>
                                            <FaUserPlus className="w-4 h-4" /> Connect
                                        </>
                                    )}
                                </button>
                                {farmer.isConnected && (
                                    <button className="btn btn-sm btn-outline">
                                        <FaComments className="w-4 h-4" /> Message
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
} 