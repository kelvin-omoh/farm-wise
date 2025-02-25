import { FaStore, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const recentListings = [
    {
        id: 1,
        title: 'Organic Tomatoes',
        price: '₦2,500',
        quantity: '50kg',
        buyer: 'Lagos Foods Ltd',
        status: 'new'
    },
    {
        id: 2,
        title: 'Fresh Cassava',
        price: '₦1,800',
        quantity: '100kg',
        buyer: 'AgroProcessors',
        status: 'pending'
    },
    {
        id: 3,
        title: 'Sweet Potatoes',
        price: '₦3,000',
        quantity: '75kg',
        buyer: 'Market Direct',
        status: 'completed'
    }
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return 'bg-green-100 text-green-800'
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'completed': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export const MarketplacePreview = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaStore className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Recent Market Activity</h2>
                </div>
                <Link
                    to="/dashboard/marketplace"
                    className="text-primary hover:text-primary-dark flex items-center gap-2"
                >
                    View All <FaArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="space-y-4">
                {recentListings.map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div>
                            <h3 className="font-medium">{listing.title}</h3>
                            <div className="text-sm text-gray-500">
                                {listing.quantity} • {listing.buyer}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-lg font-semibold">{listing.price}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 