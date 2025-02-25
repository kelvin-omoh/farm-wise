import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    FaChartLine,
    FaRobot,
    FaGlobe,
    FaMobile,
    FaUsers,
    FaChartBar,
    FaRegCheckCircle,
    FaServer,
    FaShieldAlt,
    FaLeaf,
    FaArrowRight,
    FaBars,
    FaTimes
} from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import { Section } from '../components/ui/Section'
import GridOverlay from '../components/GridOverlay'
import { AnimatePresence } from 'framer-motion'
import Preloader from '../components/Preloader'
import { useState } from 'react'
import FeatureCard from '../components/FeatureCard'
import PricingCard from '../components/ui/PricingCard'
import ContactForm from '../components/ui/ContactForm'
import { features, pricingPlans } from '../constants/landingData'
import { images } from '../constants/images'
import GridBackground from '../components/GridBackground'

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

const Testimonial = ({ image, name, role, quote }: {
    image: string;
    name: string;
    role: string;
    quote: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h4 className="font-semibold text-gray-900">{name}</h4>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>
        <p className="text-gray-600 leading-relaxed">{quote}</p>
    </motion.div>
)

const Landing = () => {
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])
    const [showPreloader, setShowPreloader] = useState(true)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
        setShowMobileMenu(false)
    }

    const testimonials = [
        {
            image: images.testimonials.farmer1,
            name: "John Adebayo",
            role: "Maize Farmer",
            quote: "Since using Farm wise, my crop yield has increased by 40%. The real-time insights are invaluable."
        },
        {
            image: images.testimonials.farmer2,
            name: "Sarah Okafor",
            role: "Livestock Farmer",
            quote: "The livestock monitoring features have helped me prevent diseases and optimize feed management."
        },
        {
            image: images.testimonials.farmer3,
            name: "David Oluwale",
            role: "Mixed Farmer",
            quote: "The marketplace feature has connected me with buyers who pay premium prices for my produce."
        }
    ]

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
                                <FaLeaf className="w-8 h-8 text-primary" />
                                <span className="font-ivy text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                    Farm wise
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
                                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">
                                    Login
                                </Link>
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2"
                                    >
                                        Get Started
                                        <FaArrowRight className="w-4 h-4" />
                                    </Link>
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
                                    className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden"
                                >
                                    <div className="p-4 border-b">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Menu</span>
                                            <button
                                                onClick={() => setShowMobileMenu(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => scrollToSection('about')}
                                            className="text-gray-600 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5"
                                        >
                                            About
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('features')}
                                            className="text-gray-600 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5"
                                        >
                                            Features
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('pricing')}
                                            className="text-gray-600 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5"
                                        >
                                            Pricing
                                        </button>
                                        <button
                                            onClick={() => scrollToSection('contact')}
                                            className="text-gray-600 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-primary/5"
                                        >
                                            Contact
                                        </button>
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
                                <Link to="/register" className="btn btn-primary">
                                    Get Started
                                </Link>
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
                            <h2 className="heading-2 mb-6">About Farm wise</h2>
                            <p className="text-gray-600 mb-6">
                                Farm wise is revolutionizing farming in Nigeria by bringing smart technology
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
                                alt="About Farm wise"
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
                                    <FaLeaf className="w-8 h-8 text-primary" />
                                    <span className="font-ivy text-2xl font-bold">Farm wise</span>
                                </div>
                                <p className="text-gray-400">
                                    Transforming Nigerian agriculture with smart technology
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Product</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/features">Features</Link></li>
                                    <li><Link to="/pricing">Pricing</Link></li>
                                    <li><Link to="/marketplace">Marketplace</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Company</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/about">About</Link></li>
                                    <li><Link to="/blog">Blog</Link></li>
                                    <li><Link to="/careers">Careers</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Legal</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/privacy">Privacy</Link></li>
                                    <li><Link to="/terms">Terms</Link></li>
                                    <li><Link to="/security">Security</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-neutral-content/10 mt-12 pt-8 text-center">
                            <p>&copy; 2024 Farm wise. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default Landing 