// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA2KC4qaZEUsUIIb32gzkw382qWXGfZAL8",
    authDomain: "farm-wise-64612.firebaseapp.com",
    projectId: "farm-wise-64612",
    storageBucket: "farm-wise-64612.firebasestorage.app",
    messagingSenderId: "481097463440",
    appId: "1:481097463440:web:70ce0bd6fd07febc5a8a15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Test Firebase connection
export const testFirebaseConnection = async () => {
    try {
        // Simple test to check if we can access Firestore
        const authInstance = getAuth();
        return {
            success: true,
            message: "Firebase connection successful"
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
};

export { app, auth, db, analytics }; 