import { useState, useEffect } from 'react'
import { FaCheck, FaHome } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'

export const FarmProfileSetup = () => {
    const [isSettingUp, setIsSettingUp] = useState(false)
    const [farmName, setFarmName] = useState('')
    const [location, setLocation] = useState('')
    const [size, setSize] = useState('')
    const [cropTypes, setCropTypes] = useState<string[]>([])
    const [livestock, setLivestock] = useState<string[]>([])
    const [setupSuccess, setSetupSuccess] = useState(false)
    const [error, setError] = useState('')

    const { user } = useAuthStore()

    useEffect(() => {
        if (user) {
            console.log("Setting up farm for user:", user.email);
        }
    }, [user]);

    const cropOptions = [
        'Maize', 'Rice', 'Cassava', 'Yam', 'Tomatoes',
        'Peppers', 'Cocoa', 'Coffee', 'Plantain', 'Beans'
    ]

    const livestockOptions = [
        'Cattle', 'Goats', 'Sheep', 'Chickens', 'Pigs',
        'Fish', 'Bees', 'Rabbits', 'Ducks', 'Guinea Fowl'
    ]

    const handleStartSetup = () => {
        setIsSettingUp(true)
        setFarmName('')
        setLocation('')
        setSize('')
        setCropTypes([])
        setLivestock([])
        setError('')
        setSetupSuccess(false)
    }

    const handleCancel = () => {
        setIsSettingUp(false)
    }

    const toggleCropType = (crop: string) => {
        if (cropTypes.includes(crop)) {
            setCropTypes(cropTypes.filter(c => c !== crop))
        } else {
            setCropTypes([...cropTypes, crop])
        }
    }

    const toggleLivestock = (animal: string) => {
        if (livestock.includes(animal)) {
            setLivestock(livestock.filter(a => a !== animal))
        } else {
            setLivestock([...livestock, animal])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!farmName) {
            setError('Farm name is required')
            return
        }

        if (!location) {
            setError('Location is required')
            return
        }

        if (!size) {
            setError('Farm size is required')
            return
        }

        if (cropTypes.length === 0 && livestock.length === 0) {
            setError('Please select at least one crop type or livestock')
            return
        }

        // Simulate API call to save farm profile
        setTimeout(() => {
            setSetupSuccess(true)
            // Reset form after 2 seconds
            setTimeout(() => {
                setIsSettingUp(false)
            }, 2000)
        }, 1000)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaHome className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Farm Profile Setup</h2>
                </div>
                {!isSettingUp && !setupSuccess && (
                    <button
                        onClick={handleStartSetup}
                        className="btn btn-primary btn-sm"
                    >
                        Setup Farm Profile
                    </button>
                )}
            </div>

            {isSettingUp && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Farm Name</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={farmName}
                                    onChange={(e) => setFarmName(e.target.value)}
                                    placeholder="e.g. Green Acres Farm"
                                />
                            </div>

                            <div>
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Lagos, Nigeria"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Farm Size (hectares)</label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="e.g. 5"
                                min="0.1"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="label">Crop Types</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {cropOptions.map(crop => (
                                    <label key={crop} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={cropTypes.includes(crop)}
                                            onChange={() => toggleCropType(crop)}
                                        />
                                        <span>{crop}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="label">Livestock</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {livestockOptions.map(animal => (
                                    <label key={animal} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={livestock.includes(animal)}
                                            onChange={() => toggleLivestock(animal)}
                                        />
                                        <span>{animal}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="text-error text-sm">{error}</div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save Farm Profile
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {setupSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-4 rounded-lg text-center"
                >
                    <FaCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-green-800">Farm Profile Saved Successfully</h3>
                    <p className="text-green-600">Your farm profile has been set up</p>
                </motion.div>
            )}

            {!isSettingUp && !setupSuccess && (
                <div className="text-center py-8 text-gray-500">
                    <p>Set up your farm profile to get personalized insights and recommendations</p>
                </div>
            )}
        </div>
    )
} 