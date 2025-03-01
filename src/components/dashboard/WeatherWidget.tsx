import { FaSun, FaCloud } from 'react-icons/fa'
// import { motion } from 'framer-motion'
// import { useTestData } from '../../hooks/useTestData'
// import { getWeatherData } from '../../services/firebaseService'

// Define proper types for weather data
interface WeatherData {
    id: string;
    farm_id: string;
    temperature: number;
    humidity: number;
    wind_speed: number;
    precipitation: number;
    forecast: string;
    condition?: string;
    location: string;
    timestamp: string;
    forecastData: Array<{
        day: string;
        temp: string;
        condition: string;
    }>;
}

interface WeatherWidgetProps {
    farmId: string;
    fullWidth?: boolean;
    weatherData?: WeatherData;
    useTestData?: boolean;
}

// Test weather data
// const testWeatherData = {
//     temperature: 28,
//     humidity: 65,
//     wind_speed: 12,
//     precipitation: 0,
//     forecast: 'sunny',
//     location: 'Lagos, Nigeria',
//     timestamp: new Date().toISOString(),
//     id: '1',
//     farm_id: '1',
//     // Add a forecast array for the 5-day forecast
//     forecastData: [
//         { day: 'Mon', temp: '29°C', condition: 'Sunny' },
//         { day: 'Tue', temp: '28°C', condition: 'Partly Cloudy' },
//         { day: 'Wed', temp: '30°C', condition: 'Sunny' },
//         { day: 'Thu', temp: '27°C', condition: 'Rain' },
//         { day: 'Fri', temp: '26°C', condition: 'Thunderstorm' }
//     ]
// }

export const WeatherWidget = ({ weatherData, }: WeatherWidgetProps) => {
    // const [weatherDataState, setWeatherDataState] = useState<WeatherData | null>(null);

    // Actually use this function in your JSX
    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'sunny': return <FaSun />;
            case 'cloudy': return <FaCloud />;
            default: return <FaCloud />;
        }
    };

    return (
        <div className="weather-widget">
            {/* Actually use the function here */}
            <div className="weather-icon">
                {weatherData?.condition && getWeatherIcon(weatherData.condition)}
            </div>
            {/* Rest of JSX */}
        </div>
    );
}; 