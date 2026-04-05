import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { userAPI } from '../api/services'
import { User, Lock, Shield, Activity, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const [nameForm, setNameForm] = useState({ name: user?.name || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingName, setSavingName] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleNameSave = async (e) => {
    e.preventDefault()
    if (!nameForm.name.trim()) return toast.error('Name is required')
    setSavingName(true)
    try {
      const { data } = await userAPI.updateProfile({ name: nameForm.name })
      // Use the new updateUser helper to sync name without breaking token
      updateUser(data)
      toast.success('Display name updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSavingPw(true)
    try {
      await userAPI.updateProfile({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  const roleColor = user?.role === 'ADMIN' ? 'var(--danger)' : user?.role === 'ANALYST' ? 'var(--accent)' : 'var(--txt-secondary)'

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-sub">Manage your account details and security preferences.</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #9b6dff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--txt-primary)', marginBottom: 4 }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--txt-secondary)', marginBottom: 6 }}>
              {user?.email}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-accent" style={{ background: roleColor, color: '#fff' }}>
                <Shield size={10} style={{ marginRight: 4 }} />{user?.role}
              </span>
              <span className="badge badge-success">
                <Activity size={10} style={{ marginRight: 4 }} />Active
              </span>
            </div>
          </div>
        </div>

        {/* Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { icon: User, label: 'Full Name', val: user?.name || '—' },
            { icon: Lock, label: 'Email', val: user?.email || '—' },
            { icon: Shield, label: 'Role', val: user?.role || '—' },
            { icon: Calendar, label: 'Member Since', val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <Icon size={15} />
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-muted)', fontWeight: 700, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--txt-primary)', fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Name */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(99,120,220,0.12)', border: '1px solid rgba(99,120,220,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
          }}>
            <User size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt-primary)' }}>Update Display Name</div>
            <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>Change how your name appears across the app</div>
          </div>
        </div>

        <form onSubmit={handleNameSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingName} style={{ marginTop: 4 }}>
            {savingName ? <span className="spinner" style={{ width: 15, height: 15 }} /> : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(240,77,106,0.08)', border: '1px solid rgba(240,77,106,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)'
          }}>
            <Lock size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt-primary)' }}>Change Password</div>
            <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>Keep your account secure with a strong password</div>
          </div>
        </div>

        <form onSubmit={handlePasswordSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min 6 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Repeat new password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Password strength hint */}
          {pwForm.newPassword.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: i < Math.min(Math.floor(pwForm.newPassword.length / 3), 4)
                    ? (pwForm.newPassword.length < 6 ? 'var(--danger)' : pwForm.newPassword.length < 10 ? 'var(--warning)' : 'var(--success)')
                    : 'var(--border-subtle)'
                }} />
              ))}
              <span style={{ fontSize: 11, color: 'var(--txt-muted)', marginLeft: 6, whiteSpace: 'nowrap' }}>
                {pwForm.newPassword.length < 6 ? 'Too short' : pwForm.newPassword.length < 10 ? 'Fair' : 'Strong'}
              </span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={savingPw} style={{ marginTop: 16 }}>
            {savingPw ? <span className="spinner" style={{ width: 15, height: 15 }} /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
