import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SvgIcon = ({ children, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const FlameIcon = (p) => <SvgIcon {...p}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></SvgIcon>
const BookIcon = (p) => <SvgIcon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></SvgIcon>
const CodeIcon = (p) => <SvgIcon {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></SvgIcon>
const TrophyIcon = (p) => <SvgIcon {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></SvgIcon>
const StarIcon = (p) => <SvgIcon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>
const PlayIcon = (p) => <SvgIcon {...p}><polygon points="5 3 19 12 5 21 5 3"/></SvgIcon>

export default function MyLearning() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/learner/')
      .then((response) => setData(response.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <Layout>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading your workspace...</div>
      </Layout>
    )
  }

  const { total_enrolled, completed_courses, avg_progress, active_courses, recent_lessons, upcoming_tasks, learning_streak, challenges_solved, certificates_earned } = data

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="hover-card" style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '1rem', background: color.bg, color: color.fg, display: 'grid', placeItems: 'center' }}>
        <Icon width={24} height={24} />
      </div>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{value}</span>
          {subtitle && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>{subtitle}</span>}
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <style>{`
        .dashboard-grid { display: grid; gap: 1.5rem; grid-template-columns: minmax(0, 1fr) 340px; }
        .glass-panel { background: rgba(255,255,255,0.9); border: 1px solid rgba(148,163,184,0.15); box-shadow: 0 10px 30px rgba(15,23,42,0.04); border-radius: 1.25rem; padding: 1.5rem; }
        .grad-text { background: linear-gradient(90deg, #1d4ed8, #2563eb, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hover-card { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(15,23,42,0.06); }
        .progress-bg { height: 8px; border-radius: 4px; background: #e2e8f0; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #ec4899); border-radius: 4px; transition: width 0.5s ease-out; }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-grid">
        <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
          
          {/* Hero Section */}
          <section className="glass-panel" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(90deg, #fef3c7, #ffedd5)', color: '#ea580c', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800 }}>
                  <FlameIcon width={16} height={16} /> {learning_streak}-Day Learning Streak
                </span>
                <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 800, background: '#d1fae5', padding: '0.35rem 0.85rem', borderRadius: '999px' }}>Active</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', lineHeight: 1.1, color: '#0f172a', fontWeight: 900, marginBottom: '0.5rem' }}>
                Welcome back, <span className="grad-text">{user?.first_name || 'Developer'}</span> 👋
              </h1>
              <p style={{ color: '#51657f', fontSize: '1.05rem', lineHeight: 1.5, maxWidth: 500, marginBottom: '1.5rem' }}>
                You're making great progress. Continue building your AI developer skills today.
              </p>
              
              {active_courses.length > 0 ? (
                <Link to={`/courses/${active_courses[0].id}`} className="hover-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.4rem', borderRadius: '999px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
                  Continue Learning
                  <PlayIcon width={16} height={16} />
                </Link>
              ) : (
                <Link to="/courses" className="hover-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.4rem', borderRadius: '999px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
                  Browse Catalog
                </Link>
              )}
            </div>
            
            {/* Decorative background blur */}
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: 250, height: 250, background: '#3b82f6', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: '10%', bottom: '-20%', width: 200, height: 200, background: '#f59e0b', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }} />
          </section>

          {/* Stats Grid */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <StatCard title="Courses Enrolled" value={total_enrolled} icon={BookIcon} color={{ bg: '#dbeafe', fg: '#2563eb' }} subtitle={`+${completed_courses} done`} />
            <StatCard title="Completion Rate" value={`${Math.round(avg_progress)}%`} icon={StarIcon} color={{ bg: '#fef3c7', fg: '#d97706' }} />
            <StatCard title="Challenges Solved" value={challenges_solved} icon={CodeIcon} color={{ bg: '#e0e7ff', fg: '#4f46e5' }} subtitle="Top 10%" />
            <StatCard title="Certificates" value={certificates_earned} icon={TrophyIcon} color={{ bg: '#dcfce3', fg: '#16a34a' }} />
          </section>

          {/* Current Courses */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Current Courses</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Pick up where you left off</p>
              </div>
              <Link to="/courses" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>View All</Link>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {active_courses.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p style={{ color: '#64748b', fontWeight: 600 }}>You are not enrolled in any courses yet.</p>
                </div>
              ) : (
                active_courses.map(course => (
                  <div key={course.id} className="glass-panel hover-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{ width: 100, height: 75, borderRadius: '0.85rem', background: '#e2e8f0', backgroundImage: `url(${course.thumbnail || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{course.category_name}</p>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>{course.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bg" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>{Math.round(course.progress)}%</span>
                      </div>
                    </div>
                    <Link to={`/courses/${course.id}`} style={{ padding: '0.6rem 1.25rem', borderRadius: '999px', background: '#f1f5f9', color: '#0f172a', fontWeight: 800, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
                      Continue
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar Area */}
        <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
          
          {/* Practice Lab Widget */}
          <section className="glass-panel" style={{ background: '#0f172a', color: '#fff', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#3b82f6', display: 'grid', placeItems: 'center' }}>
                <CodeIcon width={18} height={18} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Practice Lab</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              Hands-on coding challenges to build your muscle memory.
            </p>
            <div style={{ background: '#1e293b', borderRadius: '0.85rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fcd34d' }}>Intermediate</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Responsive Dashboard Layout</p>
            </div>
            <Link to="/practice" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: '#3b82f6', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>
              Start Challenge
            </Link>
          </section>

          {/* Recent Activity Timeline */}
          <section className="glass-panel">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recent_lessons.length > 0 ? recent_lessons.slice(0, 3).map((lesson, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', border: '3px solid #d1fae5' }} />
                    {idx !== 2 && <div style={{ width: 2, height: '100%', background: '#e2e8f0', margin: '0.2rem 0' }} />}
                  </div>
                  <div style={{ paddingBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Completed Lesson</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{lesson.title}</p>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No recent activity to show.</p>
              )}
            </div>
          </section>

          {/* Achievements */}
          <section className="glass-panel" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309', marginBottom: '1rem' }}>Milestones</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', border: '2px solid #f59e0b', display: 'grid', placeItems: 'center', color: '#d97706' }}>
                <FlameIcon width={28} height={28} />
              </div>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', border: '2px solid #f59e0b', display: 'grid', placeItems: 'center', color: '#d97706' }}>
                <BookIcon width={24} height={24} />
              </div>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', border: '2px dashed #d1d5db', display: 'grid', placeItems: 'center', color: '#9ca3af' }}>
                <TrophyIcon width={24} height={24} />
              </div>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  )
}
