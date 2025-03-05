import { useState, useEffect } from 'react'
// import { TaskManagement } from '../../components/dashboard/TaskManagement'
import { CropCalendar } from '../../components/dashboard/CropCalendar'
// import { Switch } from '../../components/ui/Switch'
import { FaPlus, FaFilter, /* FaSort, */ FaCheck, FaClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import { useAuthStore } from '../../stores/authStore'
// import { useTestData } from '../../hooks/useTestData'
import { addTask, updateTask, deleteTask, Task, subscribeToTasks } from '../../services/firebaseService'
import { Timestamp } from 'firebase/firestore'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

// Add this interface near the top of your file
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    status?: 'pending' | 'completed' | 'overdue';
    priority?: 'low' | 'medium' | 'high';
}

const TasksPage = () => {
    const [filter, setFilter] = useState('all')
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as 'pending' | 'completed' | 'overdue'
    })
    const [taskStats, setTaskStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0
    })
    const [calendarView, setCalendarView] = useState(false)

    const { user } = useAuthStore()
    const farmId = user?.uid || 'default'

    // Add a useEffect to log the farmId for debugging
    useEffect(() => {
        console.log('TasksPage - Using user ID as farm ID:', farmId);
        console.log('TasksPage - Current user:', user);
    }, [farmId, user]);

    // Set up real-time listener for tasks
    useEffect(() => {
        setLoading(true)

        try {
            // Set up real-time listener with error handling
            const unsubscribe = subscribeToTasks(farmId, (fetchedTasks) => {
                let filteredTasks = fetchedTasks
                if (filter !== 'all') {
                    filteredTasks = fetchedTasks.filter(task => task.status === filter)
                }

                setTasks(filteredTasks)
                updateTaskStats(fetchedTasks)
                setLoading(false)
            });

            // Clean up listener on unmount
            return () => {
                unsubscribe();
            };
        } catch (error) {
            console.error('Error setting up task listener:', error);
            setLoading(false);
        }
    }, [farmId, filter]);

    // Update task statistics
    const updateTaskStats = (tasks: Task[]) => {
        const stats = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'completed').length,
            pending: tasks.filter(task => task.status === 'pending').length,
            overdue: tasks.filter(task => task.status === 'overdue').length
        }
        setTaskStats(stats)
    }

    // Handle adding a new task
    const handleAddTask = async () => {
        if (!newTask.title || !newTask.due_date) {
            // Show validation error
            return
        }

        try {
            const taskData = {
                farm_id: farmId,
                title: newTask.title,
                description: newTask.description,
                due_date: Timestamp.fromDate(new Date(newTask.due_date)),
                status: newTask.status,
                priority: newTask.priority,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            }

            await addTask(taskData)

            // Reset form and close modal
            setNewTask({
                title: '',
                description: '',
                due_date: '',
                priority: 'medium',
                status: 'pending'
            })
            setShowAddModal(false)
        } catch (error) {
            console.error('Error adding task:', error)
        }
    }

    // Handle marking a task as complete
    const handleCompleteTask = async (taskId: string) => {
        try {
            await updateTask(taskId, {
                status: 'completed',
                updated_at: Timestamp.now()
            })
        } catch (error) {
            console.error('Error completing task:', error)
        }
    }

    // Handle deleting a task
    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId)
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    // Convert tasks to calendar events
    const tasksToEvents = (): CalendarEvent[] => {
        return tasks.map(task => {
            const dueDate = task.due_date.toDate()
            // Create an end date that's the same as the due date but at the end of the day
            const endDate = new Date(dueDate)
            endDate.setHours(23, 59, 59)

            return {
                id: task.id,
                title: task.title,
                start: dueDate,
                end: endDate,
                allDay: true,
                status: task.status,
                priority: task.priority
            }
        })
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
    }

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <FaCheck className="text-green-600" />
            case 'overdue': return <FaExclamationTriangle className="text-red-600" />
            default: return <FaClock className="text-yellow-600" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Task Management</h1>
                        <p className="text-sm md:text-base text-gray-600">Organize and track your farm tasks</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        <button
                            className="btn btn-primary gap-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            <FaPlus /> Add Task
                        </button>
                        <button
                            className={`btn ${calendarView ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setCalendarView(!calendarView)}
                        >
                            Calendar View
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <FaFilter className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    <button
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'overdue' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('overdue')}
                    >
                        Overdue
                    </button>
                </div>
            </div>

            {/* Task List */}
            {!calendarView && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6">Tasks</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tasks found. Add a new task to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`p-4 rounded-lg border ${getStatusColor(task.status)}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-3 h-3 mt-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`} />
                                            <div>
                                                <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        {getStatusIcon(task.status)}
                                                        <span className="ml-1">
                                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Due: {new Date(task.due_date.toDate()).toLocaleDateString()}
                                                    </div>
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
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Calendar View */}
            {calendarView && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6">Task Calendar</h2>
                    <div className="h-[600px]">
                        <Calendar
                            localizer={localizer}
                            events={tasksToEvents()}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={['month', 'week', 'day']}
                            eventPropGetter={(event: any) => {
                                let backgroundColor = '#3788d8'
                                if (event.status === 'completed') {
                                    backgroundColor = '#10b981'
                                } else if (event.status === 'overdue') {
                                    backgroundColor = '#ef4444'
                                } else if (event.priority === 'high') {
                                    backgroundColor = '#f97316'
                                } else if (event.priority === 'medium') {
                                    backgroundColor = '#eab308'
                                }
                                return { style: { backgroundColor } }
                            }}
                            onSelectEvent={(event: any) => {
                                // Handle event click - could open edit modal
                                const task = tasks.find(t => t.id === event.id)
                                if (task) {
                                    // Open edit modal or show details
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Calendar View */}
            <CropCalendar />

            {/* Task Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Task Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-700">Total Tasks</h3>
                        <p className="text-3xl font-bold text-blue-800">{taskStats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h3 className="text-sm font-medium text-green-700">Completed</h3>
                        <p className="text-3xl font-bold text-green-800">{taskStats.completed}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
                        <p className="text-3xl font-bold text-yellow-800">{taskStats.pending}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <h3 className="text-sm font-medium text-red-700">Overdue</h3>
                        <p className="text-3xl font-bold text-red-800">{taskStats.overdue}</p>
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New Task</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowAddModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddTask}
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TasksPage 