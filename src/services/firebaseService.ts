import { db } from '../config/firebase'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    writeBatch,
    DocumentReference,
    serverTimestamp
} from 'firebase/firestore'

// Define types
export interface SensorReading {
    id: string;
    farm_id: string;
    device_id: string;
    temperature?: number;
    humidity?: number;
    soil_moisture?: number;
    light?: number;
    timestamp: Date | Timestamp;
}

export interface WeatherData {
    id: string;
    farm_id: string;
    temperature: number;
    humidity: number;
    wind_speed: number;
    precipitation: number;
    forecast: string;
    timestamp: Date | Timestamp;
}

export interface Task {
    id: string;
    farm_id: string;
    title: string;
    description: string;
    due_date: Timestamp;
    status: 'pending' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    assigned_to?: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

// Farm services
export const getFarm = async (farmId: string) => {
    const docRef = doc(db, 'farms', farmId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
    } else {
        return null
    }
}

export const getFarmByOwnerId = async (ownerId: string) => {
    const farmsRef = collection(db, 'farms')
    const q = query(farmsRef, where('owner_id', '==', ownerId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() }
    }

    return null
}

export const createFarm = async (farmData: any) => {
    const farmsRef = collection(db, 'farms')
    const docRef = await addDoc(farmsRef, {
        ...farmData,
        created_at: Timestamp.now()
    })

    return { id: docRef.id, ...farmData }
}

// Device services
export const getDevices = async (farmId: string) => {
    const devicesRef = collection(db, 'devices')
    const q = query(devicesRef, where('farm_id', '==', farmId))
    const querySnapshot = await getDocs(q)

    const devices: any[] = []
    querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() })
    })

    return devices
}

export const addDevice = async (deviceData: any) => {
    const devicesRef = collection(db, 'devices')
    const docRef = await addDoc(devicesRef, {
        ...deviceData,
        created_at: Timestamp.now()
    })

    return { id: docRef.id, ...deviceData }
}

// Sensor readings services
export const getLatestSensorReadings = async (farmId: string) => {
    const readingsRef = collection(db, 'sensor_readings')
    const q = query(
        readingsRef,
        where('farm_id', '==', farmId),
        orderBy('timestamp', 'desc'),
        limit(1)
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() }
    }

    return null
}

// Weather services
export const getWeatherData = async (farmId: string) => {
    try {
        const weatherRef = collection(db, 'weather_data');
        const q = query(weatherRef, where('farm_id', '==', farmId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('No weather data found');
            return null;
        }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Don't throw the error, just return null
        return null;
    }
};

// Task services
export const getTasks = async (farmId: string, status?: string) => {
    try {
        const tasksRef = collection(db, 'tasks');

        // Build query based on parameters
        let q = query(tasksRef, where('farm_id', '==', farmId));

        if (status) {
            q = query(q, where('status', '==', status));
        }

        // Add sorting by due date
        q = query(q, orderBy('due_date', 'asc'));

        const querySnapshot = await getDocs(q);

        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                farm_id: data.farm_id,
                title: data.title,
                description: data.description || '',
                due_date: data.due_date,
                status: data.status,
                priority: data.priority,
                assigned_to: data.assigned_to,
                created_at: data.created_at,
                updated_at: data.updated_at
            });
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

// Set up real-time task listener
export const subscribeToTasks = (farmId: string, callback: (tasks: Task[]) => void) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(
        tasksRef,
        where('farm_id', '==', farmId),
        orderBy('due_date', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                farm_id: data.farm_id,
                title: data.title,
                description: data.description || '',
                due_date: data.due_date,
                status: data.status,
                priority: data.priority,
                assigned_to: data.assigned_to,
                created_at: data.created_at,
                updated_at: data.updated_at
            });
        });

        callback(tasks);
    }, (error) => {
        console.error('Error subscribing to tasks:', error);
    });
};

