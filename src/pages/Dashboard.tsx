import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import {
    FaThermometerHalf, FaTint, FaSun, FaLeaf, FaChartLine,
    FaExchangeAlt, FaBell, FaCalendarAlt, FaDatabase, FaTachometerAlt,
    FaClipboardList, FaUsers, FaShoppingCart, FaWrench, FaChartBar,
    FaCloudSun, FaLayerGroup
} from 'react-icons/fa'
import { SensorCard } from '../components/dashboard/SensorCard'
import { WeatherWidget } from '../components/dashboard/WeatherWidget'
import { AIInsights } from '../components/dashboard/AIInsights'
import { FarmStatistics } from '../components/dashboard/FarmStatistics'
import { MarketplacePreview } from '../components/dashboard/MarketplacePreview'
import { StatisticsGraph } from '../components/dashboard/StatisticsGraph'
import { TaskManagement } from '../components/dashboard/TaskManagement'
import { CropCalendar } from '../components/dashboard/CropCalendar'
import { AlertNotifications } from '../components/dashboard/AlertNotifications'
import { DeviceHealth } from '../components/dashboard/DeviceHealth'
import { FinancialReports } from '../components/dashboard/FinancialReports'
import { DeviceRegistration } from '../components/dashboard/DeviceRegistration'
import { FarmProfileSetup } from '../components/dashboard/FarmProfileSetup'
import { NetworkingHub } from '../components/dashboard/NetworkingHub'
import { motion } from 'framer-motion'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { Switch } from '../components/ui/Switch'
import { Link } from 'react-router-dom'
import { useDataSource } from '../hooks/useDataSource'
import supabaseService, { SensorReading, Task, WeatherData } from '../services/supabaseService'
import { useTestDataStore } from '../stores/testDataStore'
import { FarmAnalytics } from '../components/dashboard/FarmAnalytics'

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
    id: "1",
    farm_id: "1"
}

// Navigation items for sidebar
const navItems = [
    { id: 'overview', label: 'Overview', icon: FaTachometerAlt },
    { id: 'devices', label: 'IoT Devices', icon: FaWrench },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'weather', label: 'Weather', icon: FaCloudSun },
    { id: 'tasks', label: 'Tasks', icon: FaClipboardList },
    { id: 'marketplace', label: 'Marketplace', icon: FaShoppingCart },
    { id: 'networking', label: 'Networking', icon: FaUsers },
    { id: 'profile', label: 'Farm Profile', icon: FaLayerGroup }
]

// Quick access cards for dashboard
const quickAccessCards = [
    {
        title: "IoT Devices",
        description: "Manage your connected devices",
        icon: FaExchangeAlt,
        color: "bg-blue-500",
        path: "/dashboard/devices"
    },
    {
        title: "Marketplace",
        description: "Buy and sell farm produce",
        icon: FaExchangeAlt,
        color: "bg-green-500",
        path: "/dashboard/marketplace"
    },
    {
        title: "Weather",
        description: "View detailed weather forecasts",
        icon: FaSun,
        color: "bg-yellow-500",
        path: "/dashboard/weather"
    },
    {
        title: "Analytics",
        description: "View detailed farm statistics",
        icon: FaChartLine,
        color: "bg-purple-500",
        path: "/dashboard/analytics"
    }
]

