import { FaChartBar, FaBoxes, FaTractor, FaUsers } from 'react-icons/fa'
import { motion } from 'framer-motion'

const stats = [
    {
        title: 'Total Crops',
        value: '12',
        unit: 'types',
        icon: FaBoxes,
        change: '+2 from last month'
    },
    {
        title: 'Active Devices',
        value: '8',
        unit: 'devices',
        icon: FaTractor,
        change: 'All working properly'
    },
    {
        title: 'Connected Buyers',
        value: '24',
        unit: 'buyers',
        icon: FaUsers,
        change: '+5 new this month'
    }
]


export const FarmStatistics = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaChartBar className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Farm Statistics</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-gray-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className="w-5 h-5 text-primary" />
                            <span className="text-gray-600">{stat.title}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {stat.value} <span className="text-sm font-normal text-gray-500">{stat.unit}</span>
                        </div>
                        <div className="text-sm text-gray-500">{stat.change}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
} 