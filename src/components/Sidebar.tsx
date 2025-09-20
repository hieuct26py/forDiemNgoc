import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../state/AppState'
import { setHash } from '../router'
import logo from '../assets/todue-logo.png'
import { HomeIcon, ListIcon, SunIcon, ArrowUpRightIcon, CheckCircleIcon, CloudIcon, CloudRainIcon, SnowIcon, StormIcon, PlusIcon, PencilIcon, InstagramIcon } from '../assets/icons'
import { useConfirm } from '../ui/Confirm'
import type { View } from '../types'

export function Sidebar({ current, open, onClose, onNavigate, isMobile }: { current: View; open: boolean; onClose: () => void; onNavigate: (v: View) => void; isMobile: boolean }) {
  const { projects, labels, addProject, addLabel, deleteProject, deleteLabel, updateProject, updateLabel } = useApp()
  const confirm = useConfirm()
  const [newProject, setNewProject] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [addingProject, setAddingProject] = useState(false)
  const [addingLabel, setAddingLabel] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editLabelName, setEditLabelName] = useState('')
  const navRef = useRef<HTMLDivElement>(null)
  const homeBtn = useRef<HTMLButtonElement>(null)
  const allBtn = useRef<HTMLButtonElement>(null)
  const todayBtn = useRef<HTMLButtonElement>(null)
  const upcomingBtn = useRef<HTMLButtonElement>(null)
  const completedBtn = useRef<HTMLButtonElement>(null)
  const [indicatorTop, setIndicatorTop] = useState(0)
  const [indicatorH, setIndicatorH] = useState(0)
  const [now, setNow] = useState<string>(() => new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
  const [weather, setWeather] = useState<{ temp?: number; code?: number } | null>(null)
  const [weatherDL, setWeatherDL] = useState<{ temp?: number; code?: number } | null>(null)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    // Fetch Hanoi weather from open-meteo (no API key needed)
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current=temperature_2m,weather_code&timezone=Asia%2FBangkok'
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const temp = d?.current?.temperature_2m
        const code = d?.current?.weather_code
        if (typeof temp === 'number') setWeather({ temp, code })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Fetch Đắk Lắk (Buôn Ma Thuột) weather
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=12.666&longitude=108.05&current=temperature_2m,weather_code&timezone=Asia%2FBangkok'
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const temp = d?.current?.temperature_2m
        const code = d?.current?.weather_code
        if (typeof temp === 'number') setWeatherDL({ temp, code })
      })
      .catch(() => {})
  }, [])

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => a.name.localeCompare(b.name)), [projects])
  const sortedLabels = useMemo(() => [...labels].sort((a, b) => a.name.localeCompare(b.name)), [labels])

  const go = (v: View) => {
    onNavigate(v)
    setHash(v)
    if (isMobile && open) onClose()
  }

  const isActiveRoot = (t: View['type']) => current.type === t

  useEffect(() => {
    const measure = () => {
      const cont = navRef.current
      if (!cont) return
      let el: HTMLButtonElement | null = null
      if (current.type === 'home') el = homeBtn.current
      else if (current.type === 'all') el = allBtn.current
      else if (current.type === 'today') el = todayBtn.current
      else if (current.type === 'overdue') el = upcomingBtn.current
      else if (current.type === 'completed') el = completedBtn.current
      // Only show sliding highlight for root nav items; hide for project/label views
      if (!el) {
        setIndicatorH(0)
        return
      }
      const cr = cont.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      setIndicatorTop(er.top - cr.top)
      setIndicatorH(er.height)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [current])

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'}`}>
      <div className="sidebar-brand">
        <div className="brand-top">
          <div className="brand-left">
            <img src={logo} alt="Todue" className="brand-logo" />
            <div className="brand-title">
              <div className="brand-xl">Todue</div>
              <div className="brand-version">
                <InstagramIcon className="brand-version-icon" aria-hidden="true" />
                <span>eoybydnl_ ver.</span>
              </div>
            </div>
          </div>
          <div className="brand-clock">{now}</div>
        </div>
        <div className="brand-weather">
          <div className="bw-item">
            {renderWeatherIcon(weather?.code)}
            <span className="bw-city">Hà Nội</span>
            <span className="bw-cond">{labelForCode(weather?.code)}</span>
            <span className="bw-temp">{typeof weather?.temp === 'number' ? Math.round(weather!.temp) + '°C' : '--'}</span>
          </div>
          <div className="bw-item">
            {renderWeatherIcon(weatherDL?.code)}
            <span className="bw-city">Đắk Lắk</span>
            <span className="bw-cond">{labelForCode(weatherDL?.code)}</span>
            <span className="bw-temp">{typeof weatherDL?.temp === 'number' ? Math.round(weatherDL!.temp) + '°C' : '--'}</span>
          </div>
        </div>
      </div>
      <div className="sidebar-section nav-stack" ref={navRef}>
        <div className="active-indicator" style={{ top: indicatorTop, height: indicatorH }} />
        <button ref={homeBtn} className={`nav-item ${isActiveRoot('home') ? 'active' : ''}`} onClick={() => go({ type: 'home' })}><HomeIcon className="nav-ico" /><span>Home</span></button>
        <button ref={todayBtn} className={`nav-item ${isActiveRoot('today') ? 'active' : ''}`} onClick={() => go({ type: 'today' })}><SunIcon className="nav-ico" /><span>Today</span></button>
        <button ref={allBtn} className={`nav-item ${isActiveRoot('all') ? 'active' : ''}`} onClick={() => go({ type: 'all' })}><ListIcon className="nav-ico" /><span>All Tasks</span></button>
        <button ref={upcomingBtn} className={`nav-item ${isActiveRoot('overdue') ? 'active' : ''}`} onClick={() => go({ type: 'overdue' })}><ArrowUpRightIcon className="nav-ico" /><span>Overdue</span></button>
        <button ref={completedBtn} className={`nav-item ${isActiveRoot('completed') ? 'active' : ''}`} onClick={() => go({ type: 'completed' })}><CheckCircleIcon className="nav-ico" /><span>Completed</span></button>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Sections</div>
        <div className="list">
          {sortedProjects.map((p) => (
            <div key={p.id} className="list-row">
              {editingProjectId === p.id ? (
                <input
                  autoFocus
                  className="text-input"
                  value={editProjectName}
                  onChange={(e)=> setEditProjectName(e.target.value)}
                  onKeyDown={(e)=>{
                    if (e.key==='Enter' && editProjectName.trim()) {
                      updateProject({ ...p, name: editProjectName.trim() })
                      setEditingProjectId(null); setEditProjectName('')
                    }
                    if (e.key==='Escape') { setEditingProjectId(null); setEditProjectName('') }
                  }}
                  onBlur={()=>{
                    if (editProjectName.trim()) updateProject({ ...p, name: editProjectName.trim() })
                    setEditingProjectId(null); setEditProjectName('')
                  }}
                />
              ) : (
                <>
                  <button className={`list-item ${current.type==='project' && current.projectId===p.id ? 'active' : ''}`} onClick={() => go({ type: 'project', projectId: p.id })}>
                    <span className="color-dot" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Rename section"
                    onClick={(e)=>{ e.stopPropagation(); setEditingProjectId(p.id); setEditProjectName(p.name) }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Delete section"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const ok = await confirm({ title: 'Delete section?', message: `"${p.name}" — tasks will move to All.` })
                      if (ok) {
                        deleteProject(p.id)
                        go({ type: 'all' })
                      }
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="inline-add">
          {!addingProject ? (
            <button className="nav-item" onClick={() => setAddingProject(true)}>
              <PlusIcon className="nav-ico" />
              <span>Add section</span>
            </button>
          ) : (
            <input
              autoFocus
              className="text-input"
              placeholder="New section"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProject.trim()) {
                  const id = addProject(newProject.trim())
                  setNewProject('')
                  setAddingProject(false)
                  go({ type: 'project', projectId: id })
                }
                if (e.key === 'Escape') {
                  setAddingProject(false)
                  setNewProject('')
                }
              }}
              onBlur={() => {
                if (newProject.trim()) {
                  const id = addProject(newProject.trim())
                  setNewProject('')
                  setAddingProject(false)
                  go({ type: 'project', projectId: id })
                } else {
                  setAddingProject(false)
                }
              }}
            />
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Labels</div>
        <div className="list">
          {sortedLabels.map((l) => (
            <div key={l.id} className="list-row">
              {editingLabelId === l.id ? (
                <input
                  autoFocus
                  className="text-input"
                  value={editLabelName}
                  onChange={(e)=> setEditLabelName(e.target.value)}
                  onKeyDown={(e)=>{
                    if (e.key==='Enter' && editLabelName.trim()) {
                      updateLabel({ ...l, name: editLabelName.trim() })
                      setEditingLabelId(null); setEditLabelName('')
                    }
                    if (e.key==='Escape') { setEditingLabelId(null); setEditLabelName('') }
                  }}
                  onBlur={()=>{
                    if (editLabelName.trim()) updateLabel({ ...l, name: editLabelName.trim() })
                    setEditingLabelId(null); setEditLabelName('')
                  }}
                />
              ) : (
                <>
                  <button className={`list-item ${current.type==='label' && current.labelId===l.id ? 'active' : ''}`} onClick={() => go({ type: 'label', labelId: l.id })}>
                    <span className="hash">#</span>
                    <span>{l.name}</span>
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Rename label"
                    onClick={(e)=>{ e.stopPropagation(); setEditingLabelId(l.id); setEditLabelName(l.name) }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Delete label"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const ok = await confirm({ title: 'Delete label?', message: `Delete label "${l.name}"?` })
                      if (ok) {
                        deleteLabel(l.id)
                        go({ type: 'all' })
                      }
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="inline-add">
          {!addingLabel ? (
            <button className="nav-item" onClick={() => setAddingLabel(true)}>
              <PlusIcon className="nav-ico" />
              <span>Add label</span>
            </button>
          ) : (
            <input
              autoFocus
              className="text-input"
              placeholder="New label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newLabel.trim()) {
                  const id = addLabel(newLabel.trim())
                  setNewLabel('')
                  setAddingLabel(false)
                  go({ type: 'label', labelId: id })
                }
                if (e.key === 'Escape') {
                  setAddingLabel(false)
                  setNewLabel('')
                }
              }}
              onBlur={() => {
                if (newLabel.trim()) {
                  const id = addLabel(newLabel.trim())
                  setNewLabel('')
                  setAddingLabel(false)
                  go({ type: 'label', labelId: id })
                } else {
                  setAddingLabel(false)
                }
              }}
            />
          )}
        </div>
      </div>
      
    </aside>
  )
}

function renderWeatherIcon(code?: number) {
  const cls = 'w-ico'
  if (code === 0) return <SunIcon className={cls} />
  if (code === undefined || code === null) return <CloudIcon className={cls} />
  if ([1, 2, 3, 45, 48].includes(code)) return <CloudIcon className={cls} />
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRainIcon className={cls} />
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <SnowIcon className={cls} />
  if ([95, 96, 99].includes(code)) return <StormIcon className={cls} />
  return <CloudIcon className={cls} />
}

function labelForCode(code?: number) {
  if (code === 0) return 'Clear'
  if (code === undefined || code === null) return '—'
  if ([1, 2, 3].includes(code)) return 'Cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Storm'
  return 'Cloudy'
}