// Subscription helpers
export const subscribeToSensorReadings = (farmId: string, callback: (readings: SensorReading[]) => void) => {
    const readingsRef = collection(db, 'sensor_readings')
    const q = query(
        readingsRef,
        where('farm_id', '==', farmId),
        orderBy('timestamp', 'desc'),
        limit(10)
    )

    return onSnapshot(q, (snapshot) => {
        const readings: SensorReading[] = []
        snapshot.forEach((doc) => {
            readings.push({ id: doc.id, ...doc.data() } as SensorReading)
        })
        callback(readings)
    })
}

// User profile services
export const getUserProfile = async (userId: string) => {
    const userProfileRef = collection(db, 'user_profiles');
    const q = query(userProfileRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    return null;
};

export const createUserProfile = async (userId: string, profileData: any) => {
    const userProfileRef = collection(db, 'user_profiles');
    const docRef = await addDoc(userProfileRef, {
        user_id: userId,
        ...profileData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
    });

    return { id: docRef.id, ...profileData };
};

export const updateUserProfile = async (profileId: string, profileData: any) => {
    const profileRef = doc(db, 'user_profiles', profileId);
    await updateDoc(profileRef, {
        ...profileData,
        updated_at: Timestamp.now()
    });

    return { id: profileId, ...profileData };
};

// Alert services
export const getAlerts = async (farmId: string, status?: string) => {
    const alertsRef = collection(db, 'alerts');
    let q;

    if (status) {
        q = query(
            alertsRef,
            where('farm_id', '==', farmId),
            where('status', '==', status),
            orderBy('created_at', 'desc')
        );
    } else {
        q = query(
            alertsRef,
            where('farm_id', '==', farmId),
            orderBy('created_at', 'desc')
        );
    }

    const querySnapshot = await getDocs(q);

    const alerts: any[] = [];
    querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() });
    });

    return alerts;
};

export const createAlert = async (alertData: any) => {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
        ...alertData,
        created_at: Timestamp.now(),
        status: alertData.status || 'active'
    });

    return { id: docRef.id, ...alertData };
};

export const updateAlert = async (alertId: string, alertData: any) => {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
        ...alertData,
        updated_at: Timestamp.now()
    });

    return { id: alertId, ...alertData };
};

// Financial data services
export const getFinancialData = async (farmId: string, period?: string) => {
    const financialRef = collection(db, 'financial_data');
    let q;

    if (period) {
        q = query(
            financialRef,
            where('farm_id', '==', farmId),
            where('period', '==', period),
            orderBy('date', 'desc')
        );
    } else {
        q = query(
            financialRef,
            where('farm_id', '==', farmId),
            orderBy('date', 'desc')
        );
    }

    const querySnapshot = await getDocs(q);

    const financialData: any[] = [];
    querySnapshot.forEach((doc) => {
        financialData.push({ id: doc.id, ...doc.data() });
    });

    return financialData;
};

// Batch operations for better performance
export const batchCreateDevices = async (devices: any[]) => {
    const batch = writeBatch(db);
    const deviceRefs: DocumentReference[] = [];

    devices.forEach(device => {
        const newDeviceRef = doc(collection(db, 'devices'));
        batch.set(newDeviceRef, {
            ...device,
            created_at: Timestamp.now()
        });
        deviceRefs.push(newDeviceRef);
    });

    await batch.commit();

    return deviceRefs.map((ref, index) => ({
        id: ref.id,
        ...devices[index]
    }));
};

// Real-time subscriptions for all major collections
export const subscribeToAlerts = (farmId: string, callback: (alerts: any[]) => void) => {
    const alertsRef = collection(db, 'alerts');
    const q = query(
        alertsRef,
        where('farm_id', '==', farmId),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const alerts: any[] = [];
        snapshot.forEach((doc) => {
            alerts.push({ id: doc.id, ...doc.data() });
        });
        callback(alerts);
    });
};

export const subscribeToDevices = (farmId: string, callback: (devices: any[]) => void) => {
    const devicesRef = collection(db, 'devices');
    const q = query(
        devicesRef,
        where('farm_id', '==', farmId)
    );

    return onSnapshot(q, (snapshot) => {
        const devices: any[] = [];
        snapshot.forEach((doc) => {
            devices.push({ id: doc.id, ...doc.data() });
        });
        callback(devices);
    });
};

