import React from 'react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, CHART_COLORS } from '../../data/mockData'
import { formatCurrency, formatShortDate, buildMonthlyData, buildCategoryData, buildInsights } from '../../utils/helpers'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-4 py-3 shadow-2xl text-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--muted)' }}>{p.name}:</span>
          <span className="font-semibold text-white font-mono">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// Color map for insight card tone
const TONE = {
  good:    { border: 'rgba(74,222,128,0.2)',   bg: 'rgba(74,222,128,0.06)',   text: '#4ade80' },
  bad:     { border: 'rgba(248,113,113,0.2)',  bg: 'rgba(248,113,113,0.06)',  text: '#f87171' },
  warn:    { border: 'rgba(251,191,36,0.2)',   bg: 'rgba(251,191,36,0.06)',   text: '#fbbf24' },
  neutral: { border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.03)', text: '#a1a1c0'  },
}

export default function Reports() {
  const { state } = useApp()
  const { transactions } = state

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="font-bold text-xl text-white mb-1">No data to analyse</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Add transactions first.</p>
      </div>
    )
  }

  const insights    = buildInsights(transactions)
  const monthly     = buildMonthlyData(transactions)
  const catData     = buildCategoryData(transactions)
  const totalCatExp = catData.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Insight cards ─────────────────────────────────────────────────── */}
      <div>
        <p className="page-title mb-4">Key Observations</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins, i) => {
            const t = TONE[ins.tone] || TONE.neutral
            return (
              <div
                key={i}
                className={`rounded-2xl p-5 flex items-start gap-4 s${i + 1}`}
                style={{ background: t.bg, border: `1px solid ${t.border}` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: t.border }}>
                  {ins.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono mb-0.5" style={{ color: 'var(--muted)' }}>{ins.title}</p>
                  <p className="font-bold text-sm capitalize leading-tight" style={{ color: t.text }}>{ins.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{ins.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Savings line chart ─────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="mb-5">
          <p className="page-title">Monthly Savings Trend</p>
          <p className="page-sub">Income, expenses, and net savings over time</p>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={44} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="income"  name="Income"   stroke="#4ade80" strokeWidth={2} dot={{ r: 3, fill: '#4ade80' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="expense" name="Expense"  stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: '#f87171' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="savings" name="Savings"  stroke="#818cf8" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3, fill: '#818cf8' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category breakdown ─────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="mb-5">
          <p className="page-title">Expense by Category</p>
          <p className="page-sub">Where your money goes</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Horizontal bar chart */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={catData.slice(0, 8)}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#a1a1c0', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => (CATEGORIES[v]?.icon || '') + ' ' + (CATEGORIES[v]?.label.split(' ')[0] || v)}
              />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="amount" name="Spent" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {catData.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Progress bar breakdown */}
          <div className="flex flex-col gap-3">
            {catData.slice(0, 7).map((c, i) => {
              const cat = CATEGORIES[c.category]
              const pct = ((c.amount / totalCatExp) * 100).toFixed(1)
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center shrink-0">{cat?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80 font-medium truncate">{cat?.label}</span>
                      <span className="font-mono font-semibold text-white/70 ml-2 shrink-0">{formatCurrency(c.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--faint)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono w-9 text-right shrink-0" style={{ color: 'var(--muted)' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Monthly comparison table ───────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="page-title">Monthly Comparison</p>
          <p className="page-sub">Month-by-month breakdown with MoM change</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th className="th">Month</th>
                <th className="th text-right">Income</th>
                <th className="th text-right">Expenses</th>
                <th className="th text-right">Net Savings</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => {
                const prev    = monthly[i - 1]
                const expDiff = prev ? m.expense - prev.expense : null
                const expPct  = prev?.expense ? Math.abs(Math.round((expDiff / prev.expense) * 100)) : 0
                const net     = m.income - m.expense

                return (
                  <tr key={m.key} className="tr">
                    <td className="td font-semibold text-white">{m.label}</td>
                    <td className="td text-right font-mono font-semibold text-green-400">
                      {formatCurrency(m.income)}
                    </td>
                    <td className="td text-right">
                      <span className="font-mono font-semibold text-red-400">{formatCurrency(m.expense)}</span>
                      {expDiff !== null && (
                        <span className={`ml-2 text-[10px] font-bold ${expDiff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {expDiff > 0 ? '↑' : '↓'}{expPct}%
                        </span>
                      )}
                    </td>
                    <td className={`td text-right font-mono font-semibold ${net >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}