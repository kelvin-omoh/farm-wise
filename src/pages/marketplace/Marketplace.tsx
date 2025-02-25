import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaFilter } from 'react-icons/fa'
import ProductCard from './ProductCard'
import FilterSidebar from './FilterSidebar'

const Marketplace = () => {
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Mock data - replace with real data from API
    const products = [
        {
            id: '1',
            name: 'Fresh Tomatoes',
            description: 'Organically grown tomatoes from Lagos State',
            price: 1500,
            unit: 'kg',
            image: '/images/products/tomatoes.jpg',
            farmer: {
                name: 'John Doe',
                rating: 4.5
            }
        },
        // Add more mock products...
    ]

    return (
        <div className="min-h-screen bg-base-200">
            {/* Search Bar */}
            <div className="bg-white shadow-md py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input input-bordered w-full pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter className="mr-2" /> Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <FilterSidebar show={showFilters} onClose={() => setShowFilters(false)} />

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Marketplace 