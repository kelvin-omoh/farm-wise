import { ReactNode, useEffect } from 'react'
import { useTestDataStore } from '../stores/testDataStore'

interface TestDataProviderProps {
    children: ReactNode
}

export const TestDataProvider = ({ children }: TestDataProviderProps) => {
    const { useTestData } = useTestDataStore()

    // This effect runs whenever the useTestData value changes
    useEffect(() => {
        // You could add global side effects here when test data mode changes
        console.log('Test data mode:', useTestData ? 'ON' : 'OFF')

        // Optionally dispatch a custom event that components can listen for
        window.dispatchEvent(new CustomEvent('testdatachange', {
            detail: { useTestData }
        }))
    }, [useTestData])

    return <>{children}</>
} 