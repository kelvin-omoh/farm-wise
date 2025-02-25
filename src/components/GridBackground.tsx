import { motion } from 'framer-motion'

const GridBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
            >
                <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-l border-primary/10 last:border-r h-full" />
                    ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-6 md:grid-rows-12">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-t border-primary/10 last:border-b w-full" />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default GridBackground 