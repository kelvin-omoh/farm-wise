import { motion } from 'framer-motion'

interface SwitchProps {
    checked: boolean
    onChange: () => void
    id?: string
    label?: string
}

export const Switch = ({ checked, onChange, id, label }: SwitchProps) => {
    return (
        <div className="flex items-center">
            {label && <span className="mr-2 text-sm text-gray-700">{label}</span>}
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-300'
                    }`}
                onClick={onChange}
            >
                <span className="sr-only">{label || 'Toggle'}</span>
                <motion.span
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30
                    }}
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    )
} 