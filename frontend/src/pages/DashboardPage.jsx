import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { transactionAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, ArrowRight, Download } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts'
import './Dashboard.css'

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PIE_COLORS = ['#50C878','#E57373','#5BC4F7','#F5A623','#9b6dff','#3da85f']

function handleExport() {
  transactionAPI.exportCsv().then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href    = url
    a.download = 'transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }).catch(() => {})
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast    = useToast()
  const year     = new Date().getFullYear()

  useEffect(() => {
    transactionAPI.dashboard(year)
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const barData = MONTHS.map((m, i) => ({
    month: m,
    Growth:  Number(summary.monthlyIncome?.find(d => d.month === i+1)?.amount  ?? 0),
    Outflow: Number(summary.monthlyExpense?.find(d => d.month === i+1)?.amount ?? 0),
  }))

  const pieData = (summary.topExpenseCategories ?? []).map(c => ({
    name: c.category, value: Number(c.amount)
  }))

  const totalExpense = Number(summary.totalExpense || 0)
  const recentTx     = summary.recentTransactions ?? []

  const tooltipStyle = {
    background: '#1B263B', border: '1px solid rgba(80,200,120,0.15)',
    borderRadius: 8, fontSize: 12, fontFamily: 'Manrope, sans-serif'
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-eyebrow">Executive Summary</div>
          <h1 className="dash-title">The Capital Vault</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="dash-period">Period: {new Date().toLocaleString('default',{month:'short',year:'numeric'})}</div>
          <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export CSV">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total Income</div>
          <div className="kpi-value kpi-value--income">
            ${Number(summary.totalIncome||0).toLocaleString('en-US',{minimumFractionDigits:2})}
          </div>
          <div className="kpi-trend kpi-trend--up">
            <TrendingUp size={12} /> +12.4% <span>vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total Expenses</div>
          <div className="kpi-value kpi-value--expense">
            ${Number(summary.totalExpense||0).toLocaleString('en-US',{minimumFractionDigits:2})}
          </div>
          <div className="kpi-trend kpi-trend--down">
            <TrendingDown size={12} /> -2.1% <span>vs last month</span>
          </div>
        </div>

        <div className="kpi-card kpi-card--highlight">
          <div className="kpi-label">Net Balance</div>
          <div className="kpi-value" style={{ color:'var(--txt-primary)' }}>
            ${Number(summary.netBalance||0).toLocaleString('en-US',{minimumFractionDigits:2})}
          </div>
          <div className="kpi-trend kpi-trend--up">
            <TrendingUp size={12} /> +18.2% <span>net worth growth</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Bar Chart */}
        <div className="card chart-main">
          <div className="chart-header">
            <div>
              <div className="chart-title">Performance Trend</div>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              <div className="chart-legend-item"><span className="legend-dot" style={{ background:'var(--primary)' }} />Growth</div>
              <div className="chart-legend-item"><span className="legend-dot" style={{ background:'var(--secondary)' }} />Outflow</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={3}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:'var(--txt-muted)', fontSize:11, fontFamily:'Manrope' }}
                axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} formatter={v => `$${Number(v).toLocaleString()}`} cursor={{ fill:'rgba(80,200,120,0.06)' }} />
              <Bar dataKey="Growth"  fill="#50C878" radius={[3,3,0,0]} maxBarSize={20} />
              <Bar dataKey="Outflow" fill="#2C3E50" radius={[3,3,0,0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="card chart-side">
          <div className="chart-title" style={{ marginBottom:4 }}>Spending Analysis</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={v => `$${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 3).map((d, i) => (
                  <div key={d.name} className="pie-legend-item">
                    <span className="legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="pie-cat">{d.name}</span>
                    <span className="pie-pct">
                      {totalExpense > 0 ? `${((d.value/totalExpense)*100).toFixed(0)}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding:'30px 0' }}>
              <p>No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity — real transactions from API */}
      <div className="card" style={{ marginTop:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div className="chart-title">Recent Activity</div>
          <Link to="/transactions" style={{ fontSize:12, fontWeight:700, color:'var(--primary)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            View All Records <ArrowRight size={12} />
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state"><h3>No transactions yet</h3></div>
        ) : (
          <div className="table-container" style={{ borderRadius:8, overflow:'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign:'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13 }}>{tx.description || tx.category}</div>
                      <div style={{ fontSize:11, color:'var(--txt-muted)' }}>
                        TXN_{String(tx.id).padStart(6,'0')} · {tx.referenceNumber || '—'}
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:'var(--txt-secondary)' }}>{tx.category}</td>
                    <td style={{ fontSize:12, color:'var(--txt-muted)' }}>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-neutral'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign:'right' }}>
                      <span style={{
                        fontWeight: 700, fontSize: 13,
                        color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US',{minimumFractionDigits:2})}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
