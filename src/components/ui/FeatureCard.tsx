import { ElementType } from 'react'
import { motion } from 'framer-motion'

interface FeatureCardProps {
    icon: ElementType
    title: string
    description: string
    color?: 'primary' | 'secondary' | 'accent'
    index: number
    image: string
}

const FeatureCard = ({ icon: Icon, title, description, color = 'primary', index, image }: FeatureCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="card bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
            <figure className="px-6 pt-6">
                <img src={image} alt={title} className="rounded-xl h-48 w-full object-cover" />
            </figure>
            <div className="card-body">
                <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <h3 className="card-title text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </motion.div>
    )
}

export default FeatureCard 