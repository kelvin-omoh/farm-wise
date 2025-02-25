import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

interface Product {
    id: string
    name: string
    description: string
    price: number
    unit: string
    image: string
    farmer: {
        name: string
        rating: number
    }
}

interface ProductCardProps {
    product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
            <figure>
                <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
            </figure>
            <div className="card-body">
                <h3 className="card-title">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <div className="flex items-center gap-2 mt-2">
                    <FaStar className="text-yellow-400" />
                    <span>{product.farmer.rating}</span>
                    <span className="text-gray-500">• {product.farmer.name}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="text-xl font-bold">
                        ₦{product.price.toLocaleString()}/{product.unit}
                    </div>
                    <button className="btn btn-primary">Buy Now</button>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductCard 