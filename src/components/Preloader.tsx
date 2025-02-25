import { motion } from 'framer-motion'

interface PreloaderProps {
    onComplete: () => void
}

const Preloader = ({ onComplete }: PreloaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 2 }}
            onAnimationComplete={onComplete}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-white"
            >
                Farm wise
            </motion.div>
        </motion.div>
    )
}

export default Preloader