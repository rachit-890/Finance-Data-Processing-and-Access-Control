import { useEffect, useState } from 'react'
import { transactionAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = ['#6378dc','#10d9a0','#f5a623','#f04d6a','#5bc4f7','#9b6dff','#ff8c42']

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [year, setYear]       = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    transactionAPI.dashboard(year)
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const barData = MONTHS.map((m, i) => ({
    month: m,
    Income:  Number(summary.monthlyIncome?.find(d => d.month === i+1)?.amount  ?? 0),
    Expense: Number(summary.monthlyExpense?.find(d => d.month === i+1)?.amount ?? 0),
    Net: Number(summary.monthlyIncome?.find(d=>d.month===i+1)?.amount??0) -
         Number(summary.monthlyExpense?.find(d=>d.month===i+1)?.amount??0),
  }))

  const pieData = summary.topExpenseCategories?.map(c => ({
    name: c.category, value: Number(c.amount)
  })) ?? []

  const radarData = pieData.slice(0, 6).map(d => ({ subject: d.name, A: d.value }))

  const tooltipStyle = { background:'#161b2e', border:'1px solid rgba(99,120,220,0.2)', borderRadius:8, fontSize:13 }

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header" style={{ marginBottom:32 }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Financial insights for {year}</p>
        </div>
        <select className="form-select" style={{ width:120 }} value={year} onChange={e=>setYear(+e.target.value)}>
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Income',   val:summary.totalIncome,   color:'var(--success)' },
          { label:'Total Expenses', val:summary.totalExpense,  color:'var(--danger)' },
          { label:'Net Balance',    val:summary.netBalance,    color:'var(--accent-light)' },
        ].map(({label,val,color}) => (
          <div key={label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:800, color }}>
              ${Number(val||0).toLocaleString('en-US',{minimumFractionDigits:2})}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="card" style={{ marginBottom:24 }}>
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Monthly Breakdown — {year}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,220,0.08)" />
            <XAxis dataKey="month" tick={{fill:'#8a93b0',fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#8a93b0',fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
            <Tooltip contentStyle={tooltipStyle} formatter={v=>`$${Number(v).toLocaleString()}`}/>
            <Legend formatter={v=><span style={{color:'#8a93b0',fontSize:12}}>{v}</span>}/>
            <Bar dataKey="Income"  fill="#10d9a0" radius={[4,4,0,0]} />
            <Bar dataKey="Expense" fill="#f04d6a" radius={[4,4,0,0]} />
            <Bar dataKey="Net"     fill="#6378dc" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie + Radar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {pieData.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Expense Category Split</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v=>`$${Number(v).toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {radarData.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Category Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,120,220,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{fill:'#8a93b0',fontSize:12}} />
                <Radar name="Expenses" dataKey="A" stroke="#6378dc" fill="#6378dc" fillOpacity={0.25} />
                <Tooltip contentStyle={tooltipStyle} formatter={v=>`$${Number(v).toLocaleString()}`}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
