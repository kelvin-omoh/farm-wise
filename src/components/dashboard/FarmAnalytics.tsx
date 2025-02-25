import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';
import { useTestData } from '../../hooks/useTestData';
import { getFarmAnalytics } from '../../services/firebaseService';
import { motion } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa';

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
    ]
};

interface FarmAnalyticsProps {
    farmId: string;
}

export const FarmAnalytics = ({ farmId }: FarmAnalyticsProps) => {
    const [activeChart, setActiveChart] = useState<'yields' | 'resources' | 'distribution' | 'profits' | 'soil'>('yields');

    const { data: analyticsData, loading } = useTestData(
        testAnalyticsData,
        () => getFarmAnalytics(farmId)
    );

    if (loading) {
        return <div className="loading">Loading analytics data...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Farm Analytics</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveChart('yields')}
                        className={`p-2 rounded-md ${activeChart === 'yields' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        title="Crop Yields"
                    >
                        <FaChartLine />
                    </button>
                    <button
                        onClick={() => setActiveChart('resources')}
                        className={`p-2 rounded-md ${activeChart === 'resources' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        title="Resource Usage"
                    >
                        <FaChartArea />
                    </button>
                    <button
                        onClick={() => setActiveChart('distribution')}
                        className={`p-2 rounded-md ${activeChart === 'distribution' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        title="Crop Distribution"
                    >
                        <FaChartPie />
                    </button>
                    <button
                        onClick={() => setActiveChart('profits')}
                        className={`p-2 rounded-md ${activeChart === 'profits' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        title="Profit Margins"
                    >
                        <FaChartBar />
                    </button>
                    <button
                        onClick={() => setActiveChart('soil')}
                        className={`p-2 rounded-md ${activeChart === 'soil' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        title="Soil Health"
                    >
                        <FaChartBar />
                    </button>
                </div>
            </div>

            <div className="h-80">
                {activeChart === 'yields' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Crop Yields Over Time</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={analyticsData.cropYields}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                )}

                {activeChart === 'resources' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={analyticsData.resourceUsage}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                )}

                {activeChart === 'distribution' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Crop Distribution</h3>
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
                )}

                {activeChart === 'profits' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Profit vs. Cost</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analyticsData.profitMargins}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="profit" fill="#82ca9d" />
                                <Bar dataKey="cost" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeChart === 'soil' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Soil Health by Field</h3>
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
                                <Bar dataKey="nitrogen" fill="#8884d8" />
                                <Bar dataKey="phosphorus" fill="#82ca9d" />
                                <Bar dataKey="potassium" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}; 