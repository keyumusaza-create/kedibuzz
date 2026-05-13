import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    api.get(`/courses/list/${id}/`)
      .then((response) => setCourse(response.data))
      .finally(() => setLoading(false))
  }, [id])

  const enroll = async () => {
    setEnrolling(true)
    try {
      await api.post(`/courses/list/${id}/enroll/`)
      const refreshed = await api.get(`/courses/list/${id}/`)
      setCourse(refreshed.data)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Loading course...</div></Layout>
  if (!course) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Course not found.</div></Layout>

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f59e0b 130%)', color: '#fff', borderRadius: '1.6rem', padding: '2rem', boxShadow: '0 18px 40px rgba(15,23,42,0.14)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.9rem' }}>
            <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.14)', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem' }}>{course.category_name}</span>
            <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.14)', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'capitalize' }}>{course.difficulty}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, fontWeight: 900, marginBottom: '0.8rem' }}>{course.title}</h1>
          <p style={{ maxWidth: 760, color: 'rgba(255,255,255,0.84)', lineHeight: 1.65, marginBottom: '1rem' }}>{course.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Instructor: {course.instructor_name || 'KEDI Team'}</span>
            <span style={{ fontWeight: 700 }}>{course.lesson_count} lessons</span>
            <span style={{ fontWeight: 700 }}>{course.estimated_duration}</span>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '1rem' }}>
          <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Modules</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(course.lessons || []).map((lesson) => (
                <div key={lesson.id} style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fbff', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 800 }}>{lesson.order}. {lesson.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{lesson.video_url ? 'Video lesson + notes' : 'Text lesson'}</div>
                  </div>
                  {course.is_enrolled || user?.role !== 'learner' ? (
                    <Link to={`/lessons/${lesson.id}`} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>Open</Link>
                  ) : <span style={{ color: '#94a3b8', fontWeight: 700 }}>Enroll to unlock</span>}
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              {user?.role === 'learner' && !course.is_enrolled ? (
                <button onClick={enroll} disabled={enrolling} style={{ width: '100%', border: 'none', borderRadius: '1rem', padding: '1rem 1.1rem', fontWeight: 900, color: '#fff', background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)', cursor: 'pointer', marginBottom: '1rem' }}>
                  {enrolling ? 'Enrolling...' : 'Enroll in this course'}
                </button>
              ) : (
                <div style={{ marginBottom: '1rem', padding: '0.95rem 1rem', borderRadius: '1rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800 }}>
                  {course.is_enrolled ? `You are enrolled · ${Math.round(course.progress || 0)}% complete` : 'Available to your role'}
                </div>
              )}
              <h3 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>What you&apos;ll build</h3>
              <ul style={{ paddingLeft: '1rem', color: '#51657f', lineHeight: 1.7 }}>
                {(course.outcomes || []).map((outcome) => <li key={outcome}>{outcome}</li>)}
              </ul>
            </section>

            <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h3 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Tools & Focus</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                {(course.tools || []).map((tool) => (
                  <span key={tool} style={{ padding: '0.45rem 0.72rem', borderRadius: '999px', background: '#fff7ed', color: '#c2410c', fontWeight: 800, fontSize: '0.78rem' }}>{tool}</span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
