import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import {
    FaThermometerHalf, FaTint, FaSun, FaLeaf,
    FaBell
} from 'react-icons/fa'
import { SensorCard } from '../components/dashboard/SensorCard'
import { WeatherWidget } from '../components/dashboard/WeatherWidget'
import { AIInsights } from '../components/dashboard/AIInsights'
import { StatisticsGraph } from '../components/dashboard/StatisticsGraph'
import { TaskManagement } from '../components/dashboard/TaskManagement'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, limit } from 'firebase/firestore'
import { Switch } from '../components/ui/Switch'
import { useTestDataStore } from '../stores/testDataStore'
import { getDueTasks, Task } from '../services/firebaseService'
import IndexNotification from '../components/ui/IndexNotification'

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

const Dashboard = () => {
    const { user } = useAuthStore()
    const name = user?.displayName || 'Farmer'
    const [isLoading,] = useState(false)
    const [sensorData,] = useState(testSensorData)
    const { useTestData, setUseTestData } = useTestDataStore()
    const [activeSection,] = useState('overview')
    const [, setError] = useState<string | null>(null)
    const [farmId, setFarmId] = useState<string | null>(null)
    const [dueTasks, setDueTasks] = useState<Task[]>([])
    const [showIndexNotification, setShowIndexNotification] = useState(false)

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

    // Fetch real sensor data from Supabase
    // const fetchSensorData = async () => {
    //     if (!user || !farmId || useTestData) return

    //     setIsLoading(true)
    //     setError(null)

    //     try {
    //         const readingsRef = collection(db, 'sensor_readings');
    //         const q = query(
    //             readingsRef,
    //             where('farm_id', '==', farmId),
    //             orderBy('timestamp', 'desc'),
    //             limit(1)
    //         );

    //         const querySnapshot = await getDocs(q);

    //         if (querySnapshot.empty) {
    //             console.log('No sensor readings found');
    //             return;
    //         }

    //         const latestReading = querySnapshot.docs[0].data();

    //         // Update sensor data with latest readings
    //         const updatedSensorData = [
    //             {
    //                 title: "Temperature",
    //                 value: latestReading.temperature?.toString() || "0",
    //                 unit: "°C",
    //                 icon: FaThermometerHalf,
    //                 color: "text-orange-500"
    //             },
    //             {
    //                 title: "Humidity",
    //                 value: latestReading.humidity?.toString() || "0",
    //                 unit: "%",
    //                 icon: FaTint,
    //                 color: "text-blue-500"
    //             },
    //             {
    //                 title: "Light Intensity",
    //                 value: latestReading.light?.toString() || "0",
    //                 unit: "lux",
    //                 icon: FaSun,
    //                 color: "text-yellow-500"
    //             },
    //             {
    //                 title: "Soil Moisture",
    //                 value: latestReading.soil_moisture?.toString() || "0",
    //                 unit: "%",
    //                 icon: FaLeaf,
    //                 color: "text-green-500"
    //             }
    //         ];

    //         setSensorData(updatedSensorData)
    //     } catch (err: any) {
    //         console.error('Error fetching sensor data:', err.message)
    //         setError('Failed to fetch sensor data')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    // Replace ensureTablesExist with a Firebase version
    const ensureTablesExist = async () => {
        try {
            // Check if farms collection exists by trying to get one document
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, limit(1));

            // Execute the query but don't need to store the result
            await getDocs(q);

            // If we get here without error, the collection exists
            return true;
        } catch (err) {
            console.error('Error checking collections:', err);
            setUseTestData(true);
            return false;
        }
    };

    // Add this function to your Dashboard component
    const fetchFarmId = async () => {
        if (!user || useTestData) return;

        try {
            // Try to fetch farm ID
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, where('owner_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Create a new farm if none exists
                const newFarmRef = await addDoc(collection(db, 'farms'), {
                    name: 'My Farm',
                    owner_id: user.uid,
                    location: 'Nigeria',
                    size: 10,
                    size_unit: 'hectares',
                    created_at: new Date()
                });

                setFarmId(newFarmRef.id);
            } else {
                // Use the first farm found
                const farmDoc = querySnapshot.docs[0];
                setFarmId(farmDoc.id);
            }
        } catch (err) {
            console.error('Error fetching farm ID:', err);
            setError('Failed to fetch farm data. Using test data instead.');
            setUseTestData(true);
        }
    };

    // Add this useEffect to fetch due tasks
    useEffect(() => {
        const fetchDueTasks = async () => {
            if (farmId) {
                try {
                    const tasks = await getDueTasks(farmId);
                    setDueTasks(tasks);
                } catch (error) {
                    console.error('Error fetching due tasks:', error);
                }
            }
        };

        fetchDueTasks();
        // Set up a timer to check for due tasks every hour
        const interval = setInterval(fetchDueTasks, 3600000);

        return () => clearInterval(interval);
    }, [farmId]);

    // Add this function before the return statement
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
                            <TaskManagement />
                        </div>
                    </div>
                )
            default:
                return <div>Select a section from the sidebar</div>
        }
    }

    // Add code that uses setShowIndexNotification
    useEffect(() => {
        // Check for index errors in localStorage
        const indexErrors = localStorage.getItem('firestore-index-errors')
        if (indexErrors && JSON.parse(indexErrors).length > 0) {
            setShowIndexNotification(true)
        }

        // Clear notification when component unmounts
        return () => setShowIndexNotification(false)
    }, [])

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Welcome back, {name}</h1>
                        <p className="text-sm md:text-base text-gray-600">Here's an overview of your farm's status</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Data Source:</span>
                        <Switch
                            checked={useTestData}
                            onChange={() => setUseTestData(!useTestData)}
                            label={useTestData ? "Test" : "Live"}
                        />
                    </div>
                </div>
            </div>

            {/* Index Notification */}
            {showIndexNotification && <IndexNotification />}

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