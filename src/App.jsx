import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'
import RoutesPage from './pages/RoutesPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import DriverDashboard from './components/DriverDashboard'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function HomeRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (profile?.role === 'driver') return <DriverDashboard />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
      <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <Footer />
      </div>
      </LanguageProvider>
    </AuthProvider>
  )
}

