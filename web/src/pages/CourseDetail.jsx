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
        <section className="hero-gradient" style={{ color: '#fff', borderRadius: '1.6rem', padding: 'clamp(1.2rem, 5vw, 2rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.14)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.9rem' }}>
            <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.14)', borderRadius: '999px', fontWeight: 800, fontSize: '0.75rem' }}>{course.category_name}</span>
            <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.14)', borderRadius: '999px', fontWeight: 800, fontSize: '0.75rem', textTransform: 'capitalize' }}>{course.difficulty}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.1, fontWeight: 900, marginBottom: '0.8rem' }}>{course.title}</h1>
          <p style={{ maxWidth: 760, color: 'rgba(255,255,255,0.84)', lineHeight: 1.65, fontSize: 'clamp(0.9rem, 2vw, 1rem)', marginBottom: '1rem' }}>{course.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700 }}>Instructor: {course.instructor_name || 'KEDI Team'}</span>
            <span style={{ fontWeight: 700 }}>{course.lesson_count} lessons</span>
            <span style={{ fontWeight: 700 }}>{course.estimated_duration}</span>
          </div>
        </section>

        <div className="responsive-cols">
          <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.4rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.4rem' }}>Curriculum structure</h2>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {(course.modules || []).map((module) => (
                <div key={module.id} style={{ border: '1px solid #e2e8f0', borderRadius: '1.25rem', overflow: 'hidden', background: module.is_available ? '#fff' : '#f8fafc' }}>
                  <div style={{ padding: '1.2rem', background: module.is_available ? 'transparent' : '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: module.is_available ? 1 : 0.7 }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
                        {!module.is_available && <span style={{ marginRight: '0.5rem' }}>🔒</span>}
                        {module.title}
                      </h3>
                      {!module.is_available && module.available_at && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                          Available on {new Date(module.available_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ padding: '0.5rem 1rem 1.2rem' }}>
                    {(module.lessons || []).map((lesson) => (
                      <div key={lesson.id} style={{ padding: '1rem', borderRadius: '0.85rem', background: '#f8fbff', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: module.is_available ? '#0f172a' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem' }}>{lesson.order}. {lesson.title}</div>
                        </div>
                        {(course.is_enrolled || user?.role !== 'learner') && module.is_available ? (
                          <Link to={`/lessons/${lesson.id}`} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', flexShrink: 0, fontSize: '0.85rem' }}>Start</Link>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {!module.is_available ? 'Locked' : 'Enroll to start'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

            <aside style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.4rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              {user?.role === 'learner' && !course.is_enrolled ? (
                <>
                  {course.end_date && new Date() > new Date(course.end_date) ? (
                    <div style={{ padding: '0.9rem', borderRadius: '1rem', background: '#fef2f2', color: '#dc2626', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
                      🚫 Enrollment Closed
                    </div>
                  ) : course.start_date && new Date() < new Date(course.start_date) ? (
                    <div style={{ padding: '0.9rem', borderRadius: '1rem', background: '#fefce8', color: '#854d0e', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
                      ⏳ Opens on {new Date(course.start_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <button onClick={enroll} disabled={enrolling} style={{ width: '100%', border: 'none', borderRadius: '1rem', padding: '0.9rem 1.1rem', fontWeight: 900, color: '#fff', background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)', cursor: 'pointer', marginBottom: '1rem' }}>
                      {enrolling ? 'Enrolling...' : 'Enroll in this course'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '1rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.9rem' }}>
                  {course.is_enrolled ? `You are enrolled · ${Math.round(course.progress || 0)}% complete` : 'Available to your role'}
                </div>
              )}
              <h3 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem', fontSize: '1rem' }}>What you&apos;ll build</h3>
              <ul style={{ paddingLeft: '1.2rem', color: '#51657f', lineHeight: 1.6, fontSize: '0.9rem' }}>
                {(course.outcomes || []).map((outcome) => <li key={outcome} style={{ marginBottom: '0.4rem' }}>{outcome}</li>)}
              </ul>
            </section>

            <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.4rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h3 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem', fontSize: '1rem' }}>Tools & Focus</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                {(course.tools || []).map((tool) => (
                  <span key={tool} style={{ padding: '0.4rem 0.7rem', borderRadius: '999px', background: '#fff7ed', color: '#c2410c', fontWeight: 800, fontSize: '0.75rem' }}>{tool}</span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
