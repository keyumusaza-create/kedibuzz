import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
}

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/instructor/')
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
          eyebrow="Instructor Studio"
          title={`Keep building momentum, ${user?.first_name || user?.username}.`}
          body="Create engaging lessons, guide practical work, and track how learners are progressing through your developer programs."
          actionLabel="Open Course Library"
          actionHref="/courses"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Metric label="Your Courses" value={data.total_courses} hint="Live or ready to refine" />
          <Metric label="Learner Enrollments" value={data.total_enrollments} hint="Across all your programs" />
          <Metric label="Pending Reviews" value={data.pending_reviews} hint="Capstones and coding tasks" />
        </div>
        <Panel title="Course Performance" subtitle="A quick read on engagement and progress">
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {data.course_stats.map((course) => (
              <div key={course.title} style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fbff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                  <strong style={{ color: '#0f172a' }}>{course.title}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{course.enrollment_count} learners</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: '#dbeafe', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div style={{ width: `${Math.round(course.avg_progress || 0)}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #f59e0b 100%)' }} />
                </div>
                <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.88rem' }}>{Math.round(course.avg_progress || 0)}% average completion</span>
              </div>
            ))}
          </div>
        </Panel>
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