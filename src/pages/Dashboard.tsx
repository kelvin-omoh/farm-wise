import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import {
    FaThermometerHalf, FaTint, FaSun, FaLeaf,
    FaBell, FaMapMarkerAlt, FaRuler, FaChartLine
} from 'react-icons/fa'
import { SensorCard } from '../components/dashboard/SensorCard'
import { WeatherWidget } from '../components/dashboard/WeatherWidget'
import { AIInsights } from '../components/dashboard/AIInsights'
import { StatisticsGraph } from '../components/dashboard/StatisticsGraph'
import { TaskManagement } from '../components/dashboard/TaskManagement'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, limit } from 'firebase/firestore'
import { useTestDataStore } from '../stores/testDataStore'
import { Task, getTasks } from '../services/firebaseService'
import { Link } from 'react-router-dom'

// Test data for when not connected to Supabase
const testSensorData = [
    {
        title: "Temperature",
        value: "28",
        unit: "°C",
        icon: FaThermometerHalf,
        color: "text-orange-500"
    },
    {
        title: "Humidity",
        value: "65",
        unit: "%",
        icon: FaTint,
        color: "text-blue-500"
    },
    {
        title: "Light Intensity",
        value: "850",
        unit: "lux",
        icon: FaSun,
        color: "text-yellow-500"
    },
    {
        title: "Soil Moisture",
        value: "42",
        unit: "%",
        icon: FaLeaf,
        color: "text-green-500"
    }
]

// Test weather data
const testWeatherData = {
    temperature: 28,
    humidity: 65,
    wind_speed: 12,
    precipitation: 0,
    forecast: "sunny",
    timestamp: new Date().toISOString(),
    id: '1',
    farm_id: '1',
    location: 'Your Farm Location',
    forecastData: [
        { day: 'Mon', temp: '29°C', condition: 'Sunny' },
        { day: 'Tue', temp: '28°C', condition: 'Partly Cloudy' },
        { day: 'Wed', temp: '30°C', condition: 'Sunny' },
        { day: 'Thu', temp: '27°C', condition: 'Rain' },
        { day: 'Fri', temp: '26°C', condition: 'Thunderstorm' }
    ]
}

// Add Farm interface
interface Farm {
    id: string;
    name: string;
    location: string;
    size: number;
    size_unit: string;
    crop_type?: string;
    owner_id: string;
    device_count?: number;
}

