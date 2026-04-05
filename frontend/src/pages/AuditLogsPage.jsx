import { useEffect, useState, useCallback } from 'react'
import { auditAPI } from '../api/services'
import { useToast } from '../context/ToastContext'

export default function AuditLogsPage() {
  const [data, setData]     = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [page, setPage]     = useState(0)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = filter
        ? await auditAPI.getByEntity(filter, { page, size: 20 })
        : await auditAPI.getAll({ page, size: 20 })
      setData(res)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }, [page, filter])

  useEffect(() => { fetchData() }, [fetchData])

  const actionColor = (action) => {
    if (action.includes('DELETED'))  return 'badge-danger'
    if (action.includes('CREATED'))  return 'badge-success'
    if (action.includes('UPDATED'))  return 'badge-warning'
    if (action.includes('LOGIN'))    return 'badge-info'
    return 'badge-accent'
  }

  return (
    <div style={{ maxWidth:1200 }}>
      <div className="page-header" style={{ marginBottom:32 }}>
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-sub">{data.totalElements} log entries</p>
        </div>
        <select className="form-select" style={{ width:180 }} value={filter} onChange={e=>{setFilter(e.target.value);setPage(0)}}>
          <option value="">All entities</option>
          <option value="User">User</option>
          <option value="Transaction">Transaction</option>
        </select>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="loading-center"><div className="spinner"/></div></td></tr>
              ) : data.content.map(log => (
                <tr key={log.id}>
                  <td><span className={`badge ${actionColor(log.action)}`}>{log.action}</span></td>
                  <td style={{ fontSize:13,color:'var(--text-secondary)' }}>
                    {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                  </td>
                  <td style={{ fontSize:13, maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-secondary)' }}>
                    {log.details || '—'}
                  </td>
                  <td style={{ fontSize:13 }}>{log.userName || '—'}</td>
                  <td style={{ fontSize:12,color:'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                  <td style={{ fontSize:12,color:'var(--text-muted)' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
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
