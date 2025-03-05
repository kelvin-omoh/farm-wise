import { useState } from 'react'
import { WeatherWidget } from '../../components/dashboard/WeatherWidget'
import { FaSun, FaCloudRain, FaWind } from 'react-icons/fa'
import { useAuthStore } from '../../stores/authStore'
import { useTestData } from '../../hooks/useTestData'
import { getHistoricalWeatherData } from '../../services/firebaseService'
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

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

const WeatherPage = () => {
    const [/* useLocalTestData */, /* setUseLocalTestData */] = useState(true)
    const { user } = useAuthStore()
    const farmId = user?.farm_id || 'default'

    const { data: historicalWeather, loading } = useTestData(
        testHistoricalWeather,
        () => getHistoricalWeatherData(farmId)
    )

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Weather Monitoring</h1>
                        <p className="text-sm md:text-base text-gray-600">Track weather conditions and forecasts</p>
                    </div>
                </div>
            </div>

            {/* Current Weather */}
            <WeatherWidget
                fullWidth={true}
                farmId={farmId}
                weatherData={{
                    temperature: 28,
                    humidity: 65,
                    wind_speed: 12,
                    precipitation: 0,
                    forecast: 'Sunny',
                    location: 'Your Farm Location',
                    timestamp: new Date().toISOString(),
                    id: '1',
                    farm_id: farmId,
                    forecastData: [
                        { day: 'Mon', temp: '29°C', condition: 'Sunny' },
                        { day: 'Tue', temp: '28°C', condition: 'Partly Cloudy' },
                        { day: 'Wed', temp: '30°C', condition: 'Sunny' },
                        { day: 'Thu', temp: '27°C', condition: 'Rain' },
                        { day: 'Fri', temp: '26°C', condition: 'Thunderstorm' }
                    ]
                }}
            />

            {/* Weather Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Weather Alerts</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                        <FaWind className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-yellow-700">Strong Winds Expected</h3>
                            <p className="text-sm text-yellow-600">Wind speeds of 20-30 km/h expected tomorrow. Secure any loose equipment.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Impact on Crops */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Weather Impact Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <FaSun className="text-orange-500 mr-2" />
                            <h3 className="font-medium">Temperature</h3>
                        </div>
                        <p className="text-sm text-gray-600">Current temperatures are optimal for maize growth. No action needed.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <FaCloudRain className="text-blue-500 mr-2" />
                            <h3 className="font-medium">Precipitation</h3>
                        </div>
                        <p className="text-sm text-gray-600">Light rain expected in 3 days. Consider postponing fertilizer application.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <FaWind className="text-gray-500 mr-2" />
                            <h3 className="font-medium">Wind</h3>
                        </div>
                        <p className="text-sm text-gray-600">Strong winds may affect young plants. Consider adding temporary windbreaks.</p>
                    </div>
                </div>
            </div>

            {/* Historical Weather Data */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Historical Weather Data</h2>

                {loading ? (
                    <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">Loading historical weather data...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Temperature Chart */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Temperature Trends (°C)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={historicalWeather.temperature}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="max" stroke="#ff7300" name="Maximum" />
                                        <Line type="monotone" dataKey="avg" stroke="#387908" name="Average" />
                                        <Line type="monotone" dataKey="min" stroke="#0088fe" name="Minimum" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Rainfall Chart */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Monthly Rainfall (mm)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={historicalWeather.rainfall}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="amount" fill="#8884d8" name="Rainfall" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Humidity Chart */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Humidity Patterns (%)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={historicalWeather.humidity}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="morning" stackId="1" stroke="#8884d8" fill="#8884d8" name="Morning" />
                                        <Area type="monotone" dataKey="afternoon" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Afternoon" />
                                        <Area type="monotone" dataKey="evening" stackId="1" stroke="#ffc658" fill="#ffc658" name="Evening" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default WeatherPage 