// Analytics services
export const getFarmAnalytics = async (farmId: string) => {
    try {
        // Initialize with proper types
        const cropYields: { name: string; corn: number; wheat: number; soybeans: number; }[] = [];
        const resourceUsage: { name: string; water: number; electricity: number; fuel: number; }[] = [];
        const cropDistribution: { name: string; value: number; color: string; }[] = [];
        const profitMargins: { name: string; profit: number; cost: number; }[] = [];
        const soilHealth: { name: string; nitrogen: number; phosphorus: number; potassium: number; }[] = [];

        // Add this before processing the crop distribution data
        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        let colorIndex = 0;

        // Fetch crop yields
        const yieldsRef = collection(db, 'crop_yields');
        const yieldsQuery = query(
            yieldsRef,
            where('farm_id', '==', farmId),
            orderBy('date', 'asc'),
            limit(7)
        );

        // Fetch resource usage
        const resourcesRef = collection(db, 'resource_usage');
        const resourcesQuery = query(
            resourcesRef,
            where('farm_id', '==', farmId),
            orderBy('date', 'asc'),
            limit(7)
        );

        // Fetch crop distribution
        const cropsRef = collection(db, 'crops');
        const cropsQuery = query(
            cropsRef,
            where('farm_id', '==', farmId)
        );

        // Fetch profit margins
        const financialRef = collection(db, 'financial_data');
        const financialQuery = query(
            financialRef,
            where('farm_id', '==', farmId),
            orderBy('date', 'asc'),
            limit(7)
        );

        // Fetch soil health
        const soilRef = collection(db, 'soil_data');
        const soilQuery = query(
            soilRef,
            where('farm_id', '==', farmId)
        );

        // Execute all queries in parallel
        const [yieldsSnapshot, resourcesSnapshot, cropsSnapshot, financialSnapshot, soilSnapshot] =
            await Promise.all([
                getDocs(yieldsQuery),
                getDocs(resourcesQuery),
                getDocs(cropsQuery),
                getDocs(financialQuery),
                getDocs(soilQuery)
            ]);

        // Process crop yields data
        yieldsSnapshot.forEach(doc => {
            const data = doc.data();
            cropYields.push({
                name: new Date(data.date.toDate()).toLocaleString('default', { month: 'short' }),
                corn: data.corn || 0,
                wheat: data.wheat || 0,
                soybeans: data.soybeans || 0
            });
        });

        // Process resource usage data
        resourcesSnapshot.forEach(doc => {
            const data = doc.data();
            resourceUsage.push({
                name: new Date(data.date.toDate()).toLocaleString('default', { month: 'short' }),
                water: data.water || 0,
                electricity: data.electricity || 0,
                fuel: data.fuel || 0
            });
        });

        // Process crop distribution data
        cropsSnapshot.forEach(doc => {
            const data = doc.data();
            cropDistribution.push({
                name: data.name,
                value: data.area || 0,
                color: colors[colorIndex % colors.length]
            });
            colorIndex++;
        });

        // Process profit margins data
        financialSnapshot.forEach(doc => {
            const data = doc.data();
            profitMargins.push({
                name: new Date(data.date.toDate()).toLocaleString('default', { month: 'short' }),
                profit: data.revenue || 0,
                cost: data.expenses || 0
            });
        });

        // Process soil health data
        soilSnapshot.forEach(doc => {
            const data = doc.data();
            soilHealth.push({
                name: data.field_name || `Field ${doc.id.slice(0, 2)}`,
                nitrogen: data.nitrogen || 0,
                phosphorus: data.phosphorus || 0,
                potassium: data.potassium || 0
            });
        });

        return {
            cropYields: cropYields.length > 0 ? cropYields : testAnalyticsData.cropYields,
            resourceUsage: resourceUsage.length > 0 ? resourceUsage : testAnalyticsData.resourceUsage,
            cropDistribution: cropDistribution.length > 0 ? cropDistribution : testAnalyticsData.cropDistribution,
            profitMargins: profitMargins.length > 0 ? profitMargins : testAnalyticsData.profitMargins,
            soilHealth: soilHealth.length > 0 ? soilHealth : testAnalyticsData.soilHealth,
            seasonalTrends: testAnalyticsData.seasonalTrends,
            cropPerformance: testAnalyticsData.cropPerformance,
            waterUsageEfficiency: testAnalyticsData.waterUsageEfficiency
        };
    } catch (error) {
        console.error('Error fetching farm analytics:', error);
        throw error;
    }
};

