import { useEffect, useState, useCallback } from 'react'
import { userAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import { ShieldCheck, ShieldOff, Trash2, UserCog } from 'lucide-react'

export default function UsersPage() {
  const [data, setData]     = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await userAPI.getAll({ page, size: 15 })
      setData(res)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRoleChange = async (id, role) => {
    try {
      await userAPI.updateRole(id, role)
      toast.success('Role updated')
      fetchData()
    } catch { toast.error('Failed to update role') }
  }

  const handleToggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id)
      toast.success('Status toggled')
      fetchData()
    } catch { toast.error('Failed to toggle status') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await userAPI.delete(id)
      toast.success('User deleted')
      fetchData()
    } catch { toast.error('Failed to delete user') }
  }

  return (
    <div style={{ maxWidth:1200 }}>
      <div className="page-header" style={{ marginBottom:32 }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">{data.totalElements} registered users</p>
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="loading-center"><div className="spinner"/></div></td></tr>
              ) : data.content.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34,height:34,borderRadius:'50%',
                        background:'linear-gradient(135deg,var(--accent),#9b6dff)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontWeight:700,fontSize:13,color:'#fff',flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-secondary)',fontSize:13 }}>{u.email}</td>
                  <td>
                    <select
                      className="form-select" style={{ padding:'4px 8px', fontSize:12, width:'auto' }}
                      value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.status==='ACTIVE'?'badge-success':'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ fontSize:12,color:'var(--text-muted)' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize:12,color:'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(u.id)} title="Toggle status">
                        {u.status==='ACTIVE' ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.totalPages > 1 && (
          <div className="pagination" style={{ padding:'16px' }}>
            <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===0}>‹</button>
            {Array.from({length:data.totalPages},(_,i) => (
              <button key={i} className={`page-btn ${i===page?'active':''}`} onClick={() => setPage(i)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page>=data.totalPages-1}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}
