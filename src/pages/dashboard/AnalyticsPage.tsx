import { useState, useEffect } from 'react'
import { FarmStatistics } from '../../components/dashboard/FarmStatistics'
import { StatisticsGraph } from '../../components/dashboard/StatisticsGraph'
import { FinancialReports } from '../../components/dashboard/FinancialReports'
import { Switch } from '../../components/ui/Switch'
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa'
import { useTestData } from '../../hooks/useTestData'
import { getFarmAnalytics } from '../../services/firebaseService'
import { useAuthStore } from '../../stores/authStore'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ComposedChart, Scatter, ScatterChart, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// Test data for analytics
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
        { name: 'Jan', profit: 4000, cost: 2400, revenue: 6400 },
        { name: 'Feb', profit: 3000, cost: 1398, revenue: 4398 },
        { name: 'Mar', profit: 2000, cost: 9800, revenue: 11800 },
        { name: 'Apr', profit: 2780, cost: 3908, revenue: 6688 },
        { name: 'May', profit: 1890, cost: 4800, revenue: 6690 },
        { name: 'Jun', profit: 2390, cost: 3800, revenue: 6190 },
        { name: 'Jul', profit: 3490, cost: 4300, revenue: 7790 },
    ],
    soilHealth: [
        { name: 'Field A', nitrogen: 80, phosphorus: 65, potassium: 75 },
        { name: 'Field B', nitrogen: 65, phosphorus: 75, potassium: 60 },
        { name: 'Field C', nitrogen: 70, phosphorus: 60, potassium: 80 },
        { name: 'Field D', nitrogen: 75, phosphorus: 70, potassium: 65 },
    ],
    cropPerformance: [
        { name: 'Corn', yield: 85, cost: 45, profit: 75, area: 120 },
        { name: 'Wheat', yield: 65, cost: 35, profit: 55, area: 80 },
        { name: 'Soybeans', yield: 70, cost: 40, profit: 60, area: 100 },
        { name: 'Rice', yield: 75, cost: 50, profit: 65, area: 90 },
    ],
    seasonalTrends: [
        { name: 'Winter', yield: 45, rainfall: 120 },
        { name: 'Spring', yield: 75, rainfall: 80 },
        { name: 'Summer', yield: 85, rainfall: 40 },
        { name: 'Fall', yield: 65, rainfall: 60 },
    ],
    waterUsageEfficiency: [
        { name: 'Field A', efficiency: 85, usage: 120 },
        { name: 'Field B', efficiency: 70, usage: 150 },
        { name: 'Field C', efficiency: 90, usage: 100 },
        { name: 'Field D', efficiency: 75, usage: 130 },
    ]
};

const AnalyticsPage = () => {
    const [useLocalTestData, setUseLocalTestData] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const { user } = useAuthStore()
    const farmId = user?.farm_id || 'default'

    const { data: analyticsData, loading } = useTestData(
        testAnalyticsData,
        () => getFarmAnalytics(farmId)
    )

    if (loading) {
        return <div className="p-6 flex justify-center">Loading analytics data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Farm Analytics</h1>
                        <p className="text-sm md:text-base text-gray-600">Analyze your farm's performance and trends</p>
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

            {/* Analytics Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex overflow-x-auto space-x-4 pb-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'overview' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaChartLine className="mr-2" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('crops')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'crops' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaChartBar className="mr-2" /> Crop Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'financial' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaChartPie className="mr-2" /> Financial
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'resources' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <FaChartArea className="mr-2" /> Resource Usage
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
                <>
                    <StatisticsGraph />

                    {/* Overview Dashboard */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Farm Performance Overview</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Crop Distribution */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Crop Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.cropDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {analyticsData.cropDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Seasonal Trends */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Seasonal Yield vs Rainfall</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={analyticsData.seasonalTrends}
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="yield" fill="#8884d8" name="Yield (tons)" />
                                            <Line yAxisId="right" type="monotone" dataKey="rainfall" stroke="#ff7300" name="Rainfall (mm)" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <FarmStatistics />
                </>
            )}

            {activeTab === 'financial' && (
                <>
                    <FinancialReports />

                    {/* Additional Financial Charts */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Financial Performance</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue, Cost, Profit */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Revenue, Cost & Profit</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={analyticsData.profitMargins}
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="revenue" stackId="a" fill="#8884d8" name="Revenue" />
                                            <Bar dataKey="cost" stackId="a" fill="#82ca9d" name="Cost" />
                                            <Line type="monotone" dataKey="profit" stroke="#ff7300" name="Profit" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Profit by Crop */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Profit by Crop</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={analyticsData.cropPerformance}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="cost" fill="#8884d8" name="Cost" />
                                            <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'crops' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Crop Performance Analysis</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Crop Yields Over Time */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Crop Yields Over Time</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={analyticsData.cropYields}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="corn" stroke="#8884d8" activeDot={{ r: 8 }} />
                                            <Line type="monotone" dataKey="wheat" stroke="#82ca9d" />
                                            <Line type="monotone" dataKey="soybeans" stroke="#ffc658" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Crop Performance Metrics */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Crop Performance Metrics</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart outerRadius={90} width={730} height={250} data={analyticsData.cropPerformance}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="name" />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                            <Radar name="Yield" dataKey="yield" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Radar name="Profit" dataKey="profit" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                            <Radar name="Cost" dataKey="cost" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Soil Health Analysis</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analyticsData.soilHealth}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="nitrogen" fill="#8884d8" name="Nitrogen" />
                                    <Bar dataKey="phosphorus" fill="#82ca9d" name="Phosphorus" />
                                    <Bar dataKey="potassium" fill="#ffc658" name="Potassium" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">Resource Usage Analytics</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Resource Usage Over Time */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Resource Usage Over Time</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={analyticsData.resourceUsage}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="water" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                            <Area type="monotone" dataKey="electricity" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                            <Area type="monotone" dataKey="fuel" stackId="1" stroke="#ffc658" fill="#ffc658" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Water Usage Efficiency */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Water Usage Efficiency</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        >
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="usage" name="Water Usage (kL)" />
                                            <YAxis type="number" dataKey="efficiency" name="Efficiency (%)" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Fields" data={analyticsData.waterUsageEfficiency} fill="#8884d8" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AnalyticsPage 