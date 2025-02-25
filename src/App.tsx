import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/marketplace/Marketplace'
import DevicesPage from './pages/dashboard/DevicesPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import WeatherPage from './pages/dashboard/WeatherPage'
import TasksPage from './pages/dashboard/TasksPage'
import NetworkingPage from './pages/dashboard/NetworkingPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { TestDataProvider } from './providers/TestDataProvider'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestDataProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="devices" element={<DevicesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="weather" element={<WeatherPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="networking" element={<NetworkingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TestDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
