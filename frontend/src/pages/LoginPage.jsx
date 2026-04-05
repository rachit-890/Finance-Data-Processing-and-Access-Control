import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../api/services'
import { Wallet, Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import './Auth.css'

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      toast.success(`Welcome back, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">

        {/* Brand — centered, icon on top */}
        <div className="auth-brand">
          <div className="auth-brand-icon"><Wallet size={24} /></div>
          <div className="auth-title">Architect Ledger</div>
          <div className="auth-sub">Secure Entry Vault</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Professional Email</label>
            <div className="input-icon-wrap">
              <span className="input-icon"><Mail size={14} /></span>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="name@vault.sovereign"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Security Phrase</label>
            <div className="input-icon-wrap" style={{ position:'relative' }}>
              <span className="input-icon"><Lock size={14} /></span>
              <input
                id="login-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="············"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 44 }}
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
            style={{ justifyContent:'center', marginTop:16, padding:'13px', fontSize:14, letterSpacing:'0.04em' }}
          >
            {loading
              ? <span className="spinner" style={{ width:18, height:18 }} />
              : <><ShieldCheck size={16} /> Authorize Access</>
            }
          </button>
        </form>

        {/* Security footer */}
        <div className="auth-security">
          <div className="auth-security-item"><ShieldCheck size={11} /> AES-256</div>
          <div className="auth-security-item" style={{ color:'var(--border-hover)' }}>|</div>
          <div className="auth-security-item"><Wallet size={11} /> Architect Log</div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
