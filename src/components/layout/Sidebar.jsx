import React from 'react'
import { useApp } from '../../context/AppContext'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Settings,
  ShieldCheck, Eye, Sun, Moon, Zap, RotateCcw, X,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Main',
    links: [
      { page: 'overview',     icon: LayoutDashboard, label: 'Overview'     },
      { page: 'transactions', icon: ArrowLeftRight,  label: 'Transactions' },
      { page: 'reports',      icon: BarChart3,        label: 'Reports'      },
    ],
  },
  {
    label: 'Account',
    links: [
      { page: 'settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  const { state, dispatch } = useApp()
  const { page, role, theme } = state

  function goTo(p) {
    dispatch({ type: 'GOTO', payload: p })
    // Don't close sidebar on desktop nav click — only close on mobile
    if (window.innerWidth < 1024) onClose()
  }

  return (
    <>
      {/* Backdrop — shown when sidebar is open on any screen size */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel — translate based on open state only, NO lg:translate-x-0 override */}
      <aside
        style={{
          position:    'fixed',
          top:         0,
          left:        0,
          height:      '100%',
          width:       '224px',
          zIndex:      50,
          display:     'flex',
          flexDirection: 'column',
          background:  'var(--surface)',
          borderRight: '1px solid var(--border)',
          transform:   open ? 'translateX(0)' : 'translateX(-100%)',
          transition:  'transform 0.3s ease',
        }}
      >
        {/* Logo + close button */}
        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
            padding:       '20px 16px',
            borderBottom:  '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 12,
              background: '#6366f1', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}>
              <Zap className="w-4 h-4 style={{ color: 'var(--text)' }}" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>Zorvyn</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 3 }}>Finance Suite</div>
            </div>
          </div>

          {/* X close button — always visible, always works */}
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none',
              color: 'var(--muted)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
            title="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {NAV_SECTIONS.map(sec => (
            <div key={sec.label}>
              <p style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--muted)',
                padding: '0 12px', marginBottom: 6,
              }}>
                {sec.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sec.links.map(({ page: p, icon: Icon, label }) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`nav-item ${page === p ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" style={{ flexShrink: 0 }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Role switcher */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>
              Role
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['admin', 'viewer'].map(r => (
                <button
                  key={r}
                  onClick={() => dispatch({ type: 'SET_ROLE', payload: r })}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 4, padding: '6px 8px', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                    cursor: 'pointer', transition: 'all 0.15s',
                    ...(role === r
                      ? r === 'admin'
                        ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
                        : { background: 'rgba(74,222,128,0.1)',  border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }
                      : { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted)' }
                    ),
                  }}
                >
                  {r === 'admin' ? <ShieldCheck size={12} /> : <Eye size={12} />}
                  {r}
                </button>
              ))}
            </div>
            {role === 'viewer' && (
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>
                Read-only. Switch to Admin to edit.
              </p>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })}
            className="nav-item"
            style={{ fontSize: 13 }}
          >
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>

          {/* Reset */}
          <button
            onClick={() => { if (confirm('Reset all data to defaults?')) dispatch({ type: 'RESET_DATA' }) }}
            className="nav-item"
            style={{ fontSize: 13, color: '#f87171' }}
          >
            <RotateCcw size={16} /> Reset Data
          </button>
        </div>
      </aside>
    </>
  )
}