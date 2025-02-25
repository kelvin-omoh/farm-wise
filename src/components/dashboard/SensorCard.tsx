import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { useTestDataStore } from '../../stores/testDataStore'

interface SensorCardProps {
    title: string
    value: string
    unit: string
    icon: IconType
    color: string
    index: number
    useTestData?: boolean
}

export const SensorCard = ({ title, value, unit, icon: Icon, color, index }: SensorCardProps) => {
    const { useTestData } = useTestDataStore()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex items-end">
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-sm text-gray-500 ml-1">{unit}</span>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(parseInt(value) / 100 * 100, 100)}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full ${color.replace('text', 'bg')}`}
                />
            </div>
        </motion.div>
    )
} 