import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses/enrollments/')
      .then((response) => setEnrollments(response.data.results || response.data || []))
      .finally(() => setLoading(false))
  }, [])


  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>My Learning</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Track your progress and keep shipping skills.</h1>
          <p style={{ color: '#51657f', lineHeight: 1.65, maxWidth: 700 }}>Everything you are enrolled in lives here: course progress, resume points, and the next practical milestone in each program.</p>
        </section>

        {loading ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Loading your learning path...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center', border: '1px solid rgba(148,163,184,0.16)' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.5rem' }}>No courses enrolled yet</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Pick a course from the catalog to start building your developer momentum.</p>
            <Link to="/courses" style={{ display: 'inline-flex', padding: '0.85rem 1.1rem', borderRadius: '999px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>Browse courses</Link>
          </div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {enrollments.map((enrollment) => (
              <article key={enrollment.id} style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
                <p style={{ color: '#1d4ed8', fontWeight: 800, marginBottom: '0.35rem' }}>{enrollment.course_details.category_name}</p>
                <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.6rem', lineHeight: 1.2 }}>{enrollment.course_details.title}</h2>
                <p style={{ color: '#51657f', lineHeight: 1.55, marginBottom: '1rem' }}>{enrollment.course_details.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.45rem' }}>
                  <span>Progress</span>
                  <span>{Math.round(enrollment.progress)}%</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, overflow: 'hidden', background: '#dbeafe', marginBottom: '1rem' }}>
                  <div style={{ width: `${enrollment.progress}%`, height: '100%', background: 'linear-gradient(90deg, #1d4ed8 0%, #f59e0b 100%)' }} />
                </div>
                <Link to={`/courses/${enrollment.course}`} style={{ display: 'inline-flex', padding: '0.8rem 1rem', borderRadius: '999px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>Resume course</Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
