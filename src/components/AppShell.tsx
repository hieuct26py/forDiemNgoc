import { useEffect, useRef, useState } from 'react'
import { useHashRoute } from '../router'
import type { View } from '../types'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { InboxView } from '../views/InboxView'
import { TodayView } from '../views/TodayView'
import { OverdueView } from '../views/OverdueView'
import { ProjectView } from '../views/ProjectView'
import { LabelView } from '../views/LabelView'
import { CalendarView } from '../views/CalendarView'
import { AnalyticsView } from '../views/AnalyticsView'
import { NotificationBar } from './NotificationBar'
import { CompletedView } from '../views/CompletedView'
import { HomeView } from '../views/HomeView'
import { useApp } from '../state/AppState'

const MOBILE_BREAKPOINT = 768

const isMobileViewport = () => (typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false)

export function AppShell() {
  const [view, setView] = useHashRoute()
  const { searchQuery } = useApp()
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileViewport())
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(() => !isMobileViewport())
  const lastMobile = useRef<boolean>(isMobileViewport())

  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobileViewport()
      setIsMobile(mobile)
      if (mobile !== lastMobile.current) {
        setSidebarOpen(!mobile)
        lastMobile.current = mobile
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isMobile) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = isSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isSidebarOpen])

  const effectiveView: View = searchQuery
    ? { type: 'search', query: searchQuery }
    : view

  const viewClass = `view-${effectiveView.type}`

  return (
    <div className="app-root">
      <Sidebar current={effectiveView} open={isSidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={setView} isMobile={isMobile} />
      <div className="app-main">
        <Header current={effectiveView} onNavigate={setView} onToggleSidebar={() => setSidebarOpen((s) => !s)} sidebarOpen={isSidebarOpen} />
        <div className="app-content">
          <NotificationBar />
          <div
            key={keyOfView(effectiveView)}
            className={`animate-in ${viewClass}`}
          >
            <SwitchView view={effectiveView} />
          </div>
        </div>
        {isMobile && isSidebarOpen ? <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" /> : null}
        <div className="app-credit">
          <span className="credit-prefix">Made with care by <strong>Hieu CT</strong>, </span>
          <span className="credit-main">dedicated to <strong>Diem Ngoc</strong> <span className="credit-icons" aria-hidden="true">✨ ❤️‍🔥</span> @2025</span>
        </div>
      </div>
    </div>
  )
}

function SwitchView({ view }: { view: View }) {
  switch (view.type) {
    case 'home':
      return <HomeView />
    case 'all':
      return <InboxView />
    case 'today':
      return <TodayView />
    case 'overdue':
      return <OverdueView />
    case 'calendar':
      return <CalendarView />
    case 'analytics':
      return <AnalyticsView />
    case 'project':
      return <ProjectView projectId={view.projectId} />
    case 'label':
      return <LabelView labelId={view.labelId} />
    case 'completed':
      return <CompletedView />
    case 'search':
      return <InboxView title={`Search: ${view.query}`} search={view.query} />
    default:
      return null
  }
}

function keyOfView(view: View): string {
  switch (view.type) {
    case 'project':
      return `project:${view.projectId}`
    case 'label':
      return `label:${view.labelId}`
    case 'search':
      return `search:${view.query}`
    default:
      return view.type
  }
}
