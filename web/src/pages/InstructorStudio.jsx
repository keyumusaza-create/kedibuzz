import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

// ─── Shared Styles ──────────────────────────────────────────────────────────
const card = {
  background: '#fff',
  borderRadius: '1.25rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  padding: '1.5rem',
}

const btn = (primary) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.65rem 1.2rem',
  borderRadius: '0.75rem',
  border: primary ? 'none' : '1.5px solid #e2e8f0',
  background: primary ? 'linear-gradient(90deg,#1d4ed8,#2563eb)' : '#fff',
  color: primary ? '#fff' : '#0f172a',
  fontWeight: 800,
  fontSize: '0.88rem',
  cursor: 'pointer',
})

const input = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '0.4rem',
  fontSize: '0.9rem',
}

function PageHeader({ title, subtitle, action }) {
  return (
    <header style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.3rem' }}>Teaching Studio</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{title}</h1>
          {subtitle && <p style={{ color: '#64748b', marginTop: '0.4rem' }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

function Badge({ text, ok }) {
  return (
    <span style={{
      padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800,
      background: ok ? '#ecfdf5' : '#fff7ed', color: ok ? '#059669' : '#ea580c'
    }}>{text}</span>
  )
}

function EmptyState({ icon = '📭', message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ fontWeight: 700 }}>{message}</p>
    </div>
  )
}

// ─── 1. Instructor Courses ───────────────────────────────────────────────────
export function InstructorCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/courses/list/').then(r => setCourses(r.data.results || r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const togglePublish = async (course) => {
    await api.patch(`/courses/list/${course.id}/`, { is_published: !course.is_published })
    load()
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader
          title="My Courses"
          subtitle="Manage everything you're teaching."
          action={
            <Link to="/instructor/courses/create" style={btn(true)}>+ Create Course</Link>
          }
        />

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div style={card}><EmptyState icon="📚" message="No courses yet. Create your first one!" /></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {courses.map(course => (
              <div key={course.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{course.title}</h3>
                    <Badge text={course.is_published ? 'Published' : 'Draft'} ok={course.is_published} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <span>📖 {course.lesson_count} lessons</span>
                    <span>🎓 {course.difficulty}</span>
                    <span>🗂 {course.category_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => togglePublish(course)} style={btn(false)}>
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link to={`/instructor/lessons?course_id=${course.id}`} style={btn(false)}>Lessons</Link>
                  <Link to={`/instructor/assignments?course_id=${course.id}`} style={btn(true)}>Assignments</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── 2. Create Course ────────────────────────────────────────────────────────
export function CreateCourse() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'beginner', is_published: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/courses/categories/').then(r => setCategories(r.data.results || r.data || []))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/courses/list/', form)
      navigate(`/instructor/lessons?course_id=${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create course.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <PageHeader title="Create New Course" subtitle="Fill in the details to launch your course." />

        <form onSubmit={submit} style={{ ...card, display: 'grid', gap: '1.25rem' }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}

          <div>
            <label style={labelStyle}>Course Title *</label>
            <input style={input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. React for AI Developers" required />
          </div>

          <div>
            <label style={labelStyle}>Description *</label>
            <textarea style={{ ...input, height: 120, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What will learners build and learn?" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={input} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— Select category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select style={input} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#0f172a' }}>
            <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} style={{ width: 18, height: 18 }} />
            Publish immediately (learners can enroll right away)
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => navigate('/instructor/courses')} style={btn(false)}>Cancel</button>
            <button type="submit" disabled={saving} style={btn(true)}>{saving ? 'Creating...' : '🚀 Create Course'}</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

// ─── 3. Instructor Lessons ───────────────────────────────────────────────────
export function InstructorLessons() {
  const params = new URLSearchParams(window.location.search)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(params.get('course_id') || '')
  const [lessons, setLessons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', video_url: '', order: 1, is_preview: false })
  const [saving, setSaving] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)

  useEffect(() => {
    api.get('/courses/list/').then(r => setCourses(r.data.results || r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedCourse) return
    setLoadingLessons(true)
    api.get(`/courses/lessons/?course_id=${selectedCourse}`)
      .then(r => setLessons(r.data.results || r.data || []))
      .finally(() => setLoadingLessons(false))
  }, [selectedCourse])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addLesson = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/courses/lessons/', { ...form, course: selectedCourse })
      setShowForm(false)
      setForm({ title: '', content: '', video_url: '', order: lessons.length + 2, is_preview: false })
      const r = await api.get(`/courses/lessons/?course_id=${selectedCourse}`)
      setLessons(r.data.results || r.data || [])
    } finally {
      setSaving(false)
    }
  }

  const deleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return
    await api.delete(`/courses/lessons/${id}/`)
    setLessons(ls => ls.filter(l => l.id !== id))
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <PageHeader
          title="Lesson Management"
          subtitle="Organize and add lessons for your courses."
          action={selectedCourse && <button onClick={() => setShowForm(s => !s)} style={btn(true)}>+ Add Lesson</button>}
        />

        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Select a course to manage its lessons</label>
          <select style={input} value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setShowForm(false) }}>
            <option value="">— Pick a course —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {showForm && (
          <form onSubmit={addLesson} style={{ ...card, marginBottom: '1.25rem', display: 'grid', gap: '1rem', border: '2px solid #2563eb' }}>
            <h3 style={{ fontWeight: 900, color: '#0f172a' }}>New Lesson</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Lesson Title *</label>
                <input style={input} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Building Your First Component" required />
              </div>
              <div>
                <label style={labelStyle}>Order</label>
                <input style={input} type="number" value={form.order} onChange={e => setF('order', Number(e.target.value))} min={1} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Video URL (YouTube embed or direct)</label>
              <input style={input} value={form.video_url} onChange={e => setF('video_url', e.target.value)} placeholder="https://www.youtube.com/embed/..." />
            </div>
            <div>
              <label style={labelStyle}>Content (Markdown supported)</label>
              <textarea style={{ ...input, height: 140, resize: 'vertical', fontFamily: 'monospace' }} value={form.content} onChange={e => setF('content', e.target.value)} placeholder="Write lesson content here..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_preview} onChange={e => setF('is_preview', e.target.checked)} />
              Free preview (visible before enrollment)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={btn(false)}>Cancel</button>
              <button type="submit" disabled={saving} style={btn(true)}>{saving ? 'Saving...' : 'Save Lesson'}</button>
            </div>
          </form>
        )}

        {selectedCourse && (
          loadingLessons ? (
            <div style={{ ...card, textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <div style={card}><EmptyState icon="🎬" message="No lessons yet. Add the first lesson above." /></div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[...lessons].sort((a, b) => a.order - b.order).map(lesson => (
                <div key={lesson.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>
                      {lesson.order}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{lesson.title}</div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {lesson.video_url && <span>🎥 Video</span>}
                        {lesson.is_preview && <Badge text="Free Preview" ok />}
                        {lesson.content && <span>📄 Content</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => deleteLesson(lesson.id)} style={{ ...btn(false), color: '#dc2626', borderColor: '#fca5a5' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  )
}

// ─── 4. Instructor Assignments ───────────────────────────────────────────────
export function InstructorAssignments() {
  const params = new URLSearchParams(window.location.search)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(params.get('course_id') || '')
  const [assignments, setAssignments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', points: 100 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/courses/list/').then(r => setCourses(r.data.results || r.data || []))
  }, [])

  const loadAssignments = (courseId) => {
    if (!courseId) return
    api.get(`/courses/assignments/?course_id=${courseId}`).then(r => setAssignments(r.data.results || r.data || []))
  }

  useEffect(() => { loadAssignments(selectedCourse) }, [selectedCourse])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const createAssignment = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/courses/assignments/', { ...form, course: selectedCourse })
      setShowForm(false)
      setForm({ title: '', description: '', due_date: '', points: 100 })
      loadAssignments(selectedCourse)
    } finally {
      setSaving(false)
    }
  }

  const deleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    await api.delete(`/courses/assignments/${id}/`)
    setAssignments(as => as.filter(a => a.id !== id))
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <PageHeader
          title="Assignments"
          subtitle="Create and manage assignments for your learners."
          action={selectedCourse && <button onClick={() => setShowForm(s => !s)} style={btn(true)}>+ New Assignment</button>}
        />

        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Select a course</label>
          <select style={input} value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setShowForm(false) }}>
            <option value="">— Pick a course —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {showForm && (
          <form onSubmit={createAssignment} style={{ ...card, marginBottom: '1.25rem', display: 'grid', gap: '1rem', border: '2px solid #2563eb' }}>
            <h3 style={{ fontWeight: 900, color: '#0f172a' }}>New Assignment</h3>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={input} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Build a responsive portfolio page" required />
            </div>
            <div>
              <label style={labelStyle}>Description / Instructions</label>
              <textarea style={{ ...input, height: 110, resize: 'vertical' }} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Describe what learners need to do..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type="datetime-local" style={input} value={form.due_date} onChange={e => setF('due_date', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Points</label>
                <input type="number" style={input} value={form.points} onChange={e => setF('points', Number(e.target.value))} min={1} max={1000} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={btn(false)}>Cancel</button>
              <button type="submit" disabled={saving} style={btn(true)}>{saving ? 'Saving...' : 'Create Assignment'}</button>
            </div>
          </form>
        )}

        {selectedCourse && (
          assignments.length === 0 ? (
            <div style={card}><EmptyState icon="📝" message="No assignments yet. Create one above." /></div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {assignments.map(a => (
                <div key={a.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                      {a.due_date && <span>📅 Due {new Date(a.due_date).toLocaleDateString()}</span>}
                      <span>⭐ {a.points} pts</span>
                    </div>
                  </div>
                  <button onClick={() => deleteAssignment(a.id)} style={{ ...btn(false), color: '#dc2626', borderColor: '#fca5a5' }}>Delete</button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  )
}

// ─── 5. Instructor Students ──────────────────────────────────────────────────
export function InstructorStudents() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/instructor/')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title="Student Roster" subtitle="Enrollment and progress across your courses." />

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
        ) : !data ? (
          <div style={card}><EmptyState icon="⚠️" message="Could not load student data." /></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Unique Learners', value: data.total_enrollments, icon: '👥' },
                { label: 'Avg Completion', value: `${Math.round(data.avg_completion || 0)}%`, icon: '🎯' },
                { label: 'Pending Reviews', value: data.pending_reviews, icon: '📝' },
              ].map(s => (
                <div key={s.label} style={{ ...card, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <h2 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem' }}>Per-Course Breakdown</h2>
              {data.course_stats?.length === 0 ? (
                <EmptyState icon="📚" message="No course data available yet." />
              ) : (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {data.course_stats?.map((course, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{course.title}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                          {course.enrollment_count} students · {Math.round(course.avg_progress || 0)}% avg progress
                        </span>
                      </div>
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${course.avg_progress || 0}%`, height: '100%', background: 'linear-gradient(90deg,#1d4ed8,#2563eb)', borderRadius: 999, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── 6. Instructor Submissions ───────────────────────────────────────────────
export function InstructorSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState({}) // id -> {score, feedback}
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    api.get('/courses/submissions/').then(r => setSubmissions(r.data.results || r.data || [])).finally(() => setLoading(false))
  }, [])

  const openReview = (sub) => {
    setReviewing(r => ({ ...r, [sub.id]: { score: sub.score || '', feedback: sub.feedback || '' } }))
  }

  const submitReview = async (sub, statusVal) => {
    const rv = reviewing[sub.id]
    if (!rv) return
    setSaving(sub.id)
    try {
      const updated = await api.patch(`/courses/submissions/${sub.id}/`, { score: rv.score, feedback: rv.feedback, status: statusVal })
      setSubmissions(ss => ss.map(s => s.id === sub.id ? updated.data : s))
      setReviewing(r => { const n = { ...r }; delete n[sub.id]; return n })
    } finally {
      setSaving(null)
    }
  }

  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title="Student Submissions" subtitle="Review and grade learner work." />

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div style={card}><EmptyState icon="📬" message="No submissions yet." /></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {submissions.map(sub => {
              const rv = reviewing[sub.id]
              const isSaving = saving === sub.id
              return (
                <div key={sub.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '0.2rem' }}>
                        {sub.learner_name}
                        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.88rem' }}> · {sub.assignment_title}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Submitted {new Date(sub.submitted_at).toLocaleString()}
                        {sub.score != null && <span> · Score: <strong>{sub.score}</strong></span>}
                      </div>
                    </div>
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, background: `${statusColor[sub.status]}20`, color: statusColor[sub.status] }}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.9rem', color: '#334155', marginBottom: '1rem', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'hidden', borderLeft: '3px solid #2563eb' }}>
                    {sub.content || '(No content submitted)'}
                  </div>

                  {rv ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '0.75rem' }}>
                        <div>
                          <label style={labelStyle}>Score</label>
                          <input type="number" style={input} value={rv.score} onChange={e => setReviewing(r => ({ ...r, [sub.id]: { ...r[sub.id], score: e.target.value } }))} placeholder="0–100" min={0} max={100} />
                        </div>
                        <div>
                          <label style={labelStyle}>Feedback</label>
                          <input style={input} value={rv.feedback} onChange={e => setReviewing(r => ({ ...r, [sub.id]: { ...r[sub.id], feedback: e.target.value } }))} placeholder="Write a note to the learner..." />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => submitReview(sub, 'approved')} disabled={isSaving} style={{ ...btn(true), background: '#10b981' }}>{isSaving ? '...' : '✅ Approve'}</button>
                        <button onClick={() => submitReview(sub, 'rejected')} disabled={isSaving} style={{ ...btn(false), color: '#dc2626', borderColor: '#fca5a5' }}>{isSaving ? '...' : '❌ Reject'}</button>
                        <button onClick={() => setReviewing(r => { const n = { ...r }; delete n[sub.id]; return n })} style={btn(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openReview(sub)} style={btn(false)}>
                      {sub.status === 'pending' ? '✏️ Review' : '✏️ Edit Review'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── 7. Instructor Certificates ──────────────────────────────────────────────
export function InstructorCertificates() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all certificates; the backend CertificateViewSet filters by learner,
    // so we pull instructor data from the dashboard for context
    api.get('/courses/certificates/')
      .then(r => setCerts(r.data.results || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <PageHeader title="Certificate Management" subtitle="Certificates issued to your learners." />

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading certificates...</div>
        ) : certs.length === 0 ? (
          <div style={card}><EmptyState icon="🏅" message="No certificates issued yet. Learners earn them on course completion." /></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ ...card, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              🏅 {certs.length} certificate{certs.length !== 1 ? 's' : ''} issued across your courses
            </div>
            {certs.map(c => (
              <div key={c.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{c.learner_name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.88rem' }}>{c.course_title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                    Issued {new Date(c.issued_at).toLocaleDateString()} · ID: {c.credential_id}
                  </div>
                </div>
                <Badge text="Verified" ok />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// ─── 8. Instructor Messages ──────────────────────────────────────────────────
export function InstructorMessages() {
  const [threads, setThreads] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadThreads = () => {
    api.get('/messages/').then(r => {
      const data = r.data.results || r.data || []
      setThreads(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadThreads() }, [])

  const openThread = (thread) => {
    setSelected(thread)
    api.get(`/messages/thread/${thread.recipient_id || thread.id}/`)
      .then(r => setMessages(r.data.results || r.data || []))
      .catch(() => setMessages([]))
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected) return
    setSending(true)
    try {
      await api.post('/messages/', { recipient: selected.recipient_id || selected.id, content: text })
      setText('')
      openThread(selected)
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title="Messages" subtitle="Communicate with your learners." />
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', height: 540 }}>
          {/* Sidebar */}
          <div style={{ ...card, overflow: 'auto', padding: '1rem' }}>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : threads.length === 0 ? (
              <EmptyState icon="💬" message="No conversations yet." />
            ) : (
              threads.map((t, i) => (
                <button key={i} onClick={() => openThread(t)} style={{
                  width: '100%', textAlign: 'left', background: selected?.id === t.id ? '#eff6ff' : 'transparent',
                  border: 'none', borderRadius: '0.75rem', padding: '0.85rem', cursor: 'pointer', marginBottom: '0.3rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{t.other_user || t.recipient_name || 'Learner'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {t.last_message || t.content || '—'}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#64748b' }}>
                <EmptyState icon="💬" message="Select a conversation to start messaging." />
              </div>
            ) : (
              <>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#0f172a' }}>
                  {selected.other_user || selected.recipient_name || 'Learner'}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.length === 0 ? (
                    <EmptyState icon="💬" message="No messages in this thread yet." />
                  ) : messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.is_mine || m.sender_role === 'instructor' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.9rem',
                        background: m.is_mine || m.sender_role === 'instructor' ? '#2563eb' : '#f1f5f9',
                        color: m.is_mine || m.sender_role === 'instructor' ? '#fff' : '#0f172a',
                      }}>
                        {m.content}
                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.3rem' }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                  <input style={{ ...input, marginBottom: 0 }} value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
                  <button type="submit" disabled={sending || !text.trim()} style={btn(true)}>{sending ? '...' : 'Send'}</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ─── 9. Instructor Analytics ─────────────────────────────────────────────────
export function InstructorAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/instructor/').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title="Analytics" subtitle="Understand how learners engage with your content." />

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading analytics...</div>
        ) : !data ? (
          <div style={card}><EmptyState icon="⚠️" message="Could not load analytics." /></div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
              {[
                { label: 'Active Learners', value: data.total_enrollments, icon: '👥', color: '#2563eb' },
                { label: 'Courses Teaching', value: data.total_courses, icon: '📚', color: '#10b981' },
                { label: 'Avg Completion', value: `${Math.round(data.avg_completion || 0)}%`, icon: '🎯', color: '#8b5cf6' },
                { label: 'Pending Reviews', value: data.pending_reviews, icon: '📝', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '0.75rem', background: `${s.color}15`, display: 'inline-block', marginBottom: '0.75rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-course progress */}
            <div style={card}>
              <h2 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>Course Performance</h2>
              {!data.course_stats?.length ? (
                <EmptyState icon="📊" message="No course data yet." />
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {data.course_stats.map((course, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{course.title}</span>
                          <span style={{ marginLeft: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>{course.enrollment_count} learners</span>
                        </div>
                        <span style={{ fontWeight: 900, color: '#2563eb' }}>{Math.round(course.avg_progress || 0)}%</span>
                      </div>
                      <div style={{ height: 12, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${course.avg_progress || 0}%`, height: '100%', background: 'linear-gradient(90deg,#1d4ed8 0%,#2563eb 70%,#f59e0b 100%)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div style={card}>
              <h2 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem' }}>Recent Activity</h2>
              {!data.recent_activity?.length ? (
                <EmptyState icon="📭" message="No recent activity." />
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {data.recent_activity.map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: '#f8fafc' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>
                        {(act.user || 'L')[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          <strong>{act.user}</strong> {act.action}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
