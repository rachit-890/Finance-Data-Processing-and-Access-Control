import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3,
  Users, ScrollText, LogOut, Wallet, Plus, UserCircle
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Records'   },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
  { to: '/audit-logs',   icon: ScrollText,      label: 'Reports',  roles: ['ADMIN','ANALYST'] },
  { to: '/users',        icon: Users,           label: 'Users',    roles: ['ADMIN'] },
]

export default function Sidebar({ onNewTransaction }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const canSee = (roles) => !roles || roles.includes(user?.role)

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon"><Wallet size={18} /></div>
        <div>
          <div className="brand-name">Architect Ledger</div>
          <div className="brand-sub">Finance Platform</div>
        </div>
      </div>

      {/* Vault label */}
      <div className="sidebar-vault">
        <div className="vault-name">The Capital Vault</div>
        <div className="vault-sub">Architectural Precision</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.filter(n => canSee(n.roles)).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Primary CTA */}
      <div className="sidebar-cta">
        <button id="new-transaction-btn" className="sidebar-cta-btn" onClick={onNewTransaction}>
          <Plus size={16} /> New Transaction
        </button>
      </div>

      {/* User footer — clicking avatar/name goes to profile */}
      <div className="sidebar-footer">
        <NavLink to="/profile" className="user-info" style={{ textDecoration:'none', flex:1, cursor:'pointer' }}
          title="My Profile">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </NavLink>
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
