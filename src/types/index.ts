export type UserRole = 'farmer' | 'buyer' | 'admin'

export interface User {
    id: string
    email: string
    role: UserRole
    name: string
    created_at: string
}

export interface Farm {
    id: string
    user_id: string
    name: string
    location: string
    size: number
    crop_types: string[]
    livestock: string[]
    created_at: string
}

export interface IoTDevice {
    id: string
    farm_id: string
    device_id: string
    type: 'soil_sensor' | 'weather_sensor' | 'livestock_tracker'
    status: 'active' | 'inactive'
    created_at: string
}

export interface AuthFormValues {
    email: string
    password: string
}

export interface RegisterFormValues extends AuthFormValues {
    name: string
    role: UserRole
    terms: boolean
}

// Add more types as needed 