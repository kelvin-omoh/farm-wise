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
}

export const useAuthStore = create<AuthState>((set) => {
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
        set({ user, loading: false })
    })

    return {
        user: null,
        loading: true,
        error: null,
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ loading }),

        login: async (email: string, password: string) => {
            try {
                set({ loading: true, error: null })
                await signInWithEmailAndPassword(auth, email, password)
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
                await firebaseSignOut(auth)
                set({ user: null })
            } catch (error) {
                set({ error: (error as Error).message })
                throw error
            }
        },

        clearError: () => set({ error: null })
    }
}) 