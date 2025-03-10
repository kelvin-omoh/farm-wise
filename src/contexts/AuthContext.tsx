import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

interface AuthContextType {
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ loading: true })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { loading, initAuth } = useAuthStore()

    useEffect(() => {
        // Initialize auth state listener and get unsubscribe function
        const unsubscribe = initAuth()

        // Clean up listener on unmount
        return unsubscribe
    }, [initAuth])

    return (
        <AuthContext.Provider value={{ loading }}>
            {children}
        </AuthContext.Provider>
    )
} 