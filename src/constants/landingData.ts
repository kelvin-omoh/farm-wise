import { FaChartLine, FaRobot, FaGlobe, FaMobile, FaUsers, FaChartBar } from 'react-icons/fa'
import { images } from './images'

export const features = [
    {
        icon: FaChartLine,
        title: "Real-time Monitoring",
        description: "Track soil moisture, nutrient levels, and livestock health with IoT sensors",
        color: "primary" as const,
        image: images.features.monitoring
    },
    {
        icon: FaRobot,
        title: "AI-Powered Insights",
        description: "Get intelligent recommendations for optimal farming practices",
        color: "primary" as const,
        image: images.features.ai
    },
    {
        icon: FaGlobe,
        title: "Market Access",
        description: "Connect directly with buyers and get the best prices for your produce",
        color: "primary" as const,
        image: images.features.market
    },
    {
        icon: FaMobile,
        title: "Mobile Access",
        description: "Manage your farm from anywhere with our mobile app",
        color: "primary" as const,
        image: images.features.mobile
    },
    {
        icon: FaUsers,
        title: "Community",
        description: "Connect with other farmers and share knowledge",
        color: "primary" as const,
        image: images.features.community
    },
    {
        icon: FaChartBar,
        title: "Analytics",
        description: "Make data-driven decisions with advanced analytics",
        color: "primary" as const,
        image: images.features.analytics
    }
]

export const pricingPlans = [
    {
        title: "Basic",
        price: 0,
        period: "free",
        features: [
            "Real-time monitoring",
            "Basic analytics",
            "Networking",
            "Marketplace",
        ]
    },
    {
        title: "Pro",
        price: 15000,
        period: "month",
        recommended: true,
        features: [
            "All Basic features",
            "AI-powered insights",
            "Advanced analytics",
            "Job posting ",
            "Market access",
            "Expert consultation"
        ]
    },
    {
        title: "Enterprise",
        price: 50000,
        period: "month",
        features: [
            "All Pro features",
            "Custom integrations",
            "Custom analytics",
            "Unlimited devices",
            "Unlimited consultation"
        ]
    }
] 