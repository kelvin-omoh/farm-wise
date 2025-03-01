import { useState, useEffect } from 'react'
// import { TaskManagement } from '../../components/dashboard/TaskManagement'
import { CropCalendar } from '../../components/dashboard/CropCalendar'
import { Switch } from '../../components/ui/Switch'
import { FaPlus, FaFilter, FaSort, FaCheck, FaClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import { useAuthStore } from '../../stores/authStore'
// import { useTestData } from '../../hooks/useTestData'
import {  addTask, updateTask, deleteTask, Task, subscribeToTasks } from '../../services/firebaseService'
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
    const [useLocalTestData, setUseLocalTestData] = useState(false)
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
    const [calendarView, _] = useState(false)

    const { user } = useAuthStore()
    const farmId = user?.farm_id || 'default'

    // Test data for tasks
    const testTasks: Task[] = [
        {
            id: '1',
            farm_id: farmId,
            title: 'Inspect irrigation system',
            description: 'Check for leaks and ensure proper water flow',
            due_date: Timestamp.fromDate(new Date(Date.now() + 86400000)),
            status: 'pending',
            priority: 'high'
        },
        {
            id: '2',
            farm_id: farmId,
            title: 'Apply fertilizer to corn field',
            description: 'Use organic fertilizer as per recommendation',
            due_date: Timestamp.fromDate(new Date(Date.now() + 172800000)),
            status: 'pending',
            priority: 'medium'
        },
        {
            id: '3',
            farm_id: farmId,
            title: 'Harvest tomatoes',
            description: 'Harvest ripe tomatoes from greenhouse',
            due_date: Timestamp.fromDate(new Date(Date.now() - 86400000)),
            status: 'completed',
            priority: 'medium'
        },
        {
            id: '4',
            farm_id: farmId,
            title: 'Repair fence in north field',
            description: 'Fix damaged sections of the fence',
            due_date: Timestamp.fromDate(new Date(Date.now() - 172800000)),
            status: 'overdue',
            priority: 'high'
        }
    ]

    // Set up real-time listener for tasks
    useEffect(() => {
        if (useLocalTestData) {
            let filteredTasks = [...testTasks]
            if (filter !== 'all') {
                filteredTasks = testTasks.filter(task => task.status === filter)
            }
            setTasks(filteredTasks)
            updateTaskStats(filteredTasks)
            setLoading(false)
            return
        }

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
            // Fall back to test data
            setTasks(testTasks);
            updateTaskStats(testTasks);
            setLoading(false);

        }

        return () => { };
    }, [farmId, filter, useLocalTestData]);

    // Update task statistics
    const updateTaskStats = (taskList: Task[]) => {
        const stats = {
            total: taskList.length,
            completed: taskList.filter(t => t.status === 'completed').length,
            pending: taskList.filter(t => t.status === 'pending').length,
            overdue: taskList.filter(t => t.status === 'overdue').length
        }
        setTaskStats(stats)
    }

    // Check for overdue tasks
    useEffect(() => {
        if (useLocalTestData) return;

        // Function to check and update overdue tasks
        const checkOverdueTasks = async () => {
            const now = new Date();

            for (const task of tasks) {
                if (task.status === 'pending') {
                    const dueDate = task.due_date instanceof Timestamp
                        ? task.due_date.toDate()
                        : new Date(task.due_date);

                    if (dueDate < now) {
                        // Task is overdue
                        await updateTask(task.id, { status: 'overdue' });
                    }
                }
            }
        };

        checkOverdueTasks();

        // Set up interval to check for overdue tasks
        const interval = setInterval(checkOverdueTasks, 3600000); // Check every hour

        return () => clearInterval(interval);
    }, [tasks, useLocalTestData]);

    // Handle adding a new task
    const handleAddTask = async () => {
        if (!newTask.title || !newTask.due_date) {
            alert('Please fill in all required fields')
            return
        }

        try {
            const taskData = {
                ...newTask,
                farm_id: farmId,
                due_date: Timestamp.fromDate(new Date(newTask.due_date))
            } as const

            if (!useLocalTestData) {
                await addTask(taskData)
            } else {
                // For test mode, just add to local state
                const newId = (Math.max(...tasks.map(t => parseInt(t.id) || 0)) + 1).toString()
                setTasks([...tasks, { ...taskData, id: newId }])
            }

            // Reset form and close modal
            setNewTask({
                title: '',
                description: '',
                due_date: '',
                priority: 'medium' as 'low' | 'medium' | 'high',
                status: 'pending' as 'pending' | 'completed' | 'overdue'
            })
            setShowAddModal(false)
        } catch (error) {
            console.error('Error adding task:', error)
            alert('Failed to add task. Please try again.')
        }
    }

    // Handle task status update
    const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'completed' | 'overdue') => {
        try {
            if (!useLocalTestData) {
                await updateTask(taskId, { status: newStatus });
            } else {
                // For test mode, update local state
                setTasks(tasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                ));
            }
        } catch (error) {
            console.error('Error updating task:', error);

            // Handle the specific error case for missing documents
            if (typeof error === 'object' && error !== null && 'message' in error) {
                const errorMessage = error.message as string;
                if (errorMessage.includes('No document to update')) {
                    // Just update the local state for test IDs
                    setTasks(tasks.map(task =>
                        task.id === taskId ? { ...task, status: newStatus } : task
                    ));
                    return;
                }
            }

            // Show error message for other errors
            alert('Failed to update task. Please try again.');
        }
    };

    // Handle task deletion
    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return

        try {
            if (!useLocalTestData) {
                await deleteTask(taskId)
            } else {
                // For test mode, update local state
                setTasks(tasks.filter(task => task.id !== taskId))
            }
        } catch (error) {
            console.error('Error deleting task:', error)
            alert('Failed to delete task. Please try again.')
        }
    }

    // Convert tasks to calendar events
    const getCalendarEvents = () => {
        return tasks.map(task => ({
            id: task.id,
            title: task.title,
            start: task.due_date instanceof Timestamp
                ? task.due_date.toDate()
                : new Date(task.due_date),
            end: task.due_date instanceof Timestamp
                ? new Date(task.due_date.toDate().getTime() + 3600000) // Add 1 hour
                : new Date(new Date(task.due_date).getTime() + 3600000),
            allDay: true,
            status: task.status,
            priority: task.priority
        }))
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Task Management</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage and track your farm tasks</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Data Source:</span>
                        <Switch
                            checked={useLocalTestData}
                            onChange={() => setUseLocalTestData(!useLocalTestData)}
                            label={useLocalTestData ? "Test" : "Live"}
                        />
                    </div>
                </div>
            </div>

            {/* Task Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus className="mr-2" /> Add Task
                    </button>
                    <div className="dropdown dropdown-end">
                        <button className="btn btn-outline">
                            <FaFilter className="mr-2" /> Filter
                        </button>
                    </div>
                    <div className="dropdown dropdown-end">
                        <button className="btn btn-outline">
                            <FaSort className="mr-2" /> Sort
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('pending')}
                    >
                        <FaClock className="mr-1" /> Pending
                    </button>
                    <button
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('completed')}
                    >
                        <FaCheck className="mr-1" /> Completed
                    </button>
                    <button
                        className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('overdue')}
                    >
                        <FaExclamationTriangle className="mr-1" /> Overdue
                    </button>
                </div>
            </div>

            {/* Task List */}
            {!calendarView ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6">Tasks</h2>

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No tasks found. Add a new task to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(task => (
                                        <tr key={task.id} className="hover">
                                            <td>
                                                <div>
                                                    <div className="font-bold">{task.title}</div>
                                                    <div className="text-sm opacity-50">{task.description}</div>
                                                </div>
                                            </td>
                                            <td>
                                                {task.due_date instanceof Timestamp
                                                    ? new Date(task.due_date.toDate()).toLocaleDateString()
                                                    : new Date(task.due_date).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${task.priority === 'high' ? 'badge-error' :
                                                    task.priority === 'medium' ? 'badge-warning' : 'badge-info'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${task.status === 'completed' ? 'badge-success' :
                                                    task.status === 'overdue' ? 'badge-error' : 'badge-warning'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex space-x-2">
                                                    {task.status !== 'completed' && (
                                                        <button
                                                            className="btn btn-xs btn-success"
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                    {task.status === 'completed' && (
                                                        <button
                                                            className="btn btn-xs btn-warning"
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                                        >
                                                            <FaClock />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-xs btn-error"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div style={{ height: 600 }}>
                        <Calendar
                            localizer={localizer}
                            events={getCalendarEvents()}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={(event: CalendarEvent) => {
                                let backgroundColor = '#3788d8'
                                if (event.status === 'completed') backgroundColor = '#10B981'
                                else if (event.status === 'overdue') backgroundColor = '#EF4444'
                                else if (event.priority === 'high') backgroundColor = '#F59E0B'

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