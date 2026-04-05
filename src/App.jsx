import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar     from './components/layout/Sidebar'
import Topbar      from './components/layout/Topbar'
import Modal       from './components/ui/Modal'
import Overview    from './components/pages/Overview'
import Transactions from './components/pages/Transactions'
import Reports     from './components/pages/Reports'
import Settings    from './components/pages/Settings'

function PageRouter() {
  const { state } = useApp()
  switch (state.page) {
    case 'overview':     return <Overview />
    case 'transactions': return <Transactions />
    case 'reports':      return <Reports />
    case 'settings':     return <Settings />
    default:             return <Overview />
  }
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)  // open by default on desktop

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main — shifts right when sidebar open on desktop */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '224px' : '0' }}
      >
        <Topbar onMenuClick={() => setSidebarOpen(v => !v)} />

        <main className="flex-1 p-5 lg:p-7">
          <PageRouter />
        </main>
      </div>

      {/* Global modal */}
      <Modal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}