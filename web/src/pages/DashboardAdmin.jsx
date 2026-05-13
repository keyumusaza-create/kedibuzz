import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/admin/')
      .then(res => setData(res.data))
      .catch(() => setError('Could not load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div style={{ background: '#fff', padding: '4rem', borderRadius: '1.4rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Loading...</div></Layout>
  if (error) return <Layout><div style={{ background: '#fff', padding: '2rem', borderRadius: '1.4rem', color: '#b91c1c' }}>{error}</div></Layout>

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Hero
          eyebrow="Control Center"
          title="Guide the KEDI learning ecosystem."
          body="Oversee courses, instructors, announcements, and certification activity from one modern operations dashboard."
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <ManagementCard 
            title="User Management" 
            description="Create and manage instructor accounts and oversee learner access." 
            icon="👥"
            link="/admin/instructors"
            color="#2563eb"
          />
          <ManagementCard 
            title="Global Announcements" 
            description="Broadcast platform-wide updates to the entire community." 
            icon="📣"
            link="/admin/announcements"
            color="#f59e0b"
          />
          <ManagementCard 
            title="Course Oversight" 
            description="Review course content, track performance, and manage categories." 
            icon="📚"
            link="/courses"
            color="#10b981"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Metric label="Learners" value={data.total_learners} hint="Active in the training portal" />
          <Metric label="Instructors" value={data.total_instructors} hint="Publishing practical lessons" />
          <Metric label="Courses" value={data.total_courses} hint="Across coding categories" />
          <Metric label="Announcements" value={data.announcements} hint="Shared to the community" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
          <Panel title="Recent Enrollments" subtitle="Who joined the hub most recently">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.recent_enrollments.map((item) => (
                <div key={`${item.learner}-${item.course}`} style={{ padding: '0.95rem 1rem', borderRadius: '1rem', background: '#f8fbff', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 800 }}>{item.learner}</div>
                    <div style={{ color: '#64748b', fontSize: '0.88rem' }}>{item.course}</div>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{item.date}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Top Courses" subtitle="Most enrolled programs">
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {data.top_courses.map((course, index) => (
                <div key={course.title} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{index + 1}</div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 800 }}>{course.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{course.enrollments} learners · {course.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Layout>
  )
}

function Hero({ eyebrow, title, body, actionLabel, actionHref }) {
  return (
    <section style={{ ...cardStyle, padding: '2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f59e0b 130%)', color: '#fff' }}>
      <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, color: '#bfdbfe', marginBottom: '0.6rem' }}>{eyebrow}</p>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, fontWeight: 900, maxWidth: 680, marginBottom: '0.9rem' }}>{title}</h1>
      <p style={{ maxWidth: 660, color: 'rgba(255,255,255,0.84)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.2rem' }}>{body}</p>
      {actionLabel && <Link to={actionHref} style={{ display: 'inline-flex', padding: '0.85rem 1.2rem', borderRadius: '999px', background: '#fff', color: '#0f172a', fontWeight: 800, textDecoration: 'none' }}>{actionLabel}</Link>}
    </section>
  )
}

function Metric({ label, value, hint }) {
  return (
    <div style={{ ...cardStyle, padding: '1.4rem' }}>
      <p style={{ color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>{label}</p>
      <h3 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 900, marginBottom: '0.35rem' }}>{value}</h3>
      <p style={{ color: '#2563eb', fontSize: '0.86rem', fontWeight: 700 }}>{hint}</p>
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <section style={{ ...cardStyle, padding: '1.4rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
        {subtitle && <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function ManagementCard({ title, description, icon, link, color }) {
  return (
    <Link to={link} style={{ ...cardStyle, padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} className="mgmt-card">
      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{description}</p>
      <div style={{ color: color, fontSize: '0.85rem', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        Manage Now
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <style>{`
        .mgmt-card:hover { transform: translateY(-3px); box-shadow: 0 20px 45px rgba(15,23,42,0.12) !important; border-color: ${color}33 !important; }
      `}</style>
    </Link>
  )
}