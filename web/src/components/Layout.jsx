import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Svg = ({ children, size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const HomeIcon = (p) => <Svg {...p}><path d="m3 10 9-7 9 7" /><path d="M5 9.8V20h14V9.8" /><path d="M9 20v-6h6v6" /></Svg>
const CourseIcon = (p) => <Svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Svg>
const RocketIcon = (p) => <Svg {...p}><path d="M4.5 16.5c-1.5 1.5-2 4-2 4s2.5-.5 4-2l2-2-2-2-2 2Z" /><path d="M14 10 9 15" /><path d="M16 4c3.2 0 5 1.8 5 5-3.8.4-6.8 3.4-7.2 7.2-3.2 0-5-1.8-5-5C8.8 7 12 4 16 4Z" /></Svg>
const AwardIcon = (p) => <Svg {...p}><circle cx="12" cy="8" r="6" /><path d="m8.5 14.5-1.5 7L12 19l5 2.5-1.5-7" /></Svg>
const BellIcon = (p) => <Svg {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Svg>
const UserIcon = (p) => <Svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>
const GearIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Svg>
const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
const MenuIcon = (p) => <Svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Svg>
const LogoutIcon = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>
const UsersIcon = (p) => <Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>
const LayersIcon = (p) => <Svg {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66Z" /><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" /><path d="m2.1 10.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" /></Svg>
const MessageIcon = (p) => <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
const ChartIcon = (p) => <Svg {...p}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></Svg>

const NAV = {
  admin: [
    { path: '/admin', label: 'Dashboard', Icon: HomeIcon },
    { path: '/admin/users', label: 'Users', Icon: UsersIcon },
    { path: '/admin/instructors', label: 'Instructors', Icon: UsersIcon },
    { path: '/admin/students', label: 'Students', Icon: UsersIcon },
    { path: '/admin/courses', label: 'Courses', Icon: CourseIcon },
    { path: '/admin/categories', label: 'Categories', Icon: LayersIcon },
    { path: '/admin/certificates', label: 'Certificates', Icon: AwardIcon },
    { path: '/admin/analytics', label: 'Analytics', Icon: ChartIcon },
    { path: '/admin/announcements', label: 'Announcements', Icon: BellIcon },
    { path: '/admin/reports', label: 'Reports', Icon: ChartIcon },
    { path: '/admin/payments', label: 'Payments', Icon: LayersIcon },
    { path: '/community', label: 'Community', Icon: UsersIcon },
    { path: '/settings', label: 'Settings', Icon: GearIcon },
  ],
  instructor: [

    { path: '/instructor', label: 'Dashboard', Icon: HomeIcon },
    { path: '/instructor/courses', label: 'My Courses', Icon: CourseIcon },
    { path: '/instructor/courses/create', label: 'Create Course', Icon: RocketIcon },
    { path: '/instructor/lessons', label: 'Lessons', Icon: LayersIcon },
    { path: '/instructor/assignments', label: 'Assignments', Icon: GearIcon },
    { path: '/instructor/students', label: 'Students', Icon: UsersIcon },
    { path: '/instructor/submissions', label: 'Submissions', Icon: AwardIcon },
    { path: '/instructor/certificates', label: 'Certificates', Icon: AwardIcon },
    { path: '/instructor/announcements', label: 'Announcements', Icon: BellIcon },
    { path: '/instructor/messages', label: 'Messages', Icon: MessageIcon },
    { path: '/instructor/analytics', label: 'Analytics', Icon: ChartIcon },
    { path: '/community', label: 'Community', Icon: UsersIcon },
    { path: '/settings', label: 'Settings', Icon: GearIcon },
  ],
  learner: [
    { path: '/my-learning', label: 'Dashboard', Icon: HomeIcon },
    { path: '/courses', label: 'My Courses', Icon: CourseIcon },
    { path: '/learning-path', label: 'Learning Path', Icon: LayersIcon },
    { path: '/assignments', label: 'Assignments', Icon: LayersIcon },
    { path: '/practice', label: 'Practice Lab', Icon: RocketIcon },
    { path: '/certificates', label: 'Certificates', Icon: AwardIcon },
    { path: '/messages', label: 'Messages', Icon: MessageIcon },
    { path: '/community', label: 'Community', Icon: UsersIcon },
    { path: '/settings', label: 'Settings', Icon: GearIcon },
  ],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  const navItems = NAV[user?.role] || NAV.learner
  const initials = useMemo(() => ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || user?.username?.[0]?.toUpperCase() || 'K', [user])
  const displayName = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'KEDI Member'

  useEffect(() => {
    const closeMenus = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get(`/dashboard/search/?q=${encodeURIComponent(query)}`)
        setResults(response.data.results || [])
        setSearchOpen(true)
      } catch {
        setResults([])
      }
    }, 250)
    return () => clearTimeout(timeout)
  }, [query])

  const openNotifications = async () => {
    if (!notifOpen && notifications.length === 0) {
      try {
        const response = await api.get('/dashboard/notifications/')
        setNotifications(response.data.notifications || [])
      } catch {
        setNotifications([])
      }
    }
    setNotifOpen((value) => !value)
  }

  const shellLinkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    borderRadius: '1rem',
    color: active ? '#fff' : '#375172',
    textDecoration: 'none',
    fontWeight: 700,
    background: active ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)' : 'transparent',
    boxShadow: active ? '0 16px 30px rgba(37, 99, 235, 0.22)' : 'none',
  })

  // Do not wrap authentication pages in the platform shell
  if (['/login', '/signup'].includes(location.pathname)) {
    return <>{children}</>
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: 'linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)' }}>
      <style>{`
        .hub-shell { display: grid; grid-template-columns: 280px minmax(0, 1fr); height: 100vh; overflow: hidden; }
        .hub-sidebar { padding: 1.25rem; background: rgba(255,255,255,0.82); border-right: 1px solid rgba(148,163,184,0.14); backdrop-filter: blur(18px); height: 100vh; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; }
        .hub-sidebar::-webkit-scrollbar { width: 4px; } .hub-sidebar::-webkit-scrollbar-track { background: transparent; } .hub-sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .hub-main { min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; overflow-x: hidden; width: 100%; }
        .hub-main::-webkit-scrollbar { width: 6px; } .hub-main::-webkit-scrollbar-track { background: transparent; } .hub-main::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .hub-search-result:hover { background: #f8fbff; }
        @media (max-width: 980px) {
          .hub-shell { grid-template-columns: minmax(0, 1fr); }
          .hub-sidebar { position: fixed; inset: 0 auto 0 0; width: 280px; z-index: 100; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 20px 60px rgba(15,23,42,0.18); height: 100vh; }
          .hub-sidebar.open { transform: translateX(0); }
          .hub-scrim { position: fixed; inset: 0; background: rgba(15,23,42,0.4); z-index: 90; backdrop-filter: blur(4px); }
          .hub-header { padding: 0.75rem 0.75rem 0 !important; }
          .hub-header-inner { padding: 0.65rem !important; gap: 0.5rem !important; }
          .user-meta { display: none; }
          .search-container { flex: 1; }
        }
        @media (max-width: 480px) {
          .hub-sidebar { width: 85%; }
          .header-search-input { display: none; }
          .search-mobile-btn { display: inline-flex !important; }
        }
      `}</style>

      {menuOpen && <div className="hub-scrim" onClick={() => setMenuOpen(false)} />}

      <div className="hub-shell">
        <aside className={`hub-sidebar ${menuOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
            <img src={`${import.meta.env.BASE_URL}kedi-logo.png`} alt="KEDI Developer Hub" style={{ width: 58, height: 'auto' }} />
            <div>
              <p style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1d4ed8', fontWeight: 800 }}>KEDI</p>
              <h1 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>Developer Hub</h1>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '1.2rem', marginBottom: '1rem', background: 'linear-gradient(150deg, #eff6ff 0%, #dbeafe 60%, #ffedd5 100%)', border: '1px solid rgba(96,165,250,0.18)' }}>
            <p style={{ fontSize: '0.76rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem' }}>AI Learning Portal</p>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.45rem' }}>Learn. Build. Innovate with AI.</h2>
            <p style={{ color: '#51657f', fontSize: '0.88rem', lineHeight: 1.55 }}>Courses, practical coding, and project-based growth from one modern hub.</p>
          </div>

          <nav style={{ display: 'grid', gap: '0.45rem' }}>
            {navItems.map(({ path, label, Icon }) => {
              const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
              return (
                <Link key={path} to={path} style={shellLinkStyle(active)} onClick={() => setMenuOpen(false)}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '1rem', background: '#0f172a', color: '#fff', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, marginBottom: '0.45rem' }}>Today&apos;s Focus</p>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>Ship one lesson, one exercise, and one improvement to your developer workflow.</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', borderRadius: '0.95rem', padding: '0.9rem 1rem', fontWeight: 700, cursor: 'pointer' }}>
              <LogoutIcon size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="hub-main">
          <header className="hub-header" style={{ position: 'sticky', top: 0, zIndex: 30, padding: '1rem 1rem 0', background: 'linear-gradient(180deg, rgba(248,251,255,0.96) 0%, rgba(248,251,255,0.78) 100%)', backdropFilter: 'blur(18px)' }}>
            <div className="hub-header-inner" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(148,163,184,0.14)', borderRadius: '1.25rem', padding: '0.85rem 1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
              <button onClick={() => setMenuOpen((value) => !value)} style={{ display: 'inline-flex', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '0.8rem', padding: '0.65rem', cursor: 'pointer', flexShrink: 0 }}>
                <MenuIcon size={18} />
              </button>

              <div className="search-container" ref={searchRef} style={{ position: 'relative', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.8rem 0.95rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <SearchIcon size={16} color="#64748b" />
                  <input 
                    className="header-search-input"
                    value={query} 
                    onChange={(event) => setQuery(event.target.value)} 
                    onFocus={() => results.length > 0 && setSearchOpen(true)} 
                    placeholder="Search courses, lessons..." 
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1e293b', fontSize: '0.92rem' }} 
                  />
                  <button className="search-mobile-btn" style={{ display: 'none', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setSearchOpen(true)}>
                    <SearchIcon size={16} />
                  </button>
                </div>
                {searchOpen && results.length > 0 && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 0.5rem)', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 20px 45px rgba(15,23,42,0.12)' }}>
                    {results.map((result) => (
                      <button key={`${result.type}-${result.title}`} className="hub-search-result" onClick={() => { navigate(result.url || '/'); setSearchOpen(false); setQuery('') }} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.9rem 1rem', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{result.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{result.subtitle}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={openNotifications} style={{ position: 'relative', display: 'inline-flex', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: '0.85rem', padding: '0.72rem', cursor: 'pointer' }}>
                  <BellIcon size={18} />
                  {notifications.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 999, background: '#2563eb', color: '#fff', fontSize: '0.66rem', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{notifications.length}</span>}
                </button>
                {notifOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.6rem)', width: 280, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 20px 45px rgba(15,23,42,0.12)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.95rem 1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#0f172a' }}>Platform updates</div>
                    {(notifications.length ? notifications : [{ id: 'empty', title: 'No new announcements', body: 'You are up to date.', time: 'Now' }]).map((notification) => (
                      <div key={notification.id} style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.25rem' }}>
                          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem' }}>{notification.title}</p>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{notification.time}</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{notification.body}</p>
                      </div>
                    ))}
                    <button onClick={() => { setNotifOpen(false); navigate('/announcements') }} style={{ width: '100%', background: '#f8fbff', border: 'none', padding: '0.85rem 1rem', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}>View all announcements</button>
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{initials}</div>
                <div className="user-meta" style={{ textAlign: 'left' }}>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}>{displayName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
              </button>
            </div>
          </header>

          <main style={{ padding: '1rem' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
