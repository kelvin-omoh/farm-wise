import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGoogle, FaFacebook, FaArrowLeft } from 'react-icons/fa'
import GridBackground from '../../components/GridBackground'
import { useAuthStore } from '../../stores/authStore'
import { createUserProfile } from '../../services/firebaseService'
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth'
import { auth } from '../../config/firebase'

const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>('')
    const [isLoading, setIsLoading] = useState(false)
    const { register, loading, user, clearError } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }

        // Clear any previous errors
        clearError()
    }, [user, navigate, clearError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        // Validate password match
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please try again.')
            return
        }

        // Validate password strength
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.')
            return
        }

        try {
            await register(email, password, name)
            navigate('/dashboard')
        } catch (error: any) {
            // Customize error messages based on Firebase error codes
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('An account with this email already exists. Please sign in instead.')
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('Please enter a valid email address.')
            } else if (error.code === 'auth/weak-password') {
                setErrorMessage('Password is too weak. Please choose a stronger password.')
            } else {
                setErrorMessage('Failed to create account. Please try again later.')
            }
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setErrorMessage(null)
            setIsLoading(true)

            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)

            // Create a user profile if it doesn't exist
            await createUserProfile(result.user.uid, {
                name: result.user.displayName || 'User',
                role: 'farmer', // Default role
                email: result.user.email,
                created_at: new Date()
            })

            navigate('/dashboard')
        } catch (err: any) {
            console.error('Google sign-in error:', err)
            setErrorMessage(err.message || 'Failed to sign in with Google')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFacebookSignIn = async () => {
        try {
            setErrorMessage(null)
            setIsLoading(true)

            const provider = new FacebookAuthProvider()
            const result = await signInWithPopup(auth, provider)

            // Create a user profile if it doesn't exist
            await createUserProfile(result.user.uid, {
                name: result.user.displayName || 'User',
                role: 'farmer', // Default role
                email: result.user.email,
                created_at: new Date()
            })

            navigate('/dashboard')
        } catch (err: any) {
            console.error('Facebook sign-in error:', err)
            setErrorMessage(err.message || 'Failed to sign in with Facebook')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-100 flex">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col">
                {/* Back button */}
                <div className="p-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Home</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Create your account
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Or{' '}
                                <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                                    sign in to your existing account
                                </Link>
                            </p>
                        </div>

                        {/* Custom error message */}
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{errorMessage}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="name" className="sr-only">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || isLoading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    {loading || isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading || loading}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <FaGoogle className="h-5 w-5 text-red-500" />
                                        <span className="sr-only">Sign in with Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFacebookSignIn}
                                        disabled={isLoading || loading}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <FaFacebook className="h-5 w-5 text-blue-600" />
                                        <span className="sr-only">Sign in with Facebook</span>
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-500">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-primary hover:text-primary-dark">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary hover:text-primary-dark">
                                    Privacy Policy
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right side - Image and text (hidden on mobile) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex lg:w-1/2 relative bg-primary"
            >
                <GridBackground />
                <div className="relative z-10 flex flex-col justify-center p-12">
                    <img
                        src="https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070&auto=format&fit=crop"
                        alt="Modern Farm"
                        className="rounded-2xl shadow-2xl mb-8"
                    />
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Join Fermwise Today
                    </h2>
                    <p className="text-white/80 text-lg">
                        Transform your farming experience with smart technology and direct market access.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Register 