import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { UserRole } from '../types'

const auth = getAuth()

export const authService = {
    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return { session: { user: userCredential.user } }
    },

    async register(email: string, password: string, metadata: { name: string; role: UserRole }) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email,
            name: metadata.name,
            role: metadata.role,
            created_at: new Date()
        })

        return { user: userCredential.user }
    },

    async logout() {
        await signOut(auth)
    },

    async resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email, {
            url: `${window.location.origin}/auth/reset-password`
        })
    }
}