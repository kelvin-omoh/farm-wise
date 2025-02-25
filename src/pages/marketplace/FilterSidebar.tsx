import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

interface FilterSidebarProps {
    show: boolean
    onClose: () => void
}

const FilterSidebar = ({ show, onClose }: FilterSidebarProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className="w-64 bg-white p-6 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Filters</h3>
                        <button onClick={onClose} className="btn btn-ghost btn-sm">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                        <h4 className="font-medium mb-2">Price Range</h4>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="input input-bordered w-full"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="mb-6">
                        <h4 className="font-medium mb-2">Categories</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="checkbox" />
                                <span>Vegetables</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="checkbox" />
                                <span>Fruits</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="checkbox" />
                                <span>Grains</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="checkbox" />
                                <span>Livestock</span>
                            </label>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <h4 className="font-medium mb-2">Location</h4>
                        <select className="select select-bordered w-full">
                            <option value="">All Locations</option>
                            <option value="lagos">Lagos</option>
                            <option value="abuja">Abuja</option>
                            <option value="kano">Kano</option>
                        </select>
                    </div>

                    <button className="btn btn-primary w-full">Apply Filters</button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default FilterSidebar 