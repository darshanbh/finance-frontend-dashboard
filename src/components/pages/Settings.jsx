import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { exportCSV, exportJSON } from '../../utils/helpers'
import {
  Save, Download, Upload, Trash2, Sun, Moon,
  ShieldCheck, Eye, Bell, Database, User,
} from 'lucide-react'

export default function Settings() {
  const { state, dispatch } = useApp()
  const { role, theme, transactions } = state

  // Profile state — controlled inputs, fixes the typing issue
  const [name,     setName]     = useState('Darshan Hoolikatti')
  const [email,    setEmail]    = useState('darshan@example.com')
  const [currency, setCurrency] = useState('INR')
  const [profileSaved, setProfileSaved] = useState(false)

  const [notifs,    setNotifs]    = useState({ email: true, budgetAlert: false, monthlyReport: true })
  const [notifSaved, setNotifSaved] = useState(false)

  function saveProfile() {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  function saveNotifs() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2000)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (Array.isArray(data) && data.length > 0 && data[0].description) {
          data.forEach((tx, i) => { if (!tx.id) tx.id = Date.now() + i })
          dispatch({ type: 'RESET_DATA' })
          data.forEach(tx => dispatch({ type: 'ADD_TX', payload: tx }))
          alert(`Imported ${data.length} transactions.`)
        } else {
          alert('Invalid format. Needs array of transactions.')
        }
      } catch {
        alert('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Section wrapper component
  function Section({ icon: Icon, title, sub, children }) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Icon className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
        </div>
        {children}
      </div>
    )
  }

  function Toggle({ label, sub, checked, onChange }) {
    return (
      <div className="flex items-center justify-between py-3"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>}
        </div>
        <button
          onClick={() => onChange(!checked)}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ml-4"
          style={{ background: checked ? '#6366f1' : 'var(--faint)' }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Profile Settings */}
      <Section icon={User} title="Profile Settings" sub="Your personal information">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted)' }}>
              Name
            </label>
            {/* Fully controlled input — value + onChange = typing works */}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted)' }}>
              Currency
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="field"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <button onClick={saveProfile} className="btn btn-primary self-start">
            <Save className="w-4 h-4" />
            {profileSaved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* Role & Access */}
      <Section icon={ShieldCheck} title="Role & Access" sub="Control what you can do in the app">
        <div className="flex gap-2">
          {[
            { val: 'admin',  Icon: ShieldCheck, label: 'Admin',  desc: 'Full access — can add, edit, delete' },
            { val: 'viewer', Icon: Eye,          label: 'Viewer', desc: 'Read-only — can only view data'      },
          ].map(({ val, Icon, label, desc }) => (
            <button
              key={val}
              onClick={() => dispatch({ type: 'SET_ROLE', payload: val })}
              className="flex-1 flex flex-col items-start gap-1.5 p-4 rounded-xl transition-all duration-150 text-left"
              style={role === val
                ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)' }
                : { background: 'var(--surface2)', border: '1px solid var(--border2)' }
              }
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: role === val ? '#818cf8' : 'var(--muted)' }} />
                <span className="font-semibold text-sm" style={{ color: role === val ? '#a5b4fc' : 'var(--text2)' }}>
                  {label}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Sun} title="Appearance" sub="Theme preferences">
        <div className="flex gap-2">
          {[
            { val: 'dark',  Icon: Moon, label: 'Dark Mode'  },
            { val: 'light', Icon: Sun,  label: 'Light Mode' },
          ].map(({ val, Icon, label }) => (
            <button
              key={val}
              onClick={() => dispatch({ type: 'SET_THEME', payload: val })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
              style={theme === val
                ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }
                : { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--muted)' }
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
          Current theme: <strong style={{ color: 'var(--text)' }}>{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</strong>
        </p>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" sub="Choose what alerts you receive">
        <div>
          <Toggle label="Email Notifications" sub="Receive updates about your financial activity"
            checked={notifs.email} onChange={v => setNotifs(n => ({ ...n, email: v }))} />
          <Toggle label="Budget Alerts" sub="Get notified when you approach budget limits"
            checked={notifs.budgetAlert} onChange={v => setNotifs(n => ({ ...n, budgetAlert: v }))} />
          <Toggle label="Monthly Reports" sub="Automatic monthly financial summary"
            checked={notifs.monthlyReport} onChange={v => setNotifs(n => ({ ...n, monthlyReport: v }))} />
        </div>
        <button onClick={saveNotifs} className="btn btn-primary btn-sm mt-4">
          <Save className="w-3.5 h-3.5" />
          {notifSaved ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </Section>

      {/* Data Management */}
      <Section icon={Database} title="Data Management" sub="Export, import, or reset your data">
        <div className="flex flex-col gap-3">

          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Export All Data</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Download all {transactions.length} transactions
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportCSV(transactions)} className="btn btn-ghost btn-sm">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportJSON(transactions)} className="btn btn-ghost btn-sm">
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Import Data</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Import transactions from a JSON file</p>
            </div>
            <label className="btn btn-ghost btn-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <div>
              <p className="text-sm font-semibold text-red-400">Reset All Data</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Permanently delete all data and restore defaults
              </p>
            </div>
            <button
              onClick={() => { if (confirm('This will delete ALL data. Are you sure?')) dispatch({ type: 'RESET_DATA' }) }}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}