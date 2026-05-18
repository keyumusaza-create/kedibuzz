import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.25rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  padding: '1.5rem',
}

const btn = (primary) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  padding: '0.75rem 1.25rem',
  borderRadius: '0.75rem',
  border: primary ? 'none' : '1.5px solid #e2e8f0',
  background: primary ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : '#fff',
  color: primary ? '#fff' : '#0f172a',
  fontWeight: 800,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
})

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginTop: '0.4rem',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block',
  fontWeight: 800,
  color: '#334155',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

export default function CourseBuilder() {
  const navigate = useNavigate()
  const { course_id } = useParams()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState(null)
  
  const steps = [
    { num: 1, title: 'Course Info' },
    { num: 2, title: 'Structure' },
    { num: 3, title: 'Lesson Content' },
    { num: 4, title: 'Practice' },
    { num: 5, title: 'Publishing' }
  ]

  useEffect(() => {
    if (course_id) {
      setLoading(true)
      api.get(`/courses/list/${course_id}/`)
        .then(res => setCourse(res.data))
        .finally(() => setLoading(false))
    }
  }, [course_id])

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Navigation */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          <div>
            <Link to="/instructor/courses" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>← Back to Studio</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0 0 0' }}>
              {course ? course.title : 'New Course Studio'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: '2rem' }}>Step {step} of 5</span>
          </div>
        </header>

        {/* Builder Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
          
          {/* Sidebar Progress */}
          <div style={{ ...cardStyle, alignSelf: 'start', padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {steps.map(s => (
                <button 
                  key={s.num}
                  onClick={() => s.num <= step ? setStep(s.num) : null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '0.75rem',
                    border: 'none', cursor: 'pointer',
                    background: step === s.num ? '#eff6ff' : 'transparent',
                    color: step === s.num ? '#2563eb' : (s.num < step ? '#10b981' : '#64748b'),
                    fontWeight: step === s.num ? 900 : 700,
                    textAlign: 'left',
                    opacity: s.num > step && !course ? 0.5 : 1
                  }}
                  disabled={s.num > step && !course}
                >
                  <div style={{ 
                    width: 24, height: 24, borderRadius: '50%', 
                    background: step === s.num ? '#2563eb' : (s.num < step ? '#10b981' : '#e2e8f0'),
                    color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 900
                  }}>
                    {s.num < step ? '✓' : s.num}
                  </div>
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Step Content */}
          <div style={cardStyle}>
            {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading builder...</div> : (
              <>
                {step === 1 && <Step1Info course={course} setCourse={setCourse} onNext={() => setStep(2)} />}
                {step === 2 && <Step2Structure course={course} onNext={() => setStep(3)} />}
                {step === 3 && <Step3Content course={course} onNext={() => setStep(4)} />}
                {step === 4 && <Step4Practice course={course} onNext={() => setStep(5)} />}
                {step === 5 && <Step5Publish course={course} setCourse={setCourse} />}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ─── STEP 1: Course Info ──────────────────────────────────────────────────
function Step1Info({ course, setCourse, onNext }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    difficulty: course?.difficulty || 'beginner',
    start_date: course?.start_date ? course.start_date.slice(0, 16) : '',
    end_date: course?.end_date ? course.end_date.slice(0, 16) : ''
  })
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/courses/categories/').then(r => setCategories(r.data.results || r.data || []))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, category: form.category || null }
    try {
      if (course) {
        const r = await api.patch(`/courses/list/${course.id}/`, payload)
        setCourse(r.data)
        onNext()
      } else {
        const r = await api.post('/courses/list/', payload)
        setCourse(r.data)
        navigate(`/instructor/courses/${r.data.id}/builder`, { replace: true })
        onNext()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>Course Information</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Set up the basics of your new learning experience.</p>
      </div>

      <div>
        <label style={labelStyle}>Course Title *</label>
        <input style={{...inputStyle, fontSize: '1.25rem', fontWeight: 800}} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Master Web Development" required />
      </div>

      <div>
        <label style={labelStyle}>Description *</label>
        <textarea style={{...inputStyle, height: '120px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What will students build and learn?" required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option value="">— Select Category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Difficulty</label>
          <select style={inputStyle} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Enrollment Opens (Start Date)</label>
          <input type="datetime-local" style={inputStyle} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
        </div>
        <div>
          <label style={labelStyle}>Enrollment Closes (End Date)</label>
          <input type="datetime-local" style={inputStyle} value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="submit" disabled={saving} style={btn(true)}>
          {saving ? 'Saving...' : 'Save & Continue →'}
        </button>
      </div>
    </form>
  )
}

// ─── STEP 2: Structure Builder ─────────────────────────────────────────────
function Step2Structure({ course, onNext }) {
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModTitle, setNewModTitle] = useState('')
  const [addingLessonTo, setAddingLessonTo] = useState(null)
  const [newLessonTitle, setNewLessonTitle] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/courses/modules/?course_id=${course.id}`),
      api.get(`/courses/lessons/?course_id=${course.id}`)
    ]).then(([modsRes, lessRes]) => {
      setModules(modsRes.data.results || modsRes.data || [])
      setLessons(lessRes.data.results || lessRes.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [course.id])

  const addModule = async (e) => {
    e.preventDefault()
    if (!newModTitle.trim()) return
    await api.post('/courses/modules/', { course: course.id, title: newModTitle, order: modules.length + 1 })
    setNewModTitle('')
    load()
  }

  const addLesson = async (modId) => {
    if (!newLessonTitle.trim()) return
    const modLessons = lessons.filter(l => l.module === modId)
    await api.post('/courses/lessons/', { course: course.id, module: modId, title: newLessonTitle, order: modLessons.length + 1, content: 'Default lesson content. Start editing in the next step.' })
    setNewLessonTitle('')
    setAddingLessonTo(null)
    load()
  }

  const updateModule = async (id, data) => {
    await api.patch(`/courses/modules/${id}/`, data)
    setModules(ms => ms.map(m => m.id === id ? { ...m, ...data } : m))
  }

  const deleteModule = async (id) => {
    if (!window.confirm("Delete module?")) return
    await api.delete(`/courses/modules/${id}/`)
    load()
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading structure...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>Course Structure</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Organize your course into modules and lessons.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {modules.map((m, i) => {
          const modLessons = lessons.filter(l => l.module === m.id)
          return (
            <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>Module {i + 1}: {m.title}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Release:</span>
                    <input type="number" min="0" style={{ border: 'none', width: '40px', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', outline: 'none' }} value={m.drip_delay_days} onChange={e => updateModule(m.id, { drip_delay_days: parseInt(e.target.value) || 0 })} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>days</span>
                  </div>
                  <button onClick={() => updateModule(m.id, { is_locked: !m.is_locked })} style={{ border: 'none', background: m.is_locked ? '#fee2e2' : '#f0fdf4', color: m.is_locked ? '#dc2626' : '#16a34a', padding: '0.35rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                    {m.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Schedule:</span>
                    <input type="datetime-local" style={{ border: 'none', fontSize: '0.75rem', fontWeight: 700, outline: 'none', color: '#1e293b' }} value={m.release_date ? m.release_date.substring(0, 16) : ''} onChange={e => updateModule(m.id, { release_date: e.target.value || null })} />
                  </div>
                </div>
                <button onClick={() => deleteModule(m.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.5rem' }}>
                {modLessons.map((l, j) => (
                  <div key={l.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '0.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>{j + 1}.</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{l.title}</span>
                  </div>
                ))}
                {addingLessonTo === m.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input autoFocus style={{...inputStyle, marginTop: 0, padding: '0.6rem 0.8rem', fontSize: '0.85rem'}} value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="Lesson Title..." onKeyDown={e => e.key === 'Enter' && addLesson(m.id)} />
                    <button onClick={() => addLesson(m.id)} style={{...btn(true), padding: '0.6rem 1rem', fontSize: '0.85rem'}}>Add</button>
                    <button onClick={() => setAddingLessonTo(null)} style={{...btn(false), padding: '0.6rem 1rem', fontSize: '0.85rem'}}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingLessonTo(m.id)} style={{ ...btn(false), marginTop: '0.5rem', alignSelf: 'start', padding: '0.5rem 0.9rem', fontSize: '0.85rem', color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}>
                    + Add Lesson
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={addModule} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <input style={{...inputStyle, marginTop: 0}} value={newModTitle} onChange={e => setNewModTitle(e.target.value)} placeholder="New Module Title..." />
        <button type="submit" style={{...btn(false), whiteSpace: 'nowrap', border: '1.5px dashed #cbd5e1'}}>+ Add Module</button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
        <button onClick={onNext} style={btn(true)}>Save & Continue →</button>
      </div>
    </div>
  )
}

// ─── STEP 3: Lesson Content ─────────────────────────────────────────────────
function getEmbedUrl(url) {
  if (!url) return null
  if (url.includes('youtube.com/embed/')) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}`
    : url
}

function Step3Content({ course, onNext }) {
  const [lessons, setLessons] = useState([])
  const [modules, setModules] = useState([])
  const [selected, setSelected] = useState(null)
  
  // Lesson edit form
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [requireVideo, setRequireVideo] = useState(false)
  const [requireResources, setRequireResources] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/courses/modules/?course_id=${course.id}`),
      api.get(`/courses/lessons/?course_id=${course.id}`)
    ]).then(([m, l]) => {
      setModules(m.data.results || m.data || [])
      setLessons(l.data.results || l.data || [])
    })
  }, [course.id])

  const selectLesson = (l) => {
    setSelected(l)
    setContent(l.content || '')
    setVideoUrl(l.video_url || '')
    setIsPreview(l.is_preview || false)
    setRequireVideo(l.require_video || false)
    setRequireResources(l.require_resources || false)
    setIsLocked(l.is_locked || false)
  }

  const saveLesson = async () => {
    setSaving(true)
    const data = { 
      content, 
      video_url: videoUrl, 
      is_preview: isPreview,
      require_video: requireVideo,
      require_resources: requireResources,
      is_locked: isLocked
    }
    await api.patch(`/courses/lessons/${selected.id}/`, data)
    setLessons(ls => ls.map(l => l.id === selected.id ? { ...l, ...data } : l))
    setSaving(false)
    window.alert("Saved")
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>Lesson Content</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Add videos, markdown text, and code snippets to your lessons.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', minHeight: '400px' }}>
        {/* Lesson List */}
        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '1.5rem' }}>
          {modules.map(m => (
            <div key={m.id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.title}</div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                {lessons.filter(l => l.module === m.id).map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => selectLesson(l)}
                    style={{ 
                      textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                      background: selected?.id === l.id ? '#eff6ff' : 'transparent',
                      color: selected?.id === l.id ? '#2563eb' : '#334155',
                      fontWeight: selected?.id === l.id ? 700 : 500,
                    }}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div>
          {!selected ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8', fontWeight: 600 }}>Select a lesson to edit content.</div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selected.title}</h3>
              
              <div>
                <label style={labelStyle}>Video URL (Auto-converts from YouTube watch links)</label>
                <input style={inputStyle} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              {videoUrl && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.75rem', background: '#f1f5f9' }}>
                  <iframe 
                    src={getEmbedUrl(videoUrl)} 
                    title="Preview" 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Lesson Content (Markdown)</label>
                <textarea style={{...inputStyle, height: '200px', fontFamily: 'monospace', resize: 'vertical'}} value={content} onChange={e => setContent(e.target.value)} placeholder="# Welcome to the lesson...\n\nWrite your content here." />
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', padding: '1rem', background: '#f8fbff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} />
                  Free Preview (Locked users can watch)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={requireVideo} onChange={e => setRequireVideo(e.target.checked)} />
                  Require Students to Watch Video
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={requireResources} onChange={e => setRequireResources(e.target.checked)} />
                  Require Students to Review Resources
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', fontWeight: 800, color: isLocked ? '#dc2626' : '#16a34a', fontSize: '0.9rem', padding: '0.5rem', background: isLocked ? '#fee2e2' : '#f0fdf4', borderRadius: '0.5rem' }}>
                  <input type="checkbox" checked={isLocked} onChange={e => setIsLocked(e.target.checked)} />
                  {isLocked ? '🔒 Lesson Manually Locked' : '🔓 Lesson Unlocked'}
                </label>
              </div>

              <div>
                <button onClick={saveLesson} disabled={saving} style={{...btn(false), background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe'}}>
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>

              {/* ─── Quiz Management per Lesson ─── */}
              <div style={{ marginTop: '1rem' }}>
                <LessonQuizManager lessonId={selected.id} lessonTitle={selected.title} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
        <button onClick={onNext} style={btn(true)}>Save & Continue →</button>
      </div>
    </div>
  )
}

// ─── Inline Quiz Manager for CourseBuilder ───────────────────────────────────
function LessonQuizManager({ lessonId, lessonTitle }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', explanation: '', order: 1,
  })
  const [saving, setSaving] = useState(false)

  const loadQ = useCallback(() => {
    setLoading(true)
    api.get(`/courses/quiz-questions/?lesson_id=${lessonId}`)
      .then(r => setQuestions(r.data.results || r.data || []))
      .finally(() => setLoading(false))
  }, [lessonId])

  useEffect(() => { loadQ() }, [loadQ])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addQ = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/courses/quiz-questions/', { ...form, lesson: lessonId })
      setShowForm(false)
      setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', order: questions.length + 2 })
      loadQ()
    } finally {
      setSaving(false)
    }
  }

  const deleteQ = async (id) => {
    if (!window.confirm('Delete this quiz question?')) return
    await api.delete(`/courses/quiz-questions/${id}/`)
    setQuestions(qs => qs.filter(q => q.id !== id))
  }

  const inputQ = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '0.6rem',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      padding: '1rem', borderRadius: '1rem', background: '#f5f3ff',
      border: '2px solid #ddd6fe',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed', marginBottom: '0.2rem' }}>Quiz Questions</p>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#6d28d9' }}>
            🧠 {questions.length} question{questions.length !== 1 ? 's' : ''}
          </h4>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: '0.4rem 0.9rem', borderRadius: '0.6rem', border: 'none',
          background: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: '0.78rem',
          cursor: 'pointer',
        }}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addQ} style={{
          display: 'grid', gap: '0.6rem', marginBottom: '0.75rem',
          padding: '0.75rem', background: '#fff', borderRadius: '0.75rem',
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.78rem' }}>Question *</label>
            <textarea style={{ ...inputQ, height: 55, resize: 'vertical' }}
              value={form.question} onChange={e => setF('question', e.target.value)}
              placeholder="e.g. What is React?" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, i) => (
              <div key={opt}>
                <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', fontSize: '0.72rem' }}>
                  {['A', 'B', 'C', 'D'][i]} {i < 2 ? '*' : ''}
                </label>
                <input style={inputQ} value={form[opt]} onChange={e => setF(opt, e.target.value)}
                  placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`} required={i < 2} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', fontSize: '0.72rem' }}>Correct *</label>
              <select style={inputQ} value={form.correct_answer} onChange={e => setF('correct_answer', e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', fontSize: '0.72rem' }}>Order</label>
              <input type="number" style={inputQ} value={form.order} onChange={e => setF('order', Number(e.target.value))} min={1} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', fontSize: '0.72rem' }}>Explanation</label>
            <textarea style={{ ...inputQ, height: 45, resize: 'vertical' }}
              value={form.explanation} onChange={e => setF('explanation', e.target.value)}
              placeholder="Explain the correct answer..." />
          </div>
          <button type="submit" disabled={saving} style={{
            padding: '0.45rem 0.9rem', borderRadius: '0.6rem', border: 'none',
            background: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: '0.78rem',
            cursor: saving ? 'not-allowed' : 'pointer', justifySelf: 'end',
          }}>
            {saving ? 'Saving...' : 'Save Question'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Loading...</div>
      ) : questions.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>No questions yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 0.7rem', background: '#fff', borderRadius: '0.5rem',
              fontSize: '0.82rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {i + 1}. {q.question.substring(0, 70)}{q.question.length > 70 ? '...' : ''}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>✓ {q.correct_answer}</div>
              </div>
              <button onClick={() => deleteQ(q.id)} style={{
                padding: '0.25rem 0.6rem', borderRadius: '0.4rem',
                border: '1.5px solid #fca5a5', background: '#fff',
                color: '#dc2626', fontWeight: 700, fontSize: '0.72rem',
                cursor: 'pointer',
              }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── STEP 4: Practice ───────────────────────────────────────────────────────
function Step4Practice({ course, onNext }) {
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState({ title: '', description: '', points: 100 })
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get(`/courses/assignments/?course_id=${course.id}`).then(r => {
      setAssignments(r.data.results || r.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [course.id])

  const createAss = async (e) => {
    e.preventDefault()
    await api.post('/courses/assignments/', { ...form, course: course.id })
    setForm({ title: '', description: '', points: 100 })
    load()
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Practice & Assignments</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Add assignments for learners to practice what they learned.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {assignments.map(a => (
          <div key={a.id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '1rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{a.title}</h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{a.points} pts</span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>{a.description}</p>
          </div>
        ))}
      </div>

      <form onSubmit={createAss} style={{ padding: '1.25rem', border: '2px dashed #cbd5e1', borderRadius: '1rem', display: 'grid', gap: '1rem' }}>
        <h4 style={{ margin: 0, fontWeight: 800, color: '#334155' }}>Create New Assignment</h4>
        <input style={{...inputStyle, marginTop: 0}} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Title" required />
        <textarea style={{...inputStyle, height: 80, resize: 'vertical', marginTop: 0}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Instructions..." required />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input type="number" style={{...inputStyle, marginTop: 0, width: 120}} value={form.points} onChange={e => setForm({...form, points: e.target.value})} placeholder="Points" />
          <button type="submit" style={btn(false)}>+ Add Assignment</button>
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
        <button onClick={onNext} style={btn(true)}>Finish & Review →</button>
      </div>
    </div>
  )
}

// ─── STEP 5: Publishing ─────────────────────────────────────────────────────
function Step5Publish({ course, setCourse }) {
  const navigate = useNavigate()
  const [publishing, setPublishing] = useState(false)

  const togglePublish = async () => {
    setPublishing(true)
    const r = await api.patch(`/courses/list/${course.id}/`, { is_published: !course.is_published })
    setCourse(r.data)
    setPublishing(false)
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a', marginBottom: '0.5rem' }}>Ready to Launch?</h2>
      <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
        Your course <strong>"{course.title}"</strong> is fully drafted and ready for the world. You can publish it now or keep it as a draft.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={togglePublish} disabled={publishing} style={{ ...btn(course.is_published ? false : true), minWidth: '180px' }}>
          {publishing ? 'Updating...' : course.is_published ? 'Unpublish Course' : 'Publish Course'}
        </button>
        <button onClick={() => navigate('/instructor/courses')} style={btn(course.is_published ? true : false)}>
          Return to Studio
        </button>
      </div>

      <div style={{ marginTop: '2rem', display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '1rem', background: course.is_published ? '#ecfdf5' : '#fff7ed', color: course.is_published ? '#059669' : '#ea580c', fontWeight: 800 }}>
        Status: {course.is_published ? 'Live (Available to learners)' : 'Draft (Hidden from catalog)'}
      </div>
    </div>
  )
}
