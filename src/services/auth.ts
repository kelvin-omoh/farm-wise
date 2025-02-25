import { supabase } from '../config/supabase'
import { User, UserRole } from '../types'

export const authService = {
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    },

    async register(email: string, password: string, metadata: { name: string; role: UserRole }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) throw error
        return data
    },

    async logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        })
        if (error) throw error
    }
} 