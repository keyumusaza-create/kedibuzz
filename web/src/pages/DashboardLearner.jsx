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

export default function LearnerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/learner/')
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
          eyebrow="Learning Dashboard"
          title={`Welcome back, ${user?.first_name || user?.username}.`}
          body="Your developer path lives here: course progress, recent lessons, upcoming practice, earned certificates, and AI-powered momentum."
          actionLabel="Continue Learning"
          actionHref={data.active_courses?.[0] ? `/courses/${data.active_courses[0].id}` : '/courses'}
        />
        <div className="grid grid-4" style={{ gap: '1rem' }}>
          <Metric label="Enrolled Courses" value={data.total_enrolled} hint="Your active learning stack" />
          <Metric label="Overall Progress" value={`${Math.round(data.avg_progress)}%`} hint="Across your current catalog" />
          <Metric label="Certificates" value={data.completed_courses} hint="Proof of shipped learning" />
          <Metric label="Learning Streak" value={`${data.learning_streak} days`} hint="Consistency beats intensity" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <Panel title="Continue Learning" subtitle="Pick up where your progress is strongest">
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {(data.active_courses || []).length > 0 ? data.active_courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fbff', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.45rem' }}>
                    <strong style={{ color: '#0f172a' }}>{course.title}</strong>
                    <span style={{ color: '#2563eb', fontWeight: 800 }}>{Math.round(course.progress)}%</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '0.7rem' }}>{course.category_name}</div>
                  <div style={{ height: 10, background: '#dbeafe', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${course.progress}%`, height: '100%', background: 'linear-gradient(90deg, #1d4ed8 0%, #f59e0b 100%)' }} />
                  </div>
                </Link>
              )) : <div style={{ color: '#64748b' }}>No enrollments yet. Explore the course catalog to get started.</div>}
            </div>
          </Panel>
          <Panel title="Upcoming Tasks" subtitle="Practical steps to keep moving">
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {(data.upcoming_tasks || []).map((task) => (
                <div key={task.title} style={{ padding: '0.95rem', borderRadius: '1rem', background: '#fff7ed' }}>
                  <div style={{ color: '#0f172a', fontWeight: 800, marginBottom: '0.25rem' }}>{task.title}</div>
                  <div style={{ color: '#c2410c', fontSize: '0.85rem', fontWeight: 700 }}>{task.due}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <Panel title="Recent Lessons" subtitle="Continue the latest concepts you touched">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(data.recent_lessons || []).map((lesson) => (
                <Link key={lesson.id} to={`/lessons/${lesson.id}`} style={{ textDecoration: 'none', padding: '0.9rem 1rem', borderRadius: '1rem', background: '#f8fbff' }}>
                  <div style={{ color: '#0f172a', fontWeight: 800 }}>{lesson.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.86rem' }}>{lesson.course_title}</div>
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="Announcements" subtitle="Platform and course updates">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(data.announcements || []).map((item) => (
                <div key={item.id} style={{ padding: '0.9rem 1rem', borderRadius: '1rem', background: '#f8fbff' }}>
                  <div style={{ color: '#0f172a', fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.86rem', margin: '0.35rem 0' }}>{item.content}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{item.date}</div>
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
    <section style={{ ...cardStyle, padding: 'clamp(1rem, 5vw, 2rem)', background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f59e0b 130%)', color: '#fff' }}>
      <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, color: '#bfdbfe', marginBottom: '0.6rem' }}>{eyebrow}</p>
      <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)', lineHeight: 1.1, fontWeight: 900, maxWidth: 680, marginBottom: '0.9rem' }}>{title}</h1>
      <p style={{ maxWidth: 660, color: 'rgba(255,255,255,0.84)', fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.6, marginBottom: '1.2rem' }}>{body}</p>
      {actionLabel && <Link to={actionHref} style={{ display: 'inline-flex', padding: '0.8rem 1.4rem', borderRadius: '999px', background: '#fff', color: '#0f172a', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>{actionLabel}</Link>}
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