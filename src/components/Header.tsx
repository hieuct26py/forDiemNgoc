import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { AddTaskModal } from './modals/AddTaskModal'
import type { View } from '../types'
import { setHash } from '../router'
import { exportData, importData } from '../storage'
import { useConfirm } from '../ui/Confirm'
import { HomeIcon, CalendarIcon, ActivityIcon } from '../assets/icons'
import { toInputDate } from '../utils/date'

export function Header({ current, onNavigate, onToggleSidebar, sidebarOpen }: { current: View; onNavigate: (v: View) => void; onToggleSidebar: () => void; sidebarOpen: boolean }) {
  const { setSearchQuery } = useApp()
  const [open, setOpen] = useState(false)
  const confirm = useConfirm()

  const nav = (v: View) => { onNavigate(v); setHash(v) }
  const isActive = (t: View['type']) => current.type === t

  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toInputDate(d)
  }, [])

  return (
    <header className="header">
      <div className="left">
        <button className="icon-btn" aria-label="Toggle sidebar" onClick={onToggleSidebar} aria-expanded={sidebarOpen}>
          ☰
        </button>
        <div className="brand">Todue</div>
      </div>
      <div className="center">
        <input className="search-input" placeholder="Search tasks..." onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="right">
        <nav className="top-nav">
          <button className={`nav-link ${isActive('home') ? 'active' : ''}`} onClick={() => nav({ type: 'home' })}><HomeIcon className="nav-ico" /> Home</button>
          <button className={`nav-link ${isActive('calendar') ? 'active' : ''}`} onClick={() => nav({ type: 'calendar' as any })}><CalendarIcon className="nav-ico" /> Calendar</button>
          <button className={`nav-link ${isActive('analytics') ? 'active' : ''}`} onClick={() => nav({ type: 'analytics' as any })}><ActivityIcon className="nav-ico" /> Analytics</button>
        </nav>
        <button className="primary-btn" onClick={() => setOpen(true)}>+ Quick Add</button>
        <div className="push-right">
          <label className="btn file-btn">
            Import
            <input type="file" accept="application/json" onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                const ok = importData(String(reader.result||''))
                if (ok) window.location.reload()
                else confirm({ title: 'Invalid backup file', message: 'Could not import this JSON.', hideCancel: true, confirmText: 'OK' })
              }
              reader.readAsText(file)
            }} />
          </label>
          <button className="btn" onClick={() => {
            const data = exportData()
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'todue-backup.json'
            a.click()
            URL.revokeObjectURL(url)
          }}>Export</button>
        </div>
      </div>

      {open && <AddTaskModal onClose={() => setOpen(false)} initialDueDate={tomorrow} />}
    </header>
  )
}
