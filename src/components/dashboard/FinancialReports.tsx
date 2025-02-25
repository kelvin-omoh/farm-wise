import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FaChartBar, FaDownload } from 'react-icons/fa'

const data = [
    { month: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', revenue: 9800, expenses: 2000, profit: 7800 },
    { month: 'Apr', revenue: 3908, expenses: 2780, profit: 1128 },
    { month: 'May', revenue: 4800, expenses: 1890, profit: 2910 },
    { month: 'Jun', revenue: 3800, expenses: 2390, profit: 1410 }
]

export const FinancialReports = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaChartBar className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Financial Overview</h2>
                </div>
                <button className="btn btn-sm btn-outline gap-2">
                    <FaDownload className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50">
                    <div className="text-sm text-green-600">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-700">₦29,308</div>
                    <div className="text-sm text-green-600">+12.5% from last month</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50">
                    <div className="text-sm text-red-600">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-700">₦12,858</div>
                    <div className="text-sm text-red-600">-3.2% from last month</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                    <div className="text-sm text-blue-600">Net Profit</div>
                    <div className="text-2xl font-bold text-blue-700">₦16,450</div>
                    <div className="text-sm text-blue-600">+15.8% from last month</div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#4ade80" name="Revenue" />
                        <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                        <Bar dataKey="profit" fill="#60a5fa" name="Profit" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
} 