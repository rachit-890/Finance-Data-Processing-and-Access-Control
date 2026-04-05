import { useState } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import { Menu, X } from 'lucide-react'
import './Layout.css'

export default function Layout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div className="loading-center" style={{ height: '100vh', background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="layout-wrapper">
      {/* Mobile Toggle Button */}
      <button className="mobile-nav-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Pass open state down */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewTransaction={() => {
          setSidebarOpen(false)
          navigate('/transactions')
        }} 
      />

      <main className="main-content">
        <Outlet />
      </main>

      {/* Overlay for mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0, 
            background: 'rgba(5,12,22,0.8)', zIndex: 998,
            backdropFilter: 'blur(4px)'
          }} 
        />
      )}
    </div>
  )
}
