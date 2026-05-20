import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const featuredFallback = 'WEB CRAFT FOR AI DEVELOPERS'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchCourses = () => {
    setLoading(true)
    api.get('/courses/list/')
      .then((response) => {
        setCourses(response.data.results || response.data || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([api.get('/courses/list/'), api.get('/courses/categories/')])
      .then(([courseResponse, categoryResponse]) => {
        setCourses(courseResponse.data.results || courseResponse.data || [])
        setCategories(categoryResponse.data.results || categoryResponse.data || [])
      })

      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (courseId) => {
    setDeletingId(courseId)
    try {
      await api.delete(`/courses/${courseId}/`)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      setConfirmDeleteId(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete course.')
    } finally {
      setDeletingId(null)
    }
  }

  const canDelete = (course) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (user.role === 'instructor' && course.instructor?.id === user?.id) return true
    return false
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || course.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [courses, search, activeCategory])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1.2rem, 5vw, 2rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Course Ecosystem</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: 1.1, color: '#0f172a', fontWeight: 900, marginBottom: '0.8rem' }}>Developer training built around practical momentum.</h1>
          <p style={{ color: '#51657f', maxWidth: 720, lineHeight: 1.65, fontSize: 'clamp(0.9rem, 2vw, 1rem)', marginBottom: '1.1rem' }}>Explore web development, React, Python, AI workflows, and computer fundamentals through project-driven learning.</p>
          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <Link to="/instructor/courses/builder" style={{ display: 'inline-block', textDecoration: 'none', border: 'none', background: '#0f172a', color: '#fff', borderRadius: '999px', padding: '0.8rem 1.2rem', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
              + Create New Course
            </Link>
          )}
        </section>

        <section className="stack-mobile" style={{ gap: '1rem' }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by topic, stack, or outcome" style={{ flex: 1, padding: '0.95rem 1rem', borderRadius: '1rem', border: '1px solid #dbeafe', outline: 'none', fontSize: '0.95rem', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }} />
          <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} style={{ padding: '0.95rem 1rem', borderRadius: '1rem', border: '1px solid #dbeafe', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </section>

        <section className="category-pills">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory((value) => value === category.id ? '' : category.id)} style={{ whiteSpace: 'nowrap', border: activeCategory === category.id ? 'none' : '1px solid #dbeafe', background: activeCategory === category.id ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)' : '#fff', color: activeCategory === category.id ? '#fff' : '#334155', borderRadius: '999px', padding: '0.7rem 1.2rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              {category.name}
            </button>
          ))}
        </section>

        {loading ? (
          <div style={{ background: '#fff', borderRadius: '1.4rem', padding: '3rem', textAlign: 'center', color: '#64748b', border: '1px solid rgba(148,163,184,0.16)' }}>Loading courses...</div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {filteredCourses.map((course) => {
              const isFeatured = course.title === featuredFallback
              return (
                <article key={course.id} style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)', display: 'grid', gap: '1rem' }}>
                  <div style={{ minHeight: 180, borderRadius: '1.1rem', padding: '1.1rem', background: isFeatured ? 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f59e0b 130%)' : 'linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)', color: isFeatured ? '#fff' : '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ padding: '0.42rem 0.7rem', borderRadius: '999px', background: isFeatured ? 'rgba(255,255,255,0.18)' : '#dbeafe', fontSize: '0.76rem', fontWeight: 800 }}>{course.category_name}</span>
                      <span style={{ color: isFeatured ? '#fde68a' : '#f59e0b', textTransform: 'capitalize', fontWeight: 800, fontSize: '0.8rem' }}>{course.difficulty}</span>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', lineHeight: 1.15, fontWeight: 900, marginBottom: '0.5rem' }}>{course.title}</h2>
                      <p style={{ color: isFeatured ? 'rgba(255,255,255,0.82)' : '#51657f', lineHeight: 1.55 }}>{course.description}</p>
                      {(course.start_date || course.end_date) && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {course.end_date && new Date() > new Date(course.end_date) ? (
                            <span style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 900 }}>Closed</span>
                          ) : course.start_date && new Date() < new Date(course.start_date) ? (
                            <span style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', background: '#fefce8', color: '#854d0e', fontSize: '0.7rem', fontWeight: 900 }}>Opens {new Date(course.start_date).toLocaleDateString()}</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}>{course.instructor_name || 'KEDI Team'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{course.lesson_count} lessons</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/courses/${course.id}`} style={{ padding: '0.78rem 1rem', borderRadius: '999px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>Open</Link>
                      {(user?.role === 'instructor' && course.instructor?.id === user?.id) && (
                        <Link to={`/instructor/courses/${course.id}/builder`} style={{ padding: '0.78rem 1rem', borderRadius: '999px', background: '#f1f5f9', color: '#1d4ed8', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #dbeafe' }}>Edit</Link>
                      )}
                      {canDelete(course) && (
                        confirmDeleteId === course.id ? (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              onClick={() => handleDelete(course.id)}
                              disabled={deletingId === course.id}
                              style={{ padding: '0.78rem 0.8rem', borderRadius: '999px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {deletingId === course.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ padding: '0.78rem 0.8rem', borderRadius: '999px', background: '#f1f5f9', color: '#334155', border: '1px solid #dbeafe', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(course.id)}
                            style={{ padding: '0.78rem 0.8rem', borderRadius: '999px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </Layout>
  )
}