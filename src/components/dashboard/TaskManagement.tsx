import { useState } from 'react'
import { FaClipboardList, FaPlus, FaCheck, FaTrash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Task, addTask, updateTask, deleteTask } from '../../services/firebaseService'
import { Timestamp } from 'firebase/firestore'

interface TaskManagementProps {
    tasks: Task[];
    farmId: string;
    onTasksChange: () => void;
}

export const TaskManagement = ({ tasks = [], farmId, onTasksChange }: TaskManagementProps) => {
    const [showAddTask, setShowAddTask] = useState(false)
    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskDueDate, setTaskDueDate] = useState('')
    const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const tasksPerPage = 5

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!taskTitle) {
            setError('Task title is required')
            return
        }

        if (!taskDueDate) {
            setError('Due date is required')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const newTask: Omit<Task, 'id'> = {
                farm_id: farmId,
                title: taskTitle,
                description: taskDescription,
                due_date: Timestamp.fromDate(new Date(taskDueDate)),
                status: 'pending',
                priority: taskPriority,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            }

            await addTask(newTask)

            // Reset form
            setTaskTitle('')
            setTaskDescription('')
            setTaskDueDate('')
            setTaskPriority('medium')
            setShowAddTask(false)

            // Call the callback to refresh tasks
            onTasksChange()
        } catch (err) {
            console.error('Error adding task:', err)
            setError('Failed to add task. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCompleteTask = async (taskId: string) => {
        try {
            await updateTask(taskId, {
                status: 'completed',
                updated_at: Timestamp.now()
            });

            // Call the callback to refresh tasks
            onTasksChange();
        } catch (err) {
            console.error('Error completing task:', err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);

            // Call the callback to refresh tasks
            onTasksChange();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        if (filter === 'pending') return task.status === 'pending' || task.status === 'overdue'
        if (filter === 'completed') return task.status === 'completed'
        return true
    })

    // Calculate pagination
    const indexOfLastTask = currentPage * tasksPerPage
    const indexOfFirstTask = indexOfLastTask - tasksPerPage
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage)

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

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
                    <FaClipboardList className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Tasks</h2>
                </div>
                <button
                    onClick={() => setShowAddTask(true)}
                    className="btn btn-primary btn-sm gap-2"
                >
                    <FaPlus /> Add Task
                </button>
            </div>

            <div className="flex gap-2 mb-4">
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

            {showAddTask ? (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-4 rounded-lg"
                >
                    <form onSubmit={handleAddTask} className="space-y-4">
                        <div>
                            <label className="label">Task Title</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="e.g. Harvest corn in Field A"
                            />
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="Add details about the task"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Due Date</label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div>
                                <label className="label">Priority</label>
                                <select
                                    className="select select-bordered w-full"
                                    value={taskPriority}
                                    onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="text-error text-sm">{error}</div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddTask(false)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Task'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <div className="max-h-[400px] overflow-y-auto">
                        {currentTasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No tasks found. Add a new task to get started.</p>
                            </div>
                        ) : (
                            currentTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg border ${task.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            {task.status === 'completed' ? (
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <FaCheck className="w-3 h-3 text-green-600" />
                                                </div>
                                            ) : (
                                                <div
                                                    className={`w-3 h-3 mt-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}
                                                />
                                            )}
                                            <div>
                                                <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Due: {new Date(task.due_date.toDate()).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {task.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleCompleteTask(task.id)}
                                                    className="btn btn-xs btn-circle btn-ghost text-green-600"
                                                    title="Mark as completed"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="btn btn-xs btn-circle btn-ghost text-red-600"
                                                title="Delete task"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Pagination controls */}
                    {filteredTasks.length > tasksPerPage && (
                        <div className="flex justify-center mt-6">
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    «
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 