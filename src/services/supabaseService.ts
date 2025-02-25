import { supabase } from '../config/supabase'
import { useAuthStore } from '../stores/authStore'

// Types for our database tables
export interface SensorReading {
    id: string
    device_id: string
    sensor_type: string
    value: number
    unit: string
    timestamp: string
    farm_id: string
}

export interface Farm {
    id: string
    name: string
    location: string
    size: number
    size_unit: string
    owner_id: string
    created_at: string
}

export interface Device {
    id: string
    name: string
    type: string
    status: string
    farm_id: string
    last_reading: string
}

export interface Task {
    id: string
    title: string
    description: string
    status: 'pending' | 'completed' | 'overdue'
    due_date: string
    farm_id: string
    assigned_to: string
    priority: 'low' | 'medium' | 'high'
}

export interface WeatherData {
    id: string
    farm_id: string
    temperature: number
    humidity: number
    wind_speed: number
    precipitation: number
    forecast: string
    timestamp: string
}

export interface MarketListing {
    id: string
    title: string
    description: string
    price: number
    quantity: number
    unit: string
    seller_id: string
    category: string
    status: 'available' | 'sold' | 'reserved'
    created_at: string
    image_url: string
}

// Supabase service for database operations
const supabaseService = {
    // Sensor readings
    async getSensorReadings(farmId: string): Promise<SensorReading[]> {
        const { data, error } = await supabase
            .from('sensor_readings')
            .select('*')
            .eq('farm_id', farmId)
            .order('timestamp', { ascending: false })
            .limit(20)

        if (error) throw error
        return data || []
    },

    async getLatestSensorReadings(farmId: string): Promise<SensorReading[]> {
        const { data, error } = await supabase
            .from('sensor_readings')
            .select('*')
            .eq('farm_id', farmId)
            .order('timestamp', { ascending: false })
            .limit(4)

        if (error) throw error
        return data || []
    },

    // Farms
    async getFarmDetails(farmId: string): Promise<Farm> {
        const { data, error } = await supabase
            .from('farms')
            .select('*')
            .eq('id', farmId)
            .single()

        if (error) throw error
        return data
    },

    async getUserFarms(userId: string): Promise<Farm[]> {
        const { data, error } = await supabase
            .from('farms')
            .select('*')
            .eq('owner_id', userId)

        if (error) throw error
        return data || []
    },

    // Devices
    async getFarmDevices(farmId: string): Promise<Device[]> {
        const { data, error } = await supabase
            .from('devices')
            .select('*')
            .eq('farm_id', farmId)

        if (error) throw error
        return data || []
    },

    async addDevice(device: Omit<Device, 'id'>): Promise<Device> {
        const { data, error } = await supabase
            .from('devices')
            .insert([device])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Tasks
    async getFarmTasks(farmId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('farm_id', farmId)
            .order('due_date', { ascending: true })

        if (error) throw error
        return data || []
    },

    async addTask(task: Omit<Task, 'id'>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .insert([task])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateTaskStatus(taskId: string, status: 'pending' | 'completed' | 'overdue'): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .update({ status })
            .eq('id', taskId)

        if (error) throw error
    },

    // Weather
    async getWeatherData(farmId: string): Promise<WeatherData> {
        const { data, error } = await supabase
            .from('weather_data')
            .select('*')
            .eq('farm_id', farmId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

        if (error) throw error
        return data
    },

    // Marketplace
    async getMarketListings(category?: string, limit = 10): Promise<MarketListing[]> {
        let query = supabase
            .from('market_listings')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
    },

    async addMarketListing(listing: Omit<MarketListing, 'id' | 'created_at'>): Promise<MarketListing> {
        const { data, error } = await supabase
            .from('market_listings')
            .insert([listing])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // User profiles
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },

    async updateUserProfile(userId: string, profile: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(profile)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

export default supabaseService 