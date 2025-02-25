import { useEffect, useState, useRef } from 'react'
import { useTestDataStore } from '../stores/testDataStore'

export function useTestData<T>(testData: T, liveDataFetcher: () => Promise<T>) {
    const { useTestData } = useTestDataStore()
    const [data, setData] = useState<T>(testData)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const isMounted = useRef(true)
    const hasErrored = useRef(false)

    useEffect(() => {
        isMounted.current = true
        hasErrored.current = false

        // If using test data, just set the test data
        if (useTestData) {
            setData(testData)
            return
        }

        // Otherwise fetch live data
        const fetchData = async () => {
            // Prevent fetching if we've already errored to avoid infinite loops
            if (hasErrored.current) return

            try {
                setLoading(true)
                const result = await liveDataFetcher()
                if (isMounted.current) {
                    setData(result)
                    setError(null)
                }
            } catch (err) {
                console.error('Error fetching data:', err)

                // Mark that we've had an error to prevent infinite loops
                hasErrored.current = true

                // Store index errors for the TestDataToggle component
                storeIndexError(err as Error)

                // Check if it's an index error and fall back to test data
                const error = err as Error
                if (error.message && error.message.includes('requires an index')) {
                    console.warn('Index error detected, falling back to test data')
                    if (isMounted.current) {
                        setData(testData)
                    }
                }

                if (isMounted.current) {
                    setError(err as Error)
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        // Listen for global test data changes
        const handleTestDataChange = () => {
            if (useTestData) {
                setData(testData)
            } else if (!hasErrored.current) {
                fetchData()
            }
        }

        window.addEventListener('testdatachange', handleTestDataChange)

        return () => {
            isMounted.current = false
            window.removeEventListener('testdatachange', handleTestDataChange)
        }
    }, [useTestData, testData])  // Remove liveDataFetcher from dependencies

    return { data, loading, error }
}

// Add this function to store index errors
const storeIndexError = (error: any) => {
    if (error?.message?.includes('requires an index')) {
        // Extract the index creation URL
        const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
        if (indexUrl) {
            // Store unique index errors
            const storedErrors = localStorage.getItem('firestore-index-errors') || '[]';
            try {
                const errors = JSON.parse(storedErrors);
                if (!errors.includes(indexUrl)) {
                    errors.push(indexUrl);
                    localStorage.setItem('firestore-index-errors', JSON.stringify(errors));
                }
            } catch (e) {
                localStorage.setItem('firestore-index-errors', JSON.stringify([indexUrl]));
            }
        }
    }
}; 