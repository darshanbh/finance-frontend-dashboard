// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short',
  })
}

// "2024-06" from "2024-06-15"
function toMonthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// "Jun '24" from "2024-06"
function monthKeyToLabel(key) {
  return new Date(key + '-01').toLocaleDateString('en-IN', {
    month: 'short', year: '2-digit',
  })
}

// ─── Chart data builders ───────────────────────────────────────────────────────

// Groups by month → income, expense, savings per month for the trend chart
export function buildMonthlyData(transactions) {
  const map = {}

  transactions.forEach(tx => {
    const key = toMonthKey(tx.date)
    if (!map[key]) map[key] = { key, income: 0, expense: 0 }
    if (tx.type === 'income') map[key].income  += tx.amount
    else                      map[key].expense += tx.amount
  })

  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => ({
      ...m,
      savings: m.income - m.expense,
      label:   monthKeyToLabel(m.key),
    }))
}

// Groups expenses by category → for pie + bar charts
export function buildCategoryData(transactions) {
  const map = {}

  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      if (!map[tx.category]) map[tx.category] = { category: tx.category, amount: 0, count: 0 }
      map[tx.category].amount += tx.amount
      map[tx.category].count  += 1
    })

  return Object.values(map).sort((a, b) => b.amount - a.amount)
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export function buildInsights(transactions) {
  const insights = []
  const expenses = transactions.filter(t => t.type === 'expense')
  const income   = transactions.filter(t => t.type === 'income')

  if (expenses.length === 0) return insights

  const totalIncome  = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)

  // 1. Top spending category
  const byCategory = {}
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount })
  const [topKey, topAmt] = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  insights.push({
    tone: 'warn', icon: '🔥',
    title: 'Top Spending Category',
    value: topKey,
    detail: `₹${topAmt.toLocaleString('en-IN')} total`,
  })

  // 2. Month-over-month expense change
  const monthly = buildMonthlyData(transactions)
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1]
    const prev = monthly[monthly.length - 2]
    const diff = last.expense - prev.expense
    const pct  = prev.expense > 0 ? Math.abs(Math.round((diff / prev.expense) * 100)) : 0
    insights.push({
      tone: diff > 0 ? 'bad' : 'good', icon: diff > 0 ? '📈' : '📉',
      title: 'Month-over-Month',
      value: diff > 0 ? `+${pct}% expenses` : `${pct}% less spend`,
      detail: `${last.label} vs ${prev.label}`,
    })
  }

  // 3. Savings rate
  if (totalIncome > 0) {
    const rate   = Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    const isGood = rate >= 20
    const isOk   = rate >= 10
    insights.push({
      tone: isGood ? 'good' : isOk ? 'neutral' : 'bad', icon: isGood ? '🎯' : '💡',
      title: 'Savings Rate',
      value: `${rate}%`,
      detail: isGood ? 'Excellent habit!' : isOk ? 'Room to improve' : 'Save more!',
    })
  }

  // 4. Average daily spend
  insights.push({
    tone: 'neutral', icon: '📅',
    title: 'Avg. Daily Expense',
    value: `₹${Math.round(totalExpense / 30).toLocaleString('en-IN')}`,
    detail: 'Estimated over 30 days',
  })

  // 5. Biggest single expense (spread to avoid mutating source array)
  const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0]
  insights.push({
    tone: 'neutral', icon: '💸',
    title: 'Largest Expense',
    value: biggest.description,
    detail: `₹${biggest.amount.toLocaleString('en-IN')} on ${formatShortDate(biggest.date)}`,
  })

  // 6. Freelance income ratio
  const freelanceTotal = income
    .filter(t => t.category === 'freelance')
    .reduce((s, t) => s + t.amount, 0)

  if (freelanceTotal > 0) {
    const pct = Math.round((freelanceTotal / totalIncome) * 100)
    insights.push({
      tone: 'good', icon: '💻',
      title: 'Side Income',
      value: `${pct}% of total income`,
      detail: `₹${freelanceTotal.toLocaleString('en-IN')} from freelance`,
    })
  }

  return insights
}

// ─── Export ────────────────────────────────────────────────────────────────────

export function exportCSV(transactions) {
  const rows = [
    ['Date', 'Description', 'Category', 'Type', 'Amount'],
    ...transactions.map(t => [t.date, `"${t.description}"`, t.category, t.type, t.amount]),
  ]
  download(rows.map(r => r.join(',')).join('\n'), 'text/csv', 'flo-transactions.csv')
}

export function exportJSON(transactions) {
  download(JSON.stringify(transactions, null, 2), 'application/json', 'flo-transactions.json')
}

function download(content, mime, filename) {
  const url  = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  link.click()
  URL.revokeObjectURL(url)
}