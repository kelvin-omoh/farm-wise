import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

export function useDataSource<T>(
    fetchRealData: () => Promise<T>,
    testData: T,
    initialState: boolean = true
) {
    const [data, setData] = useState<T>(testData)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [useTestData, setUseTestData] = useState(initialState)
    const { user } = useAuthStore()

    useEffect(() => {
        const fetchData = async () => {
            if (useTestData) {
                setData(testData)
                return
            }

            if (!user) {
                setError('User not authenticated')
                setUseTestData(true)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const realData = await fetchRealData()
                setData(realData)
            } catch (err: any) {
                console.error('Error fetching data:', err)
                setError(err.message || 'Failed to fetch data')
                // Fall back to test data on error
                setData(testData)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [useTestData, user, fetchRealData, testData])

    return {
        data,
        isLoading,
        error,
        useTestData,
        setUseTestData,
        refresh: () => {
            if (!useTestData) {
                setIsLoading(true)
                fetchRealData()
                    .then(setData)
                    .catch(err => {
                        setError(err.message)
                        setData(testData)
                    })
                    .finally(() => setIsLoading(false))
            }
        }
    }
} 