import { motion } from 'framer-motion'
import { FaCheck } from 'react-icons/fa'
import { Link } from 'react-router-dom'

interface PricingCardProps {
    title: string
    price: number
    period: string
    features: string[]
    recommended?: boolean
    index: number
}

const PricingCard = ({ title, price, period, features, recommended, index }: PricingCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`card ${recommended ? 'bg-primary text-white' : 'bg-white'} shadow-xl`}
        >
            <div className="card-body">
                {recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="badge badge-secondary">Recommended</span>
                    </div>
                )}
                <h3 className="text-2xl font-bold text-center mb-2">{title}</h3>
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold">₦{price.toLocaleString()}</span>
                    <span className="text-sm opacity-80">/{period}</span>
                </div>
                <ul className="space-y-4 mb-6">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <FaCheck className={`${recommended ? 'text-secondary' : 'text-primary'}`} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <Link
                    to="/register"
                    className={`btn ${recommended ? 'btn-secondary' : 'btn-primary'} w-full`}
                >
                    Get Started
                </Link>
            </div>
        </motion.div>
    )
}

export default PricingCard 