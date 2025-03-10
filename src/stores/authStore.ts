import { create } from 'zustand'
import { auth } from '../config/firebase'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth'

// Extend the Firebase User type with our custom properties
interface User extends FirebaseUser {
    farm_id?: string;
}

interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<any>
    logout: () => Promise<void>
    clearError: () => void
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
    initAuth: () => () => void
}

export const useAuthStore = create<AuthState>((set) => {
    return {
        user: null,
        loading: true,
        error: null,
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ loading }),

        // Initialize auth state listener
        initAuth: () => {
            // Set up auth state listener and return unsubscribe function
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                set({ user: user as User | null, loading: false })
            })
            return unsubscribe
        },

        login: async (email: string, password: string) => {
            try {
                set({ loading: true, error: null })
                await signInWithEmailAndPassword(auth, email, password)
                // Loading will be set to false by the onAuthStateChanged listener
            } catch (error) {
                set({ error: (error as Error).message, loading: false })
                throw error
            }
        },

        register: async (email: string, password: string, name: string) => {
            try {
                set({ loading: true, error: null })
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)

                // Update user profile with name
                await updateProfile(userCredential.user, {
                    displayName: name
                })

                return userCredential; // Return the user credential
            } catch (error) {
                set({ error: (error as Error).message, loading: false })
                throw error
            }
        },

        logout: async () => {
            try {
                set({ loading: true })
                await firebaseSignOut(auth)
                // User will be set to null by the onAuthStateChanged listener
            } catch (error) {
                set({ error: (error as Error).message, loading: false })
                throw error
            }
        },

        clearError: () => set({ error: null })
    }
}) 