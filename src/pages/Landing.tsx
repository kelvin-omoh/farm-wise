import { motion } from 'framer-motion'
import {
    FaRegCheckCircle,
    FaArrowRight,
    FaBars,
    FaTimes,
    FaEnvelope
} from 'react-icons/fa'
import { Section } from '../components/ui/Section'
import { AnimatePresence } from 'framer-motion'
import Preloader from '../components/Preloader'
import { useState } from 'react'
import FeatureCard from '../components/FeatureCard'
import PricingCard from '../components/ui/PricingCard'
import ContactForm from '../components/ui/ContactForm'
import { features, pricingPlans } from '../constants/landingData'
import { images } from '../constants/images'
import GridBackground from '../components/GridBackground'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import logo from "../assets/logo.jpeg"

const Landing = () => {
    const [showPreloader, setShowPreloader] = useState(true)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showWaitlistModal, setShowWaitlistModal] = useState(false)
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
        setShowMobileMenu(false)
    }

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            setSubmitError('Please enter your email address')
            return
        }

        setSubmitting(true)
        setSubmitError('')

        try {
            // Add email to Firebase waitlist collection
            await addDoc(collection(db, 'waitlist'), {
                email,
                timestamp: Timestamp.now()
            })

            setSubmitSuccess(true)
            setEmail('')
        } catch (error) {
            console.error('Error adding to waitlist:', error)
            setSubmitError('Failed to join waitlist. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <AnimatePresence>
                {showPreloader && (
                    <Preloader onComplete={() => setShowPreloader(false)} />
                )}
            </AnimatePresence>
            <div className="min-h-screen bg-base-100">
                {/* Navigation */}
                <motion.nav
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
                >
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center h-20">
                            <motion.div
                                className="flex items-center gap-3"
                                whileHover={{ scale: 1.05 }}
                            >
                                <img
                                    src={logo}
                                    alt="Fermwise Logo"
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="font-ivy text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                    Fermwise
                                </span>
                            </motion.div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-12">
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection('pricing')}
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Pricing
                                </button>
                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Contact
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Replace login/register with Join Waitlist */}
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <button
                                        onClick={() => setShowWaitlistModal(true)}
                                        className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2"
                                    >
                                        Join Waitlist
                                        <FaArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>

                                {/* Mobile Menu Button */}
                                <button
                                    className="md:hidden"
                                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                                >
                                    {showMobileMenu ? (
                                        <FaTimes className="w-6 h-6" />
                                    ) : (
                                        <FaBars className="w-6 h-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {showMobileMenu && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                                    onClick={() => setShowMobileMenu(false)}
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", damping: 20 }}
                                    className="fixed right-0 top-0 bottom-0 h-screen w-[80%] max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                                >
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={logo}
                                                    alt="Fermwise Logo"
                                                    className="w-8 h-8 object-contain"
                                                />
                                                <span className="font-ivy text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                                    Fermwise
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <FaTimes className="w-6 h-6 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col gap-2">
                                        <button
                                            onClick={() => scrollToSection('about')}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/5 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            About
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('features')}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/5 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            Features
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('pricing')}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/5 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            Pricing
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('contact')}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/5 text-gray-700 hover:text-primary transition-colors"
                                        >
                                            Contact
                                        </button>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => {
                                                    setShowMobileMenu(false)
                                                    setShowWaitlistModal(true)
                                                }}
                                                className="w-full px-4 py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                                            >
                                                Join Waitlist
                                                <FaArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </motion.nav>

                {/* Hero Section */}
                <Section className="relative min-h-screen flex items-center pt-20 pb-20">
                    <GridBackground />
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="heading-1 mb-6">
                                Transform Your Farm with Smart Technology
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Empower your farming with IoT sensors, AI insights, and direct market access.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowWaitlistModal(true)}
                                    className="btn btn-primary"
                                >
                                    Join Waitlist
                                </button>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="btn btn-outline"
                                >
                                    Learn More
                                </button>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={images.hero}
                                alt="Smart Farming"
                                className="rounded-2xl shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </Section>

                {/* About Section */}
                <Section id="about" className="bg-base-200">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="heading-2 mb-6">About Fermwise</h2>
                            <p className="text-gray-600 mb-6">
                                Fermwise is revolutionizing farming in Nigeria by bringing smart technology
                                to agricultural practices. Our platform combines IoT sensors, artificial
                                intelligence, and market connectivity to help farmers maximize their yields
                                and profits.
                            </p>
                            <p className="text-gray-600 mb-6">
                                Founded by a team of agricultural experts and technologists, we understand
                                the unique challenges faced by Nigerian farmers and are committed to
                                providing solutions that work for our local context.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-4xl font-bold text-primary mb-2">1000+</h3>
                                    <p className="text-gray-600">Farmers Served</p>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-primary mb-2">30+</h3>
                                    <p className="text-gray-600">States Covered</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src={images.features.community}
                                alt="About Fermwise"
                                className="rounded-2xl shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </Section>

                {/* Features Section */}
                <Section id="features" className="bg-base-100">
                    <div className="text-center mb-12">
                        <h2 className="heading-2 mb-4">Features</h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to manage your farm efficiently
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} index={index} />
                        ))}
                    </div>
                </Section>

                {/* Pricing Section */}
                <Section id="pricing" className="bg-base-200">
                    <div className="text-center mb-12">
                        <h2 className="heading-2 mb-4">Pricing Plans</h2>
                        <p className="text-xl text-gray-600">
                            Choose the perfect plan for your farm
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <PricingCard key={index} {...plan} index={index} />
                        ))}
                    </div>
                </Section>

                {/* Contact Section */}
                <Section id="contact" className="bg-base-100">
                    <div className="text-center mb-12">
                        <h2 className="heading-2 mb-4">Contact Us</h2>
                        <p className="text-xl text-gray-600">
                            Get in touch with our team
                        </p>
                    </div>
                    <ContactForm />
                </Section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-12">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <img
                                        src={logo}
                                        alt="Fermwise Logo"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <span className="font-ivy text-2xl font-bold">Fermwise</span>
                                </div>
                                <p className="text-gray-400">
                                    Transforming Nigerian agriculture with smart technology
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Product</h4>
                                <ul className="space-y-2">
                                    <li><button onClick={() => scrollToSection('features')}>Features</button></li>
                                    <li><button onClick={() => scrollToSection('pricing')}>Pricing</button></li>
                                    <li><button onClick={() => setShowWaitlistModal(true)}>Join Waitlist</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Company</h4>
                                <ul className="space-y-2">
                                    <li><button onClick={() => scrollToSection('about')}>About</button></li>
                                    <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Legal</h4>
                                <ul className="space-y-2">
                                    <li><a href="#">Privacy Policy</a></li>
                                    <li><a href="#">Terms of Service</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-neutral-content/10 mt-12 pt-8 text-center">
                            <p>&copy; 2024 Fermwise. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Waitlist Modal */}
            <AnimatePresence>
                {showWaitlistModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed w-[100vw] h-[100vh] inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowWaitlistModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-[25%] md:left-[30%] left-[0%] -translate-x-[25%] -translate-y-[25%] bg-white rounded-xl p-8 shadow-2xl z-50 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Join Our Waitlist</h3>
                                <button
                                    onClick={() => setShowWaitlistModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {submitSuccess ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                        <FaRegCheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2">Thank You!</h4>
                                    <p className="text-gray-600">
                                        You've been added to our waitlist. We'll notify you when Fermwise launches.
                                    </p>
                                    <button
                                        onClick={() => setShowWaitlistModal(false)}
                                        className="btn btn-primary mt-6"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Be the first to know when Fermwise launches. Enter your email to join our waitlist.
                                    </p>

                                    {submitError && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                            <p className="text-red-700">{submitError}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleWaitlistSubmit}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="input input-bordered w-full pl-10"
                                                    placeholder="you@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-full"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center justify-center">
                                                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                                    Submitting...
                                                </span>
                                            ) : (
                                                'Join Waitlist'
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Landing 