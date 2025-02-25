import { useState, useEffect } from 'react'
import { Switch } from './ui/Switch'
import { useTestDataStore } from '../stores/testDataStore'

export const TestDataToggle = () => {
    const { useTestData, toggleTestData } = useTestDataStore()
    const [indexStatus, setIndexStatus] = useState<'loading' | 'error' | 'ready'>('loading')
    const [indexErrors, setIndexErrors] = useState<string[]>([])

    useEffect(() => {
        // Check if we have any index errors in localStorage
        const storedErrors = localStorage.getItem('firestore-index-errors')
        if (storedErrors) {
            try {
                const errors = JSON.parse(storedErrors)
                setIndexErrors(errors)
                setIndexStatus('error')
            } catch (e) {
                console.error('Error parsing stored index errors', e)
                setIndexStatus('ready')
            }
        } else {
            setIndexStatus('ready')
        }

        // Listen for index errors
        const handleError = (e: ErrorEvent) => {
            if (e.error && e.error.message && e.error.message.includes('requires an index')) {
                const indexUrl = e.error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]
                if (indexUrl) {
                    // Store unique index errors
                    setIndexErrors(prev => {
                        const newErrors = [...prev]
                        if (!newErrors.includes(indexUrl)) {
                            newErrors.push(indexUrl)
                            localStorage.setItem('firestore-index-errors', JSON.stringify(newErrors))
                        }
                        return newErrors
                    })
                    setIndexStatus('error')
                }
            }
        }

        window.addEventListener('error', handleError)
        return () => window.removeEventListener('error', handleError)
    }, [])

    const clearIndexErrors = () => {
        localStorage.removeItem('firestore-index-errors')
        setIndexErrors([])
        setIndexStatus('ready')
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
                <Switch
                    checked={useTestData}
                    onChange={toggleTestData}
                    id="test-data-toggle"
                />
                <label htmlFor="test-data-toggle" className="text-sm font-medium">
                    {useTestData ? 'Using Test Data' : 'Using Live Data'}
                </label>

                {indexStatus === 'error' && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Indexes Required
                    </span>
                )}
            </div>

            {indexStatus === 'error' && (
                <div className="bg-yellow-50 p-3 rounded-md text-sm mb-4">
                    <p className="font-medium text-yellow-800 mb-2">
                        Firestore indexes need to be created for live data to work properly.
                    </p>
                    <div className="max-h-32 overflow-y-auto mb-2">
                        <ul className="list-disc pl-5 text-xs text-yellow-700">
                            {indexErrors.map((url, i) => (
                                <li key={i} className="mb-1">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        Create Index {i + 1}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={clearIndexErrors}
                            className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
                        >
                            Clear Errors
                        </button>
                        <p className="text-xs text-gray-500">
                            Using test data until indexes are created
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
} 