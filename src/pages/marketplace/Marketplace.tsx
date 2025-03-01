import { useState, useEffect } from 'react'
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa'
import ProductCard from './ProductCard'
import FilterSidebar from './FilterSidebar'
import { getProducts, addProduct } from '../../services/productService'
import { Product } from './ProductCard'

const Marketplace = () => {
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState<Product[]>([])

    // Fetch products from Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            const fetchedProducts = await getProducts()
            setProducts(fetchedProducts)
        }

        fetchProducts()
    }, [])

    // Add a new product (example)
    const handleAddProduct = async () => {
        const newProduct: Product = {
            id: '', // Firebase will auto-generate this
            name: 'Fresh Carrots',
            description: 'Locally sourced organic carrots',
            price: 1200,
            unit: 'kg',
            image: '/images/products/carrots.jpg',
            farmer: {
                name: 'Jane Doe',
                rating: 4.8
            }
        }
        const docRef = await addProduct(newProduct)
        setProducts([...products, { ...newProduct, id: docRef.id }]) // Update local state with generated id
    }

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
                            onClick={handleAddProduct} // Add product on button click
                        >
                            <FaPlus className="mr-2" /> Add Product
                        </button>
                        <button
                            className="btn btn-outline"
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