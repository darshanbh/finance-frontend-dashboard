import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { SEED_TRANSACTIONS } from '../data/mockData'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const init = {
  transactions: load('flo_txns',  SEED_TRANSACTIONS),
  role:         load('flo_role',  'admin'),
  theme:        load('flo_theme', 'dark'),
  page:         'overview',
  modal:   { open: false, editing: null },
  filters: { search: '', type: 'all', category: 'all', sortBy: 'date', sortDir: 'desc' },
}

function reducer(state, action) {
  switch (action.type) {

    case 'GOTO':
      return { ...state, page: action.payload }

    case 'SET_ROLE':
      save('flo_role', action.payload)
      return { ...state, role: action.payload }

    case 'SET_THEME': {
      save('flo_theme', action.payload)
      // Apply dark class to <html> so Tailwind darkMode:'class' works
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { ...state, theme: action.payload }
    }

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } }

    case 'CLEAR_FILTERS':
      return { ...state, filters: { ...init.filters } }

    case 'OPEN_MODAL':
      return { ...state, modal: { open: true, editing: action.payload ?? null } }

    case 'CLOSE_MODAL':
      return { ...state, modal: { open: false, editing: null } }

    case 'ADD_TX': {
      const updated = [{ ...action.payload, id: Date.now() }, ...state.transactions]
      save('flo_txns', updated)
      return { ...state, transactions: updated, modal: { open: false, editing: null } }
    }

    case 'UPDATE_TX': {
      const updated = state.transactions.map(t =>
        t.id === action.payload.id ? action.payload : t
      )
      save('flo_txns', updated)
      return { ...state, transactions: updated, modal: { open: false, editing: null } }
    }

    case 'DELETE_TX': {
      const updated = state.transactions.filter(t => t.id !== action.payload)
      save('flo_txns', updated)
      return { ...state, transactions: updated }
    }

    case 'RESET_DATA':
      save('flo_txns', SEED_TRANSACTIONS)
      return { ...state, transactions: SEED_TRANSACTIONS }

    default:
      return state
  }
}

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)

  // Apply saved theme on first load
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const totalIncome  = state.transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const totalExpense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  const visibleTxns = state.transactions
    .filter(tx => {
      const { search, type, category } = state.filters
      const matchSearch   = !search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase())
      const matchType     = type === 'all'     || tx.type === type
      const matchCategory = category === 'all' || tx.category === category
      return matchSearch && matchType && matchCategory
    })
    .sort((a, b) => {
      const { sortBy, sortDir } = state.filters
      let va = sortBy === 'amount' ? Number(a[sortBy]) : sortBy === 'date' ? new Date(a[sortBy]) : a[sortBy]
      let vb = sortBy === 'amount' ? Number(b[sortBy]) : sortBy === 'date' ? new Date(b[sortBy]) : b[sortBy]
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })

  return (
    <Ctx.Provider value={{ state, dispatch, totalIncome, totalExpense, balance, visibleTxns }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be inside <AppProvider>')
  return ctx
}