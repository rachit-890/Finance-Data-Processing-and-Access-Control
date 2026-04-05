import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar onNewTransaction={() => navigate('/transactions')} />
      <main style={{
        marginLeft: 'var(--sidebar-w)',
        flex: 1,
        overflowY: 'auto',
        padding: '28px 32px',
        background: 'var(--bg-base)'
      }}>
        <Outlet />
      </main>
    </div>
  )
}
