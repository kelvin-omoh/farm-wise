import { FaExclamationTriangle } from 'react-icons/fa';

const IndexNotification = () => {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                        Firestore indexes need to be created for live data to work properly
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>
                            You're seeing test data because some Firestore queries require composite indexes.
                            To use live data, please create the required indexes manually:
                        </p>
                        <ol className="list-decimal pl-5 mt-2 space-y-1">
                            <li>
                                Go to your Firebase console
                            </li>
                            <li>
                                Navigate to Firestore Database → Indexes
                            </li>
                            <li>
                                Click "Add Index" and create indexes for collections that need them
                            </li>
                        </ol>
                        <p className="mt-2">
                            Common collections that need indexes: tasks, sensor_readings, weather_data
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndexNotification; 