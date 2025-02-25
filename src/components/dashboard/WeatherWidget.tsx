import { useState, useEffect } from 'react'
import { FaCloudSun, FaWind, FaTemperatureHigh, FaUmbrella } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useTestData } from '../../hooks/useTestData'
import { getWeatherData } from '../../services/firebaseService'

interface WeatherWidgetProps {
    farmId: string;
    fullWidth?: boolean;
    currentWeather?: {
        temperature: number;
        condition: string;
        forecast: string;
    };
}

// Test weather data
const testWeatherData = {
    temperature: 28,
    humidity: 65,
    wind_speed: 12,
    precipitation: 0,
    forecast: 'sunny',
    location: 'Lagos, Nigeria',
    timestamp: new Date().toISOString(),
    id: '1',
    farm_id: '1',
    // Add a forecast array for the 5-day forecast
    forecastData: [
        { day: 'Mon', temp: '29°C', condition: 'Sunny' },
        { day: 'Tue', temp: '28°C', condition: 'Partly Cloudy' },
        { day: 'Wed', temp: '30°C', condition: 'Sunny' },
        { day: 'Thu', temp: '27°C', condition: 'Rain' },
        { day: 'Fri', temp: '26°C', condition: 'Thunderstorm' }
    ]
}

export const WeatherWidget = ({
    farmId,
    fullWidth = false,
    currentWeather
}: WeatherWidgetProps) => {
    const { data: weatherData, loading } = useTestData(
        testWeatherData,
        () => getWeatherData(farmId)
    )

    if (loading) {
        return <div className="loading">Loading weather data...</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-sm ${fullWidth ? 'w-full' : ''}`}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Weather</h2>
                    <span className="text-sm text-gray-500">{weatherData.location}</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                        <FaCloudSun className="w-16 h-16 text-yellow-500" />
                        <div className="ml-4">
                            <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
                            <div className="text-gray-500">{weatherData.condition}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center">
                            <FaUmbrella className="w-6 h-6 text-blue-500 mb-1" />
                            <div className="text-sm text-gray-500">Humidity</div>
                            <div className="font-semibold">{weatherData.humidity}%</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaWind className="w-6 h-6 text-blue-500 mb-1" />
                            <div className="text-sm text-gray-500">Wind</div>
                            <div className="font-semibold">{weatherData.wind_speed} km/h</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <FaTemperatureHigh className="w-6 h-6 text-blue-500 mb-1" />
                            <div className="text-sm text-gray-500">Precip</div>
                            <div className="font-semibold">{weatherData.precipitation}%</div>
                        </div>
                    </div>
                </div>

                {weatherData.forecastData && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">5-Day Forecast</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {weatherData.forecastData.map((day) => (
                                <div key={day.day} className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="font-medium">{day.day}</div>
                                    <div className="text-xl font-bold my-2">{day.temp}</div>
                                    <div className="text-sm text-gray-500">{day.condition}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
} 