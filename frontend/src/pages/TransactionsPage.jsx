import { useEffect, useState, useCallback } from 'react'
import { transactionAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Pencil, Trash2, X, Download, SlidersHorizontal, Building2, Cloud, Landmark, Gem, Package } from 'lucide-react'
import './Transactions.css'

const exportCsv = () => transactionAPI.exportCsv().then(res => {
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
  window.URL.revokeObjectURL(url)
}).catch(() => {})

const CATEGORIES = ['Salary','Freelance','Investment','Architecture Fees',
  'Food','Rent','Utilities','Operations','Transportation','Healthcare',
  'Entertainment','Education','Software','Logistics','Shopping','Other']

const emptyForm = {
  amount: '', type: 'EXPENSE', category: '', description: '',
  date: new Date().toISOString().split('T')[0], status: 'COMPLETED', referenceNumber: ''
}

const CATEGORY_ICONS = {
  'Architecture Fees': Building2, 'Operations': Cloud, 'Internal': Landmark,
  'Investment': Gem, 'Logistics': Package, default: Building2
}

function TxIcon({ category }) {
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--txt-secondary)'
    }}>
      <Icon size={16} />
    </div>
  )
}

export default function TransactionsPage() {
  const [data, setData]     = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [form, setForm]     = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [direction, setDirection] = useState('desc')
  const [typeTab, setTypeTab] = useState('ALL')   // ALL | INCOME | EXPENSE
  const toast = useToast()
  const { isAdmin, isAnalyst } = useAuth()
  const canDelete = isAdmin || isAnalyst

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await transactionAPI.getAll({ page, size: 15, sortBy, direction })
      setData(res)
    } catch { toast.error('Failed to load records') }
    finally { setLoading(false) }
  }, [page, sortBy, direction])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setForm(emptyForm); setEditTx(null); setShowModal(true) }
  const openEdit   = (tx) => {
    setForm({ amount: tx.amount, type: tx.type, category: tx.category,
      description: tx.description || '', date: tx.date, status: tx.status, referenceNumber: tx.referenceNumber || '' })
    setEditTx(tx); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editTx) { await transactionAPI.update(editTx.id, { ...form, amount: parseFloat(form.amount) }); toast.success('Record updated') }
      else        { await transactionAPI.create({ ...form, amount: parseFloat(form.amount) }); toast.success('Record created') }
      setShowModal(false); fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try { await transactionAPI.delete(id); toast.success('Deleted'); fetchData() }
    catch { toast.error('Failed to delete') }
  }

  // Client-side tab filter
  const filtered = typeTab === 'ALL' ? data.content
    : data.content.filter(t => t.type === typeTab)

  return (
    <div className="tx-page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Records</h1>
          <p className="page-sub">Managing the structural integrity of your capital flow.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}><Download size={13} /> Export CSV</button>
          <button className="btn btn-ghost btn-sm"><SlidersHorizontal size={13} /> Advanced Filters</button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={13} /> New Record</button>
        </div>
      </div>

      {/* Tabs + Sort row */}
      <div className="tx-toolbar">
        <div className="tx-tabs">
          {['ALL','INCOME','EXPENSE'].map(t => (
            <button key={t} className={`tx-tab ${typeTab===t?'active':''}`} onClick={() => setTypeTab(t)}>
              {t === 'ALL' ? 'All Transactions' : t === 'INCOME' ? 'Income Only' : 'Outflow Only'}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--txt-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Sort by</span>
          <select className="form-select" style={{ width:'auto', padding:'6px 10px', fontSize:12 }}
            value={`${sortBy}-${direction}`}
            onChange={e => {
              const [s, d] = e.target.value.split('-')
              setSortBy(s); setDirection(d)
            }}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction Details</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px' }}>
                  <div className="spinner" style={{ margin:'auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state"><h3>No records found</h3><p>Create your first transaction above.</p></div>
                </td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <TxIcon category={tx.category} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{tx.description || tx.category}</div>
                        <div style={{ fontSize:11, color:'var(--txt-muted)', marginTop:2 }}>
                          TXN_{String(tx.id).padStart(6,'0')} · {tx.referenceNumber || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${tx.type==='INCOME'?'badge-success':tx.type==='EXPENSE'?'badge-danger':'badge-neutral'}`}>
                      {tx.type === 'INCOME' ? 'INBOUND' : tx.type === 'EXPENSE' ? 'EXPENSE' : 'TRANSFER'}
                    </span>
                  </td>
                  <td style={{ color:'var(--txt-secondary)', fontSize:13 }}>{tx.category}</td>
                  <td>
                    <div style={{ fontSize:13, color:'var(--txt-secondary)' }}>{tx.date}</div>
                    <div style={{ fontSize:11, color:'var(--txt-muted)' }}>{tx.status}</div>
                  </td>
                  <td>
                    <div className={`tx-amount ${tx.type==='INCOME'?'tx-amount--in':'tx-amount--out'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US',{minimumFractionDigits:2})}
                    </div>
                    <div style={{ fontSize:11, color:'var(--txt-muted)', marginTop:2 }}>
                      {tx.status === 'COMPLETED' ? 'Settled' : tx.status}
                    </div>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(tx)} title="Edit"><Pencil size={13} /></button>
                      {canDelete && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(tx.id)} title="Delete"
                          style={{ color:'var(--secondary)' }}><Trash2 size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer row */}
        <div className="tx-footer">
          <span>Showing {filtered.length} of {data.totalElements} results</span>
          {data.totalPages > 1 && (
            <div className="pagination" style={{ margin:0 }}>
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===0}>Previous</button>
              {Array.from({length:Math.min(data.totalPages,5)},(_,i) => (
                <button key={i} className={`page-btn ${i===page?'active':''}`} onClick={() => setPage(i)}>{i+1}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page>=data.totalPages-1}>Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 className="modal-title" style={{ margin:0 }}>{editTx ? 'Edit Record' : 'New Transaction'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Amount *</label>
                  <input className="form-input" type="number" min="0.01" step="0.01" placeholder="0.00"
                    value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} required />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Type *</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm(f=>({...f,date:e.target.value}))} required />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Reference #</label>
                  <input className="form-input" type="text" placeholder="Auto-generated"
                    value={form.referenceNumber} onChange={e => setForm(f=>({...f,referenceNumber:e.target.value}))} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop:14, marginBottom:0 }}>
                <label className="form-label">Description</label>
                <input className="form-input" type="text" placeholder="Optional description"
                  value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" style={{width:15,height:15}} /> : (editTx ? 'Save Changes' : 'Create Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