const Dashboard = () => {
    const { user, setUser } = useAuthStore()
    const name = user?.displayName || 'Farmer'
    const [isLoading, setIsLoading] = useState(false)
    const [sensorData,] = useState(testSensorData)
    const { useTestData } = useTestDataStore()
    const [activeSection,] = useState('overview')
    const [error, setError] = useState<string | null>(null)
    const [farmId, setFarmId] = useState<string | null>(null)
    const [dueTasks, setDueTasks] = useState<Task[]>([])
    const [allTasks, setAllTasks] = useState<Task[]>([])
    const [farms, setFarms] = useState<Farm[]>([])
    const [totalFarmArea, setTotalFarmArea] = useState<number>(0)
    const [totalDevices, setTotalDevices] = useState<number>(0)

    // Create a fetchAllTasks function that can be called from child components
    const fetchAllTasks = useCallback(async () => {
        if (!farmId) return;

        setIsLoading(true);
        try {
            // Get all tasks for the farm directly
            const tasks = await getTasks(farmId);

            // Check if tasks is an array (direct return) or has data property
            if (Array.isArray(tasks)) {
                setAllTasks(tasks);

                // Also update due tasks
                const dueTasks = tasks.filter(task => {
                    const dueDate = task.due_date.toDate();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return task.status === 'pending' && dueDate <= today;
                });

                setDueTasks(dueTasks);
            } else if (tasks && 'data' in tasks && Array.isArray(tasks.data)) {
                setAllTasks(tasks.data);

                // Also update due tasks
                const dueTasks = tasks.data.filter(task => {
                    const dueDate = task.due_date.toDate();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return task.status === 'pending' && dueDate <= today;
                });

                setDueTasks(dueTasks);
            } else {
                console.error('Unexpected tasks format:', tasks);
                setError('Failed to fetch tasks. Unexpected data format.');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks. Using test data instead.');
        } finally {
            setIsLoading(false);
        }
    }, [farmId]);

    // Fetch farm ID when component mounts
    useEffect(() => {
        const checkAndFetchData = async () => {
            if (!user) return;

            // Check if tables exist first
            const tablesExist = await ensureTablesExist();

            // If tables don't exist, we're already using test data
            if (!tablesExist) return;

            // Otherwise fetch farm ID
            await fetchFarmId();
        };

        checkAndFetchData();
    }, [user]);

    // Replace ensureTablesExist with a Firebase version
    const ensureTablesExist = async () => {
        try {
            // Check if the 'farms' collection exists and has documents
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, limit(1));

            // Use the result instead of storing in an unused variable
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking if tables exist:', error);
            return false;
        }
    };

    // Fetch farm ID from Firestore
    const fetchFarmId = async () => {
        if (!user) return;

        try {
            // Simply use the user's ID as the farm ID
            const userFarmId = user.uid;
            setFarmId(userFarmId);

            // Update the user object with the farm_id
            setUser({ ...user, farm_id: userFarmId });

            console.log('Using user ID as farm ID:', userFarmId);

            // Check if we need to create a farm record
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, where('owner_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Create a new farm record for reference
                await addDoc(collection(db, 'farms'), {
                    name: 'My Farm',
                    owner_id: user.uid,
                    farm_id: userFarmId,
                    location: 'Nigeria',
                    created_at: new Date()
                });

                console.log('Created new farm record with ID:', userFarmId);
            }
        } catch (err) {
            console.error('Error setting farm ID:', err);
            setError('Failed to set farm data. Using test data instead.');
        }
    };

    // Fetch tasks when farmId changes
    useEffect(() => {
        if (farmId) {
            fetchAllTasks();
        }
    }, [farmId, fetchAllTasks]);

    // Fetch farms data
    const fetchFarms = useCallback(async () => {
        if (!user) return;

        try {
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, where('owner_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const farmsData: Farm[] = [];
            let area = 0;
            let devices = 0;

            for (const doc of querySnapshot.docs) {
                const farmData = doc.data() as Omit<Farm, 'id'>;

                // Get device count for this farm
                const devicesRef = collection(db, 'devices');
                const devicesQuery = query(devicesRef, where('farm_id', '==', doc.id));
                const devicesSnapshot = await getDocs(devicesQuery);
                const deviceCount = devicesSnapshot.size;

                // Calculate area in a common unit (hectares)
                let farmArea = farmData.size || 0;
                if (farmData.size_unit === 'acres') {
                    farmArea *= 0.404686; // Convert acres to hectares
                } else if (farmData.size_unit === 'square_meters') {
                    farmArea *= 0.0001; // Convert square meters to hectares
                }

                area += farmArea;
                devices += deviceCount;

                farmsData.push({
                    ...farmData,
                    id: doc.id,
                    device_count: deviceCount
                } as Farm);
            }

            setFarms(farmsData);
            setTotalFarmArea(parseFloat(area.toFixed(2)));
            setTotalDevices(devices);

        } catch (err) {
            console.error('Error fetching farms:', err);
        }
    }, [user]);

    // Add this to your existing useEffect that runs when user changes
    useEffect(() => {
        if (user) {
            fetchFarms();
        }
    }, [user, fetchFarms]);

    // Modify your renderSection function to include farm statistics
    const renderSection = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            )
        }

        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Farm Statistics */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Farm Overview</h2>
                                <Link to="/dashboard/farms" className="text-primary hover:text-primary-focus text-sm font-medium">
                                    Manage Farms
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <FaMapMarkerAlt className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Total Farms</h3>
                                            <p className="mt-1 text-xl font-semibold">{farms.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <FaRuler className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Total Area</h3>
                                            <p className="mt-1 text-xl font-semibold">{totalFarmArea} hectares</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-full">
                                            <FaChartLine className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-500">Connected Devices</h3>
                                            <p className="mt-1 text-xl font-semibold">{totalDevices}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {farms.length > 0 ? (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Your Farms</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Location
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Size
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Crop
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Devices
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {farms.slice(0, 3).map((farm) => (
                                                    <tr key={farm.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{farm.location}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{farm.size} {farm.size_unit}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{farm.crop_type || 'Not specified'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{farm.device_count || 0}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {farms.length > 3 && (
                                        <div className="mt-4 text-right">
                                            <Link to="/dashboard/farms" className="text-sm text-primary hover:text-primary-focus font-medium">
                                                View all {farms.length} farms
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-6 text-center py-6">
                                    <p className="text-gray-500">You haven't created any farms yet.</p>
                                    <Link
                                        to="/dashboard/farms"
                                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus"
                                    >
                                        Create your first farm
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Sensor Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {sensorData.map((sensor, index) => (
                                <SensorCard key={sensor.title} {...sensor} index={index} />
                            ))}
                        </div>

                        {/* Main Stats and AI Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <StatisticsGraph useTestData={useTestData} />
                            <AIInsights useTestData={useTestData} />
                        </div>

                        {/* Weather and Tasks */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WeatherWidget
                                farmId={farmId || "default"}
                                weatherData={testWeatherData}
                            />
                            <TaskManagement
                                tasks={allTasks}
                                farmId={farmId || "default"}
                                onTasksChange={fetchAllTasks}
                            />
                        </div>
                    </div>
                )
            default:
                return <div>Select a section from the sidebar</div>
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Welcome back, {name}</h1>
                        <p className="text-sm md:text-base text-gray-600">Here's an overview of your farm's status</p>
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 mt-2 md:mt-0">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Render the active section */}
            {renderSection()}

            {/* Task Notifications */}
            {dueTasks.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaBell className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                You have {dueTasks.length} {dueTasks.length === 1 ? 'task' : 'tasks'} due
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {dueTasks.slice(0, 3).map(task => (
                                        <li key={task.id}>
                                            {task.title} - {new Date(task.due_date.toDate()).toLocaleDateString()}
                                        </li>
                                    ))}
                                    {dueTasks.length > 3 && (
                                        <li>
                                            <a href="/dashboard/tasks" className="font-medium underline">
                                                View all {dueTasks.length} tasks
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard 