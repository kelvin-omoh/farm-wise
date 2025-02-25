import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome } from 'react-icons/fa'
import GridBackground from '../components/GridBackground'

const NotFound = () => {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-base-100">
            <GridBackground />
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link
                        to="/"
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <FaHome /> Return Home
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

export default NotFound 