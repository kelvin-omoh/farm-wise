import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionProps {
    children: ReactNode
    className?: string
    dark?: boolean
}

const Section = ({ children, className = '', dark = false }: SectionProps) => {
    return (
        <section className={`relative ${dark ? 'bg-gray-900' : 'bg-white'} ${className}`}>
            <div className={`absolute inset-0 bg-grid-pattern${dark ? '' : '-dark'} bg-grid opacity-${dark ? '5' : '40'}`} />
            <div className="container mx-auto px-4 relative">
                {children}
            </div>
        </section>
    )
}

export default Section 