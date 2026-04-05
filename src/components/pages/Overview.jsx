import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, CHART_COLORS } from '../../data/mockData'
import { formatCurrency, formatDate, buildMonthlyData, buildCategoryData } from '../../utils/helpers'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownRight, PiggyBank,
} from 'lucide-react'

// ─── Tooltip components for recharts ──────────────────────────────────────────
// Tooltip
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-4 py-3 shadow-2xl text-sm"
      style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>
      
      <p className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{label}</p>

      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--muted)' }}>{p.name}:</span>
          <span className="font-semibold font-mono" style={{ color: 'var(--text)' }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const cat = CATEGORIES[payload[0].name]

  return (
    <div className="rounded-xl border px-4 py-3 shadow-2xl text-sm"
      style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>
      
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{cat?.icon}</span>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {cat?.label || payload[0].name}
        </span>
      </div>

      <div className="font-mono font-bold text-indigo-300">
        {formatCurrency(payload[0].value)}
      </div>

      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
        {payload[0].payload.pct}% of spend
      </div>
    </div>
  )
}

// Stat Card
function StatCard({ icon: Icon, accentFrom, accentTo, iconColor, iconBg, label, value, tag, tagUp, delay }) {
  return (
    <div className={`stat-card p-5 s${delay}`}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo ?? accentFrom})` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center"
          style={{ background: iconBg }}>
          <Icon style={{ color: iconColor }} />
        </div>

        {tag && (
          <span className={`badge ${tagUp ? 'badge-up' : 'badge-dn'}`}>
            {tag}
          </span>
        )}
      </div>

      <div className="font-bold text-2xl" style={{ color: 'var(--text)' }}>
        {value}
      </div>

      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
    </div>
  )
}

// ─── Overview page ─────────────────────────────────────────────────────────────
export default function Overview() {
  const { state, dispatch, totalIncome, totalExpense, balance } = useApp()
  const { transactions } = state

  const [chartType, setChartType] = useState('area')

  const monthly  = buildMonthlyData(transactions)
  const catData  = buildCategoryData(transactions)
  const totalCat = catData.reduce((s, c) => s + c.amount, 0)

  const pieData  = catData.slice(0, 7).map(c => ({
    ...c,
    pct: ((c.amount / totalCat) * 100).toFixed(1),
  }))

  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    : 0

  // Month-over-month expense delta badge
  const last2   = monthly.slice(-2)
  const expDiff = last2.length === 2 ? last2[1].expense - last2[0].expense : 0
  const expPct  = last2[0]?.expense ? Math.abs(Math.round((expDiff / last2[0].expense) * 100)) : 0

  // 5 most recent transactions
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard delay={1} icon={Wallet}
          accentFrom="#6366f1" iconColor="#818cf8" iconBg="rgba(129,140,248,0.12)"
          label="Total Balance" value={formatCurrency(balance)}
          tag={`${savingsRate}% saved`} tagUp={savingsRate >= 0}
        />
        <StatCard delay={2} icon={ArrowUpRight}
          accentFrom="#4ade80" iconColor="#4ade80" iconBg="rgba(74,222,128,0.10)"
          label={`Total Income · ${transactions.filter(t => t.type === 'income').length} txns`}
          value={formatCurrency(totalIncome)} tag="+income" tagUp={true}
        />
        <StatCard delay={3} icon={ArrowDownRight}
          accentFrom="#f87171" iconColor="#f87171" iconBg="rgba(248,113,113,0.10)"
          label={`Total Expenses · ${transactions.filter(t => t.type === 'expense').length} txns`}
          value={formatCurrency(totalExpense)}
          tag={expDiff > 0 ? `+${expPct}% MoM` : `${expPct}% MoM`}
          tagUp={expDiff <= 0}
        />
        <StatCard delay={4} icon={PiggyBank}
          accentFrom="#22d3ee" iconColor="#22d3ee" iconBg="rgba(34,211,238,0.10)"
          label="Net Savings" value={formatCurrency(totalIncome - totalExpense)}
          tag={`${savingsRate}%`} tagUp={savingsRate >= 20}
        />
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Balance Trend */}
        <div className="chart-card p-5 lg:col-span-3 s5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="page-title">Balance Trend</p>
              <p className="page-sub">Monthly income vs expenses</p>
            </div>
            <div className="flex gap-1 rounded-lg p-1 border" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
              {[['area', 'Area'], ['bar', 'Bar']].map(([v, lbl]) => (
                <button key={v} onClick={() => setChartType(v)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                    ${chartType === v ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            {chartType === 'area' ? (
              <AreaChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={44} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} />
                <Area type="monotone" dataKey="income"  name="Income"  stroke="#4ade80" strokeWidth={2} fill="url(#gInc)" dot={{ r: 3, fill: '#4ade80', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f87171" strokeWidth={2} fill="url(#gExp)" dot={{ r: 3, fill: '#f87171', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            ) : (
              <BarChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={44} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} />
                <Bar dataKey="income"  name="Income"  fill="#4ade80" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Spending by Category — Pie */}
        <div className="chart-card p-5 lg:col-span-2 s6">
          <div className="mb-4">
            <p className="page-title">Spending by Category</p>
            <p className="page-sub">Top expense categories</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={70}
                paddingAngle={3} dataKey="amount" nameKey="category">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<PieTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-3">
            {pieData.slice(0, 5).map((c, i) => {
              const cat = CATEGORIES[c.category]
              return (
                <div key={c.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i] }} />
                    <span style={{ color: 'var(--muted)' }}>{cat?.label || c.category}</span>
                  </div>
                  <span className="font-mono font-semibold style={{ color: 'var(--text)' }}/70">{c.pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ───────────────────────────────────────────── */}
      <div className="chart-card overflow-hidden s7">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="page-title">Recent Transactions</p>
            <p className="page-sub">Last 5 entries</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'GOTO', payload: 'transactions' })}
            className="btn btn-ghost btn-sm"
          >
            View All
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-center">
            <div className="text-4xl">📭</div>
            <p className="font-semibold style={{ color: 'var(--text)' }} text-sm">No transactions yet</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Add one to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Description</th>
                  <th className="th">Category</th>
                  <th className="th">Type</th>
                  <th className="th text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(tx => {
                  const cat = CATEGORIES[tx.category]
                  return (
                    <tr key={tx.id} className="tr">
                      <td className="td font-mono text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{cat?.icon}</span>
                          <span className="font-medium style={{ color: 'var(--text)' }}">{tx.description}</span>
                        </div>
                      </td>
                      <td className="td">
                        <span className="badge"
                          style={{ background: cat?.bg, color: cat?.color, borderColor: cat?.color + '30' }}>
                          {cat?.label || tx.category}
                        </span>
                      </td>
                      <td className="td">
                        <span className={tx.type === 'income' ? 'badge-up' : 'badge-dn'}>
                          {tx.type === 'income'
                            ? <><ArrowUpRight   className="w-3 h-3" /> Income</>
                            : <><ArrowDownRight className="w-3 h-3" /> Expense</>
                          }
                        </span>
                      </td>
                      <td className={`td text-right font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}