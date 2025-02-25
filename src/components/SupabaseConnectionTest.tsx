import { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../config/supabase';

export const SupabaseConnectionTest = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Testing connection...');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Test basic connection
                const result = await testSupabaseConnection();

                if (!result.success) {
                    setStatus('error');
                    setMessage('Failed to connect to Supabase');
                    setDetails(result.error);
                    return;
                }

                // Test auth
                const { data: authData, error: authError } = await supabase.auth.getSession();
                if (authError) {
                    setStatus('error');
                    setMessage('Connected, but auth session issue');
                    setDetails(authError);
                    return;
                }

                // Test tables
                const tables = ['farms', 'devices', 'sensor_readings'];
                const tableResults = {};

                for (const table of tables) {
                    const { data, error } = await supabase.from(table).select('count');
                    tableResults[table] = { exists: !error, error };
                }

                setStatus('success');
                setMessage('Supabase connection successful');
                setDetails({ auth: authData, tables: tableResults });
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
            <h2 className="text-xl font-semibold mb-4">Supabase Connection Status</h2>

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

                        {status === 'success' && details.tables && (
                            <div className="mt-2">
                                <h3 className="font-semibold text-sm">Table Status:</h3>
                                <ul className="mt-1 text-sm">
                                    {Object.entries(details.tables).map(([table, result]: [string, any]) => (
                                        <li key={table} className={result.exists ? 'text-green-700' : 'text-red-700'}>
                                            {table}: {result.exists ? 'Available' : 'Error'}
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