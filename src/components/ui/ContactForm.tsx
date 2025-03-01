import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

const ContactForm = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Add form submission logic here
    }

    return (
        <div className="grid md:grid-cols-2 gap-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label">Name</label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input input-bordered w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Message</label>
                        <textarea
                            className="textarea textarea-bordered w-full h-32"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                        Send Message
                    </button>
                </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <h3 className="text-2xl font-bold">Contact Information</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaEnvelope className="text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium">Email</h4>
                            <p className="text-gray-600">fermwise@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaPhone className="text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium">Phone</h4>
                            <p className="text-gray-600">+234 123 456 7890</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaMapMarkerAlt className="text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium">Address</h4>
                            <p className="text-gray-600">123 Tech Hub, Victoria Island, Lagos</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ContactForm 