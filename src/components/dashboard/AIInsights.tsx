import { FaRobot, FaLeaf, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

interface AIInsightsProps {
    useTestData: boolean;
}

// Add this function to fetch real insights
// const fetchRealInsights = () => {
//     console.log("Fetching real insights...");
//     // In a real app, this would make an API call
//     return [
//         { title: "Real Insight 1", message: "This is real data" },
//         { title: "Real Insight 2", message: "More real data" }
//     ];
// };

export const AIInsights = ({ useTestData }: AIInsightsProps) => {
    console.log(`Using test data: ${useTestData}`);

    // const insights = useTestData
    //     ? [
    //         { title: "Test Insight 1", message: "This is test data" },
    //         // More test insights
    //     ]
    //     : fetchRealInsights();

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <FaRobot className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <FaLeaf className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                        <h3 className="font-medium text-green-900">Optimal Growth Conditions</h3>
                        <p className="text-green-700 text-sm">Your crops are in ideal growing conditions. Maintain current irrigation levels.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <FaChartLine className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-medium text-blue-900">Yield Prediction</h3>
                        <p className="text-blue-700 text-sm">Expected yield increase of 15% compared to last season based on current conditions.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                        <h3 className="font-medium text-yellow-900">Upcoming Alert</h3>
                        <p className="text-yellow-700 text-sm">Consider harvesting within the next 5 days for optimal crop quality.</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 