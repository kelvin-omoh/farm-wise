import { db } from './firebase';
import { collection, getDocs, limit } from 'firebase/firestore';

// This function is for backward compatibility during migration
export const testSupabaseConnection = async () => {
    return await testFirebaseConnection();
};

// Re-export Firebase for backward compatibility
export const supabase = {
    // Minimal compatibility layer for transitioning code
    from: (tableName: string) => ({
        select: (fields: string) => ({
            eq: async (field: string, value: any) => {
                console.warn('Using deprecated Supabase compatibility layer. Please update to Firebase API.');
                // This is just a stub - implement actual Firebase queries in components
                return { data: null, error: new Error('Not implemented - use Firebase API directly') };
            }
        }),
        insert: async (data: any) => {
            console.warn('Using deprecated Supabase compatibility layer. Please update to Firebase API.');
            return { data: null, error: new Error('Not implemented - use Firebase API directly') };
        }
    }),
    auth: {
        getSession: async () => {
            console.warn('Using deprecated Supabase compatibility layer. Please update to Firebase API.');
            return { data: { session: null } };
        },
        onAuthStateChange: () => {
            console.warn('Using deprecated Supabase compatibility layer. Please update to Firebase API.');
            return { data: { subscription: { unsubscribe: () => { } } } };
        }
    }
};

// Import this from firebase.ts
import { testFirebaseConnection } from './firebase'; 