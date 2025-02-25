import { useState } from 'react'
import { FaTasks, FaCheck, FaClock } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
    id: number
    title: string
    due: string
    priority: 'high' | 'medium' | 'low'
    status: 'pending' | 'completed'
}

const tasks: Task[] = [
    { id: 1, title: 'Irrigation System Check', due: 'Today', priority: 'high', status: 'pending' },
    { id: 2, title: 'Harvest Tomatoes', due: 'Tomorrow', priority: 'medium', status: 'pending' },
    { id: 3, title: 'Fertilizer Application', due: 'Next Week', priority: 'low', status: 'completed' }
]

export const TaskManagement = () => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500'
            case 'medium': return 'text-yellow-500'
            case 'low': return 'text-green-500'
            default: return 'text-gray-500'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaTasks className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Tasks</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredTasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                {task.status === 'completed' ? (
                                    <FaCheck className="w-5 h-5 text-green-500" />
                                ) : (
                                    <FaClock className={`w-5 h-5 ${getPriorityColor(task.priority)}`} />
                                )}
                                <div>
                                    <h3 className="font-medium">{task.title}</h3>
                                    <div className="text-sm text-gray-500">Due: {task.due}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
} 