const Dashboard = () => {
    const { user } = useAuthStore()
    const name = user?.displayName || 'Farmer'
    const [hasProfile, setHasProfile] = useState(true) // Default to true to prevent loading issues
    const [isLoading, setIsLoading] = useState(false)
    const [sensorData, setSensorData] = useState(testSensorData)
    const { useTestData, setUseTestData } = useTestDataStore()
    const [activeSection, setActiveSection] = useState('overview')
    const [pendingTasks, setPendingTasks] = useState(5)
    const [alerts, setAlerts] = useState(2)
    const [revenue, setRevenue] = useState("₦125,000")
    const [error, setError] = useState<string | null>(null)
    const [farmId, setFarmId] = useState<string | null>(null)
    const [weatherData, setWeatherData] = useState({
        temperature: 28,
        condition: 'Sunny',
        forecast: 'sunny'
    })

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

    // Set up real-time subscription for sensor data
    useEffect(() => {
        if (useTestData || !farmId) return

        // Initial fetch
        fetchSensorData()

        // Set up subscription
        const readingsRef = collection(db, 'sensor_readings');
        const q = query(
            readingsRef,
            where('farm_id', '==', farmId),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log('New sensor reading received');
            fetchSensorData();
        });

        return () => {
            unsubscribe();
        };
    }, [farmId, useTestData])

    // Update the task subscription
    useEffect(() => {
        if (useTestData || !farmId) return;

        // Initial fetch
        fetchTasksCount();

        // Set up subscription
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('farm_id', '==', farmId)
        );

        const unsubscribe = onSnapshot(q, () => {
            console.log('Task changes detected');
            fetchTasksCount();
        });

        return () => {
            unsubscribe();
        };
    }, [farmId, useTestData]);

    // Update the alerts subscription
    useEffect(() => {
        if (useTestData || !farmId) return;

        // Initial fetch
        fetchAlertsCount();

        // Set up subscription
        const alertsRef = collection(db, 'alerts');
        const q = query(
            alertsRef,
            where('farm_id', '==', farmId)
        );

        const unsubscribe = onSnapshot(q, () => {
            console.log('Alert changes detected');
            fetchAlertsCount();
        });

        return () => {
            unsubscribe();
        };
    }, [farmId, useTestData]);

    // Fetch real sensor data from Supabase
    const fetchSensorData = async () => {
        if (!user || !farmId || useTestData) return

        setIsLoading(true)
        setError(null)

        try {
            const readingsRef = collection(db, 'sensor_readings');
            const q = query(
                readingsRef,
                where('farm_id', '==', farmId),
                orderBy('timestamp', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log('No sensor readings found');
                return;
            }

            const latestReading = querySnapshot.docs[0].data();

            // Update sensor data with latest readings
            const updatedSensorData = [
                {
                    title: "Temperature",
                    value: latestReading.temperature?.toString() || "0",
                    unit: "°C",
                    icon: FaThermometerHalf,
                    color: "text-orange-500"
                },
                {
                    title: "Humidity",
                    value: latestReading.humidity?.toString() || "0",
                    unit: "%",
                    icon: FaTint,
                    color: "text-blue-500"
                },
                {
                    title: "Light Intensity",
                    value: latestReading.light?.toString() || "0",
                    unit: "lux",
                    icon: FaSun,
                    color: "text-yellow-500"
                },
                {
                    title: "Soil Moisture",
                    value: latestReading.soil_moisture?.toString() || "0",
                    unit: "%",
                    icon: FaLeaf,
                    color: "text-green-500"
                }
            ];

            setSensorData(updatedSensorData)

            // Update weather data based on temperature sensor
            const tempReading = updatedSensorData.find(d => d.title === "Temperature")
            if (tempReading) {
                const temp = parseFloat(tempReading.value)
                let condition = 'Sunny'
                let forecast = 'sunny'

                if (temp > 30) {
                    condition = 'Hot'
                    forecast = 'hot'
                } else if (temp < 20) {
                    condition = 'Cool'
                    forecast = 'cool'
                }

                setWeatherData({
                    temperature: temp,
                    condition,
                    forecast
                })
            }
        } catch (err: any) {
            console.error('Error fetching sensor data:', err.message)
            setError('Failed to fetch sensor data')
        } finally {
            setIsLoading(false)
        }
    }

    // Update fetchTasksCount
    const fetchTasksCount = async () => {
        if (!farmId || useTestData) return;

        try {
            const tasksRef = collection(db, 'tasks');
            const q = query(
                tasksRef,
                where('farm_id', '==', farmId),
                where('status', '==', 'pending')
            );

            const querySnapshot = await getDocs(q);
            setPendingTasks(querySnapshot.size);
        } catch (err) {
            console.error('Error fetching tasks count:', err);
        }
    };

    // Update fetchAlertsCount
    const fetchAlertsCount = async () => {
        if (!farmId || useTestData) return;

        try {
            const alertsRef = collection(db, 'alerts');
            const q = query(
                alertsRef,
                where('farm_id', '==', farmId),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(q);
            setAlerts(querySnapshot.size);
        } catch (err) {
            console.error('Error fetching alerts count:', err);
        }
    };

    // Update fetchRevenue
    const fetchRevenue = async () => {
        if (!farmId || useTestData) return;

        try {
            const financialRef = collection(db, 'financial_data');
            const q = query(
                financialRef,
                where('farm_id', '==', farmId),
                orderBy('date', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                setRevenue(`₦${data.revenue.toLocaleString()}`);
            }
        } catch (err) {
            console.error('Error fetching revenue:', err);
        }
    };

    // Fetch all data when component mounts or when useTestData changes
    useEffect(() => {
        if (useTestData) {
            // Reset to test data
            setSensorData(testSensorData)
            setPendingTasks(5)
            setAlerts(2)
            setRevenue("₦125,000")
            setWeatherData({
                temperature: 28,
                condition: 'Sunny',
                forecast: 'sunny'
            })
            return
        }

        // Fetch real data
        fetchSensorData()
        fetchTasksCount()
        fetchAlertsCount()
        fetchRevenue()
    }, [useTestData, farmId])

    // Function to refresh all data
    const refreshData = () => {
        if (useTestData) return

        fetchSensorData()
        fetchTasksCount()
        fetchAlertsCount()
        fetchRevenue()
    }

    // Check if user has completed profile setup
    useEffect(() => {
        const checkProfileSetup = async () => {
            if (!user || useTestData) {
                setHasProfile(true);
                return;
            }

            try {
                const farmsRef = collection(db, 'farms');
                const q = query(farmsRef, where('owner_id', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setHasProfile(false);
                    return;
                }

                const farmData = querySnapshot.docs[0].data();
                // Consider profile complete if farm has name and location
                setHasProfile(!!farmData.name && !!farmData.location);
            } catch (err) {
                console.error('Error checking profile:', err);
                // Default to true to prevent showing setup unnecessarily
                setHasProfile(true);
            }
        }

        checkProfileSetup()
    }, [user])

    // Replace ensureTablesExist with a Firebase version
    const ensureTablesExist = async () => {
        try {
            // Check if farms collection exists by trying to get one document
            const farmsRef = collection(db, 'farms');
            const q = query(farmsRef, limit(1));
            const querySnapshot = await getDocs(q);

            // If we can query the collection, it exists
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

    // Render the appropriate section based on activeSection
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
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Sensor Readings</h2>
                                <button className="btn btn-sm btn-outline">View All</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {sensorData.map((sensor, index) => (
                                    <SensorCard key={sensor.title} {...sensor} index={index} />
                                ))}
                            </div>
                        </div>

                        {/* Main Stats and AI Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <StatisticsGraph useTestData={useTestData} />
                            <AIInsights useTestData={useTestData} />
                        </div>

                        {/* Weather and Tasks */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WeatherWidget farmId={farmId || "default"} />
                            <TaskManagement />
                        </div>
                    </div>
                )
            case 'devices':
                return <DeviceRegistration
                    onSubmit={(deviceData) => {
                        console.log('Device registered:', deviceData);
                        // Here you would typically save the device to your database
                    }}
                    onCancel={() => {
                        console.log('Device registration cancelled');
                    }}
                />
            case 'analytics':
                return <FarmStatistics useTestData={useTestData} />
            case 'weather':
                return <WeatherWidget farmId={farmId || "default"} fullWidth={true} />
            case 'tasks':
                return <TaskManagement />
            case 'marketplace':
                return <MarketplacePreview />
            case 'networking':
                return <NetworkingHub />
            case 'profile':
                return <FarmProfileSetup />
            default:
                return <div>Section not found</div>
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
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

            {/* Farm Profile Setup - Show if profile not set up */}
            {!hasProfile && (
                <div className="mb-6">
                    <FarmProfileSetup />
                </div>
            )}

            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <Link to="/dashboard/analytics" className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <FaChartLine className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Revenue (MTD)</h3>
                            <p className="text-lg font-semibold">{revenue}</p>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <Link to="/dashboard/tasks" className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <FaCalendarAlt className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
                            <p className="text-lg font-semibold">{pendingTasks}</p>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <Link to="/dashboard/alerts" className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                            <FaBell className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Alerts</h3>
                            <p className="text-lg font-semibold">{alerts}</p>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <Link to="/dashboard/weather" className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FaSun className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Weather</h3>
                            <p className="text-lg font-semibold">
                                {weatherData.condition}, {sensorData[0].value}°C
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Sensor Cards Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Sensor Readings</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={refreshData}
                            className="btn btn-sm btn-outline"
                            disabled={isLoading || useTestData}
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                        <Link to="/dashboard/devices" className="btn btn-sm btn-outline">View All</Link>
                    </div>
                </div>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sensorData.map((sensor, index) => (
                        <SensorCard key={sensor.title} {...sensor} index={index} />
                    ))}
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickAccessCards.map((card) => (
                    <Link
                        key={card.title}
                        to={card.path}
                        className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col h-full">
                            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-600">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Stats and AI Insights */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                <div className="order-2 lg:order-1">
                    <StatisticsGraph useTestData={useTestData} />
                </div>
                <div className="order-1 lg:order-2">
                    <AIInsights useTestData={useTestData} />
                </div>
            </div>

            {/* Weather and Task Management */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                <WeatherWidget
                    farmId={farmId || "default"}
                    currentWeather={weatherData}
                />
                <AlertNotifications
                    useTestData={useTestData}
                    farmId={farmId}
                />
            </div>

            {/* Farm Statistics */}
            <div>
                <FarmStatistics useTestData={useTestData} />
            </div>

            {/* Calendar and Alerts */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                <CropCalendar />
                <AlertNotifications />
            </div>

            {/* Device Health and Financial Reports */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
                <DeviceHealth />
                <FinancialReports />
            </div>

            {/* Marketplace Preview */}
            <div>
                <MarketplacePreview />
            </div>

            {/* Networking Hub */}
            <div>
                <NetworkingHub />
            </div>

            {/* Farm Analytics */}
            <div>
                <FarmAnalytics farmId={farmId || "default"} />
            </div>
        </div>
    )
}

export default Dashboard 