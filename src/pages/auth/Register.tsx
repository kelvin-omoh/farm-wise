import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa'
import GridBackground from '../../components/GridBackground'
import { useAuthStore } from '../../stores/authStore'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { createUserProfile } from '../../services/firebaseService'
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth'
import { auth } from '../../config/firebase'

// Define types
interface RegisterFormValues {
    name: string;
    email: string;
    password: string;
    role: 'farmer' | 'buyer';
    terms: boolean;
}

const registerSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .required('Required'),
    role: Yup.string().oneOf(['farmer', 'buyer']).required('Required'),
    terms: Yup.boolean().oneOf([true], 'You must accept the terms')
})

const Register = () => {
    const navigate = useNavigate()
    const { register, user, clearError } = useAuthStore()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }

        // Clear any previous errors
        clearError()
    }, [user, navigate, clearError])

    const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: any) => {
        try {
            setError(null)
            setIsLoading(true)

            // Register the user with Firebase Auth
            const userCredential = await register(values.email, values.password, values.name)

            // Create a user profile in Firestore
            if (userCredential?.user) {
                await createUserProfile(userCredential.user.uid, {
                    name: values.name,
                    role: values.role,
                    email: values.email,
                    created_at: new Date()
                })
            }

            navigate('/dashboard')
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'Failed to register')
        } finally {
            setIsLoading(false)
            setSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setError(null)
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
            setError(err.message || 'Failed to sign in with Google')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFacebookSignIn = async () => {
        try {
            setError(null)
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
            setError(err.message || 'Failed to sign in with Facebook')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col justify-center p-8 lg:p-12 bg-base-100 relative"
            >
                <GridBackground />
                <div className="max-w-md w-full mx-auto relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">
                            Already have an account? <Link to="/login" className="text-primary hover:text-primary-dark">Sign In</Link>
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6">
                            <div className="flex-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                </svg>
                                <label>{error}</label>
                            </div>
                        </div>
                    )}

                    <Formik
                        initialValues={{
                            name: '',
                            email: '',
                            password: '',
                            role: 'farmer' as const,
                            terms: false
                        }}
                        validationSchema={registerSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form className="space-y-6">
                                <div>
                                    <label className="label">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Field
                                            name="name"
                                            type="text"
                                            placeholder="Enter your name"
                                            className={`input input-bordered w-full pl-10 ${errors.name && touched.name ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage name="name" component="div" className="text-error text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="label">Email</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Field
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className={`input input-bordered w-full pl-10 ${errors.email && touched.email ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage name="email" component="div" className="text-error text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="label">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Field
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            className={`input input-bordered w-full pl-10 ${errors.password && touched.password ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage name="password" component="div" className="text-error text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="label">I am a</label>
                                    <Field
                                        as="select"
                                        name="role"
                                        className="select select-bordered w-full"
                                    >
                                        <option value="farmer">Farmer</option>
                                        <option value="buyer">Buyer</option>
                                    </Field>
                                    <ErrorMessage name="role" component="div" className="text-error text-sm mt-1" />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Field
                                        type="checkbox"
                                        name="terms"
                                        className="checkbox checkbox-sm"
                                    />
                                    <span className="text-sm">
                                        I agree to the <Link to="/terms" className="text-primary hover:text-primary-dark">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:text-primary-dark">Privacy Policy</Link>
                                    </span>
                                </div>
                                <ErrorMessage name="terms" component="div" className="text-error text-sm mt-1" />

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="divider my-8">OR</div>

                    <div className="space-y-4">
                        <button
                            className="btn btn-outline w-full"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <FaGoogle className="mr-2" /> Sign up with Google
                        </button>
                        <button
                            className="btn btn-outline w-full"
                            onClick={handleFacebookSignIn}
                            disabled={isLoading}
                        >
                            <FaFacebook className="mr-2" /> Sign up with Facebook
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex lg:w-1/2 relative bg-primary"
            >
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative z-10 flex flex-col justify-center p-12">
                    <img
                        src="https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070&auto=format&fit=crop"
                        alt="Modern Farm"
                        className="rounded-2xl shadow-2xl mb-8"
                    />
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Join fermwise Today
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