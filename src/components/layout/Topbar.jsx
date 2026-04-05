import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { exportCSV, exportJSON } from '../../utils/helpers'
import { Plus, Download, ChevronDown, FileText, FileJson, Menu } from 'lucide-react'

const PAGE_TITLES = {
  overview:     { title: 'Overview',     sub: 'Your financial summary'       },
  transactions: { title: 'Transactions', sub: 'All income & expense records'  },
  reports:      { title: 'Reports',      sub: 'Insights & analytics'         },
  settings:     { title: 'Settings',     sub: 'Preferences & data management' },
}

export default function Topbar({ onMenuClick }) {
  const { state, dispatch, visibleTxns } = useApp()
  const { page, role } = state
  const [exportOpen, setExportOpen] = useState(false)

  const meta = PAGE_TITLES[page] || PAGE_TITLES.overview

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-5 py-3"
      style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Hamburger — always visible to toggle sidebar open */}
      <button
        onClick={onMenuClick}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0"
        style={{ color: 'var(--muted)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
        title="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-[16px] truncate" style={{ color: 'var(--text)' }}>{meta.title}</h1>
        <p className="text-[11px] font-mono hidden sm:block" style={{ color: 'var(--muted)' }}>{meta.sub}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(v => !v)}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
          </button>

          {exportOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-50 fade-in"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
              onMouseLeave={() => setExportOpen(false)}
            >
              <button
                onClick={() => { exportCSV(visibleTxns); setExportOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{ color: 'var(--text2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileText className="w-4 h-4 text-green-400" /> Export CSV
              </button>
              <button
                onClick={() => { exportJSON(visibleTxns); setExportOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{ color: 'var(--text2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileJson className="w-4 h-4 text-cyan-400" /> Export JSON
              </button>
            </div>
          )}
        </div>

        {/* Add transaction — admin only */}
        {role === 'admin' && (
          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', payload: null })}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  )
}