// Test data for analytics (used as fallback)
const testAnalyticsData = {
    cropYields: [
        { name: 'Jan', corn: 4000, wheat: 2400, soybeans: 2400 },
        { name: 'Feb', corn: 3000, wheat: 1398, soybeans: 2210 },
        { name: 'Mar', corn: 2000, wheat: 9800, soybeans: 2290 },
        { name: 'Apr', corn: 2780, wheat: 3908, soybeans: 2000 },
        { name: 'May', corn: 1890, wheat: 4800, soybeans: 2181 },
        { name: 'Jun', corn: 2390, wheat: 3800, soybeans: 2500 },
        { name: 'Jul', corn: 3490, wheat: 4300, soybeans: 2100 },
    ],
    resourceUsage: [
        { name: 'Jan', water: 4000, electricity: 2400, fuel: 2400 },
        { name: 'Feb', water: 3000, electricity: 1398, fuel: 2210 },
        { name: 'Mar', water: 2000, electricity: 9800, fuel: 2290 },
        { name: 'Apr', water: 2780, electricity: 3908, fuel: 2000 },
        { name: 'May', water: 1890, electricity: 4800, fuel: 2181 },
        { name: 'Jun', water: 2390, electricity: 3800, fuel: 2500 },
        { name: 'Jul', water: 3490, electricity: 4300, fuel: 2100 },
    ],
    cropDistribution: [
        { name: 'Corn', value: 400, color: '#0088FE' },
        { name: 'Wheat', value: 300, color: '#00C49F' },
        { name: 'Soybeans', value: 300, color: '#FFBB28' },
        { name: 'Rice', value: 200, color: '#FF8042' },
    ],
    profitMargins: [
        { name: 'Jan', profit: 4000, cost: 2400 },
        { name: 'Feb', profit: 3000, cost: 1398 },
        { name: 'Mar', profit: 2000, cost: 9800 },
        { name: 'Apr', profit: 2780, cost: 3908 },
        { name: 'May', profit: 1890, cost: 4800 },
        { name: 'Jun', profit: 2390, cost: 3800 },
        { name: 'Jul', profit: 3490, cost: 4300 },
    ],
    soilHealth: [
        { name: 'Field A', nitrogen: 80, phosphorus: 65, potassium: 75 },
        { name: 'Field B', nitrogen: 65, phosphorus: 75, potassium: 60 },
        { name: 'Field C', nitrogen: 70, phosphorus: 60, potassium: 80 },
        { name: 'Field D', nitrogen: 75, phosphorus: 70, potassium: 65 },
    ],
    seasonalTrends: [],
    cropPerformance: [],
    waterUsageEfficiency: []
};

// Get historical weather data
export const getHistoricalWeatherData = async (farmId: string) => {
    try {
        // Create a reference to the historical_weather collection
        const weatherRef = collection(db, 'historical_weather');

        // Query for this farm's historical weather data
        const q = query(
            weatherRef,
            where('farm_id', '==', farmId),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);

        // Process the data into the format needed for charts
        const temperatureData: any[] = [];
        const rainfallData: any[] = [];
        const humidityData: any[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date;

            // Temperature data
            if (data.temperature) {
                temperatureData.push({
                    date,
                    min: data.temperature.min || 0,
                    max: data.temperature.max || 0,
                    avg: data.temperature.avg || 0
                });
            }

            // Rainfall data
            if (data.rainfall) {
                rainfallData.push({
                    date,
                    amount: data.rainfall || 0
                });
            }

            // Humidity data
            if (data.humidity) {
                humidityData.push({
                    date,
                    morning: data.humidity.morning || 0,
                    afternoon: data.humidity.afternoon || 0,
                    evening: data.humidity.evening || 0
                });
            }
        });

        return {
            temperature: temperatureData.length > 0 ? temperatureData : testHistoricalWeather.temperature,
            rainfall: rainfallData.length > 0 ? rainfallData : testHistoricalWeather.rainfall,
            humidity: humidityData.length > 0 ? humidityData : testHistoricalWeather.humidity
        };
    } catch (error) {
        console.error('Error fetching historical weather data:', error);
        throw error;
    }
};

