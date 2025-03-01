import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaChartLine } from 'react-icons/fa'

const data = [
    { name: 'Jan', yield: 4000, revenue: 2400 },
    { name: 'Feb', yield: 3000, revenue: 1398 },
    { name: 'Mar', yield: 2000, revenue: 9800 },
    { name: 'Apr', yield: 2780, revenue: 3908 },
    { name: 'May', yield: 1890, revenue: 4800 },
    { name: 'Jun', yield: 2390, revenue: 3800 }
]

interface StatisticsGraphProps {
    useTestData: boolean;
}

const fetchRealData = () => {
    console.log("Fetching real data...");
    // In a real app, this would make an API call
    return data; // Return test data for now
};

export const StatisticsGraph = ({ useTestData }: StatisticsGraphProps) => {
    console.log(`Using test data: ${useTestData}`);

    const chartData = useTestData ? data : fetchRealData();

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaChartLine className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Farm Performance</h2>
                </div>
                <select className="select select-bordered select-sm">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>All time</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="yield" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
} 