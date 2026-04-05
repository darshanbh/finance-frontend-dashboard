import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import {
  Search, X, ChevronUp, ChevronDown,
  Edit2, Trash2, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

const SORT_COLS = [
  { key: 'date',        label: 'Date'        },
  { key: 'description', label: 'Description' },
  { key: 'category',    label: 'Category'    },
  { key: 'amount',      label: 'Amount'      },
]

export default function Transactions() {
  const { state, dispatch, visibleTxns } = useApp()
  const { filters, role } = state

  const [deleteTarget, setDeleteTarget] = useState(null)

  function setFilter(obj) {
    dispatch({ type: 'SET_FILTER', payload: obj })
  }

  function toggleSort(col) {
    if (filters.sortBy === col) {
      setFilter({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilter({ sortBy: col, sortDir: 'desc' })
    }
  }

  function confirmDelete(id) { setDeleteTarget(id) }
  function doDelete() {
    dispatch({ type: 'DELETE_TX', payload: deleteTarget })
    setDeleteTarget(null)
  }

  // Count active filters for "clear" badge
  const activeFilters = [
    filters.search,
    filters.type !== 'all'     ? '1' : '',
    filters.category !== 'all' ? '1' : '',
  ].filter(Boolean).length

  function SortIcon({ col }) {
    if (filters.sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-30" />
    return filters.sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-indigo-400" />
      : <ChevronDown className="w-3 h-3 text-indigo-400" />
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilter({ search: e.target.value })}
              placeholder="Search by name or category..."
              className="field pl-9"
            />
          </div>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={e => setFilter({ type: e.target.value })}
            className="field w-auto min-w-[130px]"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={e => setFilter({ category: e.target.value })}
            className="field w-auto min-w-[150px]"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.icon} {cat.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
              className="btn btn-ghost btn-sm text-red-400 border-red-500/20 hover:bg-red-500/10"
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeFilters})
            </button>
          )}

          <span className="ml-auto text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {visibleTxns.length} results
          </span>
        </div>
      </div>

      {/* ── Transactions table ────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {visibleTxns.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="text-5xl">🔍</div>
            <p className="font-semibold text-white">No transactions found</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Try changing your filters</p>
            <button
              onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
              className="btn btn-ghost btn-sm mt-1"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  {SORT_COLS.map(col => (
                    <th
                      key={col.key}
                      className="th cursor-pointer hover:text-white/60 transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                  <th className="th">Type</th>
                  {role === 'admin' && <th className="th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleTxns.map(tx => {
                  const cat = CATEGORIES[tx.category]
                  return (
                    <tr key={tx.id} className="tr">
                      {/* Date */}
                      <td className="td font-mono text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                        {formatDate(tx.date)}
                      </td>

                      {/* Description */}
                      <td className="td">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg shrink-0">{cat?.icon}</span>
                          <span className="font-medium text-white text-sm">{tx.description}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="td">
                        <span
                          className="badge"
                          style={{ background: cat?.bg, color: cat?.color, borderColor: cat?.color + '30' }}
                        >
                          {cat?.label || tx.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="td">
                        <span className={`font-mono font-semibold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Type badge */}
                      <td className="td">
                        <span className={tx.type === 'income' ? 'badge-up' : 'badge-dn'}>
                          {tx.type === 'income'
                            ? <><ArrowUpRight   className="w-3 h-3" /> Income</>
                            : <><ArrowDownRight className="w-3 h-3" /> Expense</>
                          }
                        </span>
                      </td>

                      {/* Actions — admin only */}
                      {role === 'admin' && (
                        <td className="td text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => dispatch({ type: 'OPEN_MODAL', payload: tx })}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(tx.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Viewer notice */}
      {role === 'viewer' && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-cyan-400"
          style={{ background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.15)' }}>
          <span className="text-xl">👁️</span>
          <span>You are in <strong>Viewer</strong> mode. Switch to Admin in the sidebar to add, edit, or delete transactions.</span>
        </div>
      )}

      {/* ── Delete confirmation dialog ────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center modal-in"
            style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
          >
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold text-lg text-white mb-1">Delete Transaction?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={doDelete} className="btn btn-danger flex-1">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}