// Test data for historical weather
const testHistoricalWeather = {
    temperature: [
        { date: '2023-01', avg: 22, min: 18, max: 28 },
        { date: '2023-02', avg: 24, min: 19, max: 30 },
        { date: '2023-03', avg: 25, min: 20, max: 32 },
        { date: '2023-04', avg: 23, min: 18, max: 29 },
        { date: '2023-05', avg: 21, min: 16, max: 27 },
        { date: '2023-06', avg: 19, min: 14, max: 25 },
        { date: '2023-07', avg: 18, min: 13, max: 24 },
        { date: '2023-08', avg: 20, min: 15, max: 26 },
        { date: '2023-09', avg: 22, min: 17, max: 28 },
        { date: '2023-10', avg: 24, min: 19, max: 30 },
        { date: '2023-11', avg: 23, min: 18, max: 29 },
        { date: '2023-12', avg: 21, min: 16, max: 27 },
    ],
    rainfall: [
        { date: '2023-01', amount: 120 },
        { date: '2023-02', amount: 100 },
        { date: '2023-03', amount: 80 },
        { date: '2023-04', amount: 60 },
        { date: '2023-05', amount: 40 },
        { date: '2023-06', amount: 30 },
        { date: '2023-07', amount: 20 },
        { date: '2023-08', amount: 30 },
        { date: '2023-09', amount: 50 },
        { date: '2023-10', amount: 70 },
        { date: '2023-11', amount: 90 },
        { date: '2023-12', amount: 110 },
    ],
    humidity: [
        { date: '2023-01', morning: 80, afternoon: 60, evening: 75 },
        { date: '2023-02', morning: 85, afternoon: 65, evening: 80 },
        { date: '2023-03', morning: 75, afternoon: 55, evening: 70 },
        { date: '2023-04', morning: 70, afternoon: 50, evening: 65 },
        { date: '2023-05', morning: 65, afternoon: 45, evening: 60 },
        { date: '2023-06', morning: 60, afternoon: 40, evening: 55 },
        { date: '2023-07', morning: 55, afternoon: 35, evening: 50 },
        { date: '2023-08', morning: 60, afternoon: 40, evening: 55 },
        { date: '2023-09', morning: 65, afternoon: 45, evening: 60 },
        { date: '2023-10', morning: 70, afternoon: 50, evening: 65 },
        { date: '2023-11', morning: 75, afternoon: 55, evening: 70 },
        { date: '2023-12', morning: 80, afternoon: 60, evening: 75 },
    ]
};

// Add a new task
export const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
        const tasksRef = collection(db, 'tasks');
        const docRef = await addDoc(tasksRef, {
            ...taskData,
            created_at: serverTimestamp()
        });

        return { id: docRef.id, ...taskData };
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            ...updates,
            updated_at: serverTimestamp()
        });

        return { id: taskId, ...updates };
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

// Delete a task
export const deleteTask = async (taskId: string) => {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

// Get due tasks (tasks that are due today or overdue)
export const getDueTasks = async (farmId: string) => {
    try {
        const tasksRef = collection(db, 'tasks');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Simplify the query to avoid index requirements
        const q = query(
            tasksRef,
            where('farm_id', '==', farmId),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);

        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const task = { id: doc.id, ...doc.data() } as Task;
            // Filter in memory instead of in the query
            if (task.due_date && task.due_date.toDate() <= today) {
                tasks.push(task);
            }
        });

        // Sort in memory
        return tasks.sort((a, b) =>
            a.due_date.toDate().getTime() - b.due_date.toDate().getTime()
        );
    } catch (error) {
        console.error('Error fetching due tasks:', error);
        return [];
    }
};

// Add this helper function at the top of the file
export const isIndexError = (error: any): boolean => {
    return error?.message?.includes('requires an index') ||
        error?.message?.includes('index does not exist');
}; 