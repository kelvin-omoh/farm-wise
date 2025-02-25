import { useState, useEffect } from 'react';
import { testFirebaseConnection } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

export const FirebaseConnectionTest = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Testing connection...');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Test basic connection
                const result = await testFirebaseConnection();

                if (!result.success) {
                    setStatus('error');
                    setMessage('Failed to connect to Firebase');
                    setDetails(result.error);
                    return;
                }

                // Test auth
                const auth = getAuth();
                const currentUser = auth.currentUser;

                // Test Firestore collections
                const db = getFirestore();
                const collections = ['farms', 'devices', 'sensor_readings'];
                const collectionResults: Record<string, { exists: boolean, error: any }> = {};

                for (const collectionName of collections) {
                    try {
                        const q = query(collection(db, collectionName), limit(1));
                        await getDocs(q);
                        collectionResults[collectionName] = { exists: true, error: null };
                    } catch (err) {
                        collectionResults[collectionName] = { exists: false, error: err };
                    }
                }

                setStatus('success');
                setMessage('Firebase connection successful');
                setDetails({ auth: { user: currentUser }, collections: collectionResults });
            } catch (err) {
                setStatus('error');
                setMessage('Exception during connection test');
                setDetails(err);
            }
        };

        testConnection();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Firebase Connection Status</h2>

            <div className={`p-4 rounded-lg ${status === 'loading' ? 'bg-blue-50 text-blue-700' :
                status === 'success' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                }`}>
                <div className="font-semibold">{message}</div>

                {status === 'loading' && (
                    <div className="mt-2 flex items-center">
                        <div className="loading loading-spinner loading-sm mr-2"></div>
                        Testing connection...
                    </div>
                )}

                {details && (
                    <div className="mt-4">
                        <button
                            className="text-sm underline"
                            onClick={() => console.log('Connection details:', details)}
                        >
                            View details in console
                        </button>

                        {status === 'error' && (
                            <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-red-100 rounded">
                                {JSON.stringify(details, null, 2)}
                            </pre>
                        )}

                        {status === 'success' && details.collections && (
                            <div className="mt-2">
                                <h3 className="font-semibold text-sm">Collection Status:</h3>
                                <ul className="mt-1 text-sm">
                                    {Object.entries(details.collections).map(([collectionName, result]: [string, any]) => (
                                        <li key={collectionName} className={result.exists ? 'text-green-700' : 'text-red-700'}>
                                            {collectionName}: {result.exists ? 'Available' : 'Error'}
                                            {!result.exists && result.error && (
                                                <span className="text-xs ml-2">({result.error.message})</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 