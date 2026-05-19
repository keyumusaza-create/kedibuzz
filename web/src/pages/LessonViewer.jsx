import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import LessonQuiz from '../components/LessonQuiz'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import api from '../services/api'

function markdownToHtml(markdown = '') {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
}

function getEmbedUrl(url) {
  if (!url) return null
  if (url.includes('youtube.com/embed/')) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}`
    : url
}

// ─── Inline Instructor Quiz Manager ──────────────────────────────────────────
function InstructorQuizPanel({ lessonId }) {
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

  return (
    <section className="glass-card" style={{
      borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.5rem)',
      border: '2px solid #ddd6fe', background: '#f5f3ff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed', marginBottom: '0.2rem' }}>Instructor Tools</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#6d28d9', margin: 0 }}>
            🧠 Lesson Quiz Questions ({questions.length})
          </h3>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none',
          background: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: '0.8rem',
          cursor: 'pointer',
        }}>
          {showForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addQ} style={{
          display: 'grid', gap: '0.7rem', marginBottom: '1rem',
          padding: '1rem', background: '#fff', borderRadius: '1rem',
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', fontSize: '0.82rem' }}>Question *</label>
            <textarea style={{
              width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.6rem',
              border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
              boxSizing: 'border-box', height: 60, resize: 'vertical',
            }}
              value={form.question} onChange={e => setF('question', e.target.value)}
              placeholder="e.g. What is the main purpose of React hooks?" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, i) => (
              <div key={opt}>
                <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', fontSize: '0.78rem' }}>
                  Option {['A', 'B', 'C', 'D'][i]} {i < 2 ? '*' : ''}
                </label>
                <input style={{
                  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
                  border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
                  value={form[opt]} onChange={e => setF(opt, e.target.value)}
                  placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`} required={i < 2} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', fontSize: '0.78rem' }}>Correct Answer *</label>
              <select style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
                border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box',
              }} value={form.correct_answer} onChange={e => setF('correct_answer', e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', fontSize: '0.78rem' }}>Order</label>
              <input type="number" style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
                border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box',
              }} value={form.order} onChange={e => setF('order', Number(e.target.value))} min={1} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', fontSize: '0.78rem' }}>Explanation</label>
            <textarea style={{
              width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
              border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none',
              boxSizing: 'border-box', height: 50, resize: 'vertical',
            }}
              value={form.explanation} onChange={e => setF('explanation', e.target.value)}
              placeholder="Explain why the correct answer is right..." />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} style={{
              padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none',
              background: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: '0.8rem',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No quiz questions yet. Add one above.</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0.8rem', background: '#fff', borderRadius: '0.6rem',
              fontSize: '0.85rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.15rem' }}>
                  {i + 1}. {q.question.substring(0, 80)}{q.question.length > 80 ? '...' : ''}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  ✓ {q.correct_answer} · {[q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean).length} options
                </div>
              </div>
              <button onClick={() => deleteQ(q.id)} style={{
                padding: '0.3rem 0.7rem', borderRadius: '0.5rem',
                border: '1.5px solid #fca5a5', background: '#fff',
                color: '#dc2626', fontWeight: 700, fontSize: '0.75rem',
                cursor: 'pointer',
              }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Main LessonViewer Component ─────────────────────────────────────────────
export default function LessonViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  const [videoProgress, setVideoProgress] = useState(0)
  const [reviewedResources, setReviewedResources] = useState([])

  // Quiz gating state
  const [quizState, setQuizState] = useState(null) // { total, attempted, correct, allCorrect, attemptedAll }
  const [hasQuiz, setHasQuiz] = useState(false)

  const isInstructor = user?.role === 'admin' || user?.role === 'instructor'
  const isLearner = user?.role === 'learner'

  const handleQuizChange = (state) => {
    if (state === null) {
      // No quiz questions for this lesson — ensure unlocked
      setQuizState(null)
      setHasQuiz(false)
    } else {
      setQuizState(state)
      setHasQuiz(true)
    }
  }

  useEffect(() => {
    api.get(`/courses/lessons/${id}/`)
      .then((response) => {
        setLesson(response.data)
        setVideoProgress(0)
        setReviewedResources([])
        setQuizState(null)
        setHasQuiz(false)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (lesson?.require_video && lesson.video_url && videoProgress < 100) {
      const interval = setInterval(() => {
        setVideoProgress(prev => Math.min(prev + 5, 100))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lesson, videoProgress])

  // For learners: completion requires quiz passed (if quiz exists)
  const quizUnlocked = !hasQuiz || (quizState?.allCorrect === true)
  const canComplete = !lesson ? false : (
    (!lesson.require_video || videoProgress >= 100) &&
    (!lesson.require_resources || (lesson.resources || []).every(r => reviewedResources.includes(resourceKey(r)))) &&
    (!isLearner || quizUnlocked) // Learners need quiz passed
  )

  function resourceKey(r) { return `${r.label}-${r.type}` }

  const handleResourceClick = (resource) => {
    const key = resourceKey(resource)
    if (!reviewedResources.includes(key)) {
      setReviewedResources(prev => [...prev, key])
    }
    
    if (resource.file_url) {
      window.open(resource.file_url, '_blank')
    } else if (resource.content) {
      alert(resource.content) // Basic for now, could be a modal
    }
  }

  const completeLesson = async () => {
    if (!canComplete) return
    setMarking(true)
    try {
      const response = await api.post(`/courses/lessons/${id}/complete/`)
      setLesson(response.data)
      if (response.data.certificate_earned) {
        setShowCertificateModal(true)
      }
    } finally {
      setMarking(false)
    }
  }

  if (loading) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Loading lesson...</div></Layout>
  if (!lesson) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Lesson not found.</div></Layout>

  // Drip content access control
  if (!lesson.module_is_available && user?.role === 'learner') {
    return (
      <Layout>
        <div style={{ 
          background: '#fff', padding: '4rem 2rem', borderRadius: '2rem', 
          textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
          maxWidth: 600, margin: '4rem auto' 
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
          <h1 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
            {lesson.module_available_at ? 'This lesson is still locked' : 'Content temporarily unavailable'}
          </h1>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
            {lesson.module_available_at ? (
              <>
                To ensure the best learning rhythm, this module will be released on:<br />
                <strong style={{ color: '#6366f1', fontSize: '1.2rem' }}>
                  {new Date(lesson.module_available_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                </strong>
              </>
            ) : (
              "This content has been manually locked by the instructor. Please check back later or contact support if you believe this is an error."
            )}
          </p>
          <Link to={`/courses/${lesson.course}`} style={{ 
            display: 'inline-block', padding: '0.9rem 2rem', background: '#0f172a', 
            color: '#fff', borderRadius: '1rem', fontWeight: 800, textDecoration: 'none' 
          }}>
            Return to course overview
          </Link>
        </div>
      </Layout>
    )
  }

  // Determine why the button is disabled for learners
  let completeButtonText = 'Complete Lesson'
  if (isLearner && !lesson.is_completed) {
    if (!canComplete) {
      if (hasQuiz && !quizUnlocked) {
        completeButtonText = 'Pass the Quiz First'
      } else if (lesson.require_video && videoProgress < 100) {
        completeButtonText = 'Watch the Video First'
      } else if (lesson.require_resources && !(lesson.resources || []).every(r => reviewedResources.includes(resourceKey(r)))) {
        completeButtonText = 'Review All Resources First'
      } else {
        completeButtonText = 'Complete Required Steps'
      }
    }
  }

  return (
    <Layout>
      {showCertificateModal && lesson.certificate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '1.5rem', padding: '2rem',
            width: '90%', maxWidth: 400, textAlign: 'center',
            border: '5px solid #1d4ed8',
            outline: '2px solid #f59e0b',
            outlineOffset: '-7px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 6,
              background: 'linear-gradient(90deg, #1d4ed8 0%, #f59e0b 100%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
              background: 'linear-gradient(90deg, #f59e0b 0%, #1d4ed8 100%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <img
                src={`${import.meta.env.BASE_URL}kedi-logo.png`}
                alt="KEDI"
                style={{ width: 50, height: 'auto', marginBottom: '0.5rem' }}
              />
              <div style={{
                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                color: '#1d4ed8', fontWeight: 800, marginBottom: '0.4rem',
              }}>KEDI Developer Hub</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Certificate of Completion</h2>
              <p style={{ color: '#51657f', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.9rem' }}>
                {lesson.course_title}
              </p>
              <div style={{
                display: 'flex', justifyContent: 'center', marginBottom: '0.75rem',
              }}>
                <div style={{
                  background: '#fff', padding: '0.4rem', borderRadius: '0.5rem',
                  border: '2px solid #1d4ed8', display: 'inline-block',
                }}>
                  {lesson.certificate.verification_url && (
                    <QRCodeSVG
                      value={lesson.certificate.verification_url}
                      size={70}
                      level="M"
                      fgColor="#1d4ed8"
                    />
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '0.3rem', color: '#51657f', textAlign: 'left', fontSize: '0.85rem' }}>
                <div><strong style={{ color: '#0f172a' }}>Credential ID:</strong> {lesson.certificate.credential_id}</div>
                <div><strong style={{ color: '#0f172a' }}>Learner:</strong> {lesson.certificate.learner_name}</div>
                <div><strong style={{ color: '#0f172a' }}>Issued:</strong> {new Date(lesson.certificate.issued_at).toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => { setShowCertificateModal(false); window.open(`/certificate/${lesson.certificate.id}`, '_blank') }}
                style={{
                  marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)',
                  color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.85rem', marginRight: '0.5rem',
                }}
              >
                View Certificate
              </button>
              <button onClick={() => setShowCertificateModal(false)} style={{
                marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                background: '#f1f5f9', color: '#0f172a', border: 'none', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.85rem',
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Top bar */}
        <div className="stack-mobile" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to={`/courses/${lesson.course}`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 800 }}>← Back to course</Link>
          {!lesson.is_completed && (
            <button
              onClick={completeLesson}
              disabled={marking || !canComplete}
              style={{
                border: 'none', borderRadius: '999px', padding: '0.85rem 1.4rem', fontWeight: 800,
                background: canComplete ? '#0f172a' : '#cbd5e1',
                color: '#fff', cursor: canComplete ? 'pointer' : 'not-allowed', width: 'auto',
                transition: 'all 0.3s ease',
              }}
            >
              {marking ? 'Saving progress...' : completeButtonText}
            </button>
          )}
        </div>

        {/* Checkpoint Requirements Card */}
        {!lesson.is_completed && (lesson.require_video || lesson.require_resources || (isLearner && hasQuiz)) && (
          <section className="glass-card" style={{ padding: '1rem 1.5rem', borderRadius: '1.2rem', background: '#f8fbff', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>Completion Checklist:</h3>
              {lesson.require_video && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 100, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${videoProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: videoProgress >= 100 ? '#16a34a' : '#64748b' }}>
                    {videoProgress >= 100 ? '✓ Video Watched' : `Video Progress: ${videoProgress}%`}
                  </span>
                </div>
              )}
              {lesson.require_resources && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: reviewedResources.length === (lesson.resources || []).length ? '#16a34a' : '#64748b' }}>
                    {reviewedResources.length === (lesson.resources || []).length ? '✓ Resources Reviewed' : `Resources: ${reviewedResources.length}/${(lesson.resources || []).length} checked`}
                  </span>
                </div>
              )}
              {isLearner && hasQuiz && (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: quizUnlocked ? '#16a34a' : '#ea580c' }}>
                  {quizUnlocked ? '✓ Quiz Passed' : `🧠 Quiz: ${quizState?.correct || 0}/${quizState?.total || 0} correct`}
                </span>
              )}
            </div>
          </section>
        )}

        {/* Lesson header */}
        <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1.2rem, 5vw, 1.6rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>{lesson.course_title}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.7rem)', lineHeight: 1.1, color: '#0f172a', fontWeight: 900, marginBottom: '0.55rem' }}>{lesson.title}</h1>
          <p style={{ color: lesson.is_completed ? '#16a34a' : '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
            {lesson.is_completed ? 'Completed and progress saved.' : 'Watch, read, and apply the lesson, then save your progress.'}
          </p>
        </section>

        {/* Main content + sidebar */}
        <div className="responsive-cols">
          <section className="glass-card" style={{ horizontal: '1.5rem', padding: 'clamp(1rem, 4vw, 1.5rem)', borderRadius: '1.5rem', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
            {lesson.video_url && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem', marginBottom: '1.2rem', background: '#0f172a' }}>
                <iframe src={getEmbedUrl(lesson.video_url)} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            )}
            <div style={{ color: '#334155', lineHeight: 1.75, fontSize: '0.95rem' }}>
              <div dangerouslySetInnerHTML={{ __html: `<p>${markdownToHtml(lesson.content)}</p>` }} />
            </div>

            {/* ─── INSTRUCTOR: Quiz management inline below content ─── */}
            {isInstructor && (
              <div style={{ marginTop: '2rem' }}>
                <InstructorQuizPanel lessonId={id} />
              </div>
            )}

            {/* ─── LEARNER: Quiz inline below content ─── */}
            {isLearner && !lesson.is_completed && (
              <div style={{ marginTop: '2rem' }}>
                <LessonQuiz lessonId={id} onQuizChange={handleQuizChange} />
              </div>
            )}

            {/* If lesson already completed, show quiz as review */}
            {isLearner && lesson.is_completed && (
              <div style={{ marginTop: '2rem' }}>
                <LessonQuiz lessonId={id} onQuizChange={handleQuizChange} />
              </div>
            )}
          </section>

          <aside style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.4rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.8rem', fontSize: '1.1rem' }}>Resources</h2>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {(lesson.resources || []).map((resource) => (
                  <div
                    key={resource.label}
                    onClick={() => handleResourceClick(resource)}
                    style={{
                      padding: '0.85rem 0.95rem', borderRadius: '1rem',
                      background: reviewedResources.includes(resourceKey(resource)) ? '#f0fdf4' : '#f8fbff',
                      border: reviewedResources.includes(resourceKey(resource)) ? '1px solid #bbfcce' : '1px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                      {resource.title || resource.label}
                      {reviewedResources.includes(resourceKey(resource)) && <span style={{ color: '#16a34a' }}>✓</span>}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{resource.resource_type || resource.type}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card" style={{ borderRadius: '1.5rem', padding: 'clamp(1rem, 4vw, 1.4rem)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.8rem', fontSize: '1.1rem' }}>Lesson Navigation</h2>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                <button onClick={() => lesson.previous_lesson_id && navigate(`/lessons/${lesson.previous_lesson_id}`)} disabled={!lesson.previous_lesson_id} style={{ border: '1px solid #dbeafe', background: '#fff', color: lesson.previous_lesson_id ? '#1d4ed8' : '#94a3b8', borderRadius: '1rem', padding: '0.85rem 1rem', fontWeight: 800, cursor: lesson.previous_lesson_id ? 'pointer' : 'not-allowed' }}>Previous lesson</button>

                {/* If last lesson (no next_lesson_id), show "Mark Complete" button */}
                {!lesson.next_lesson_id ? (
                  <button
                    onClick={completeLesson}
                    disabled={marking || !canComplete}
                    style={{
                      border: 'none',
                      background: canComplete ? '#16a34a' : '#cbd5e1',
                      color: '#fff', borderRadius: '1rem', padding: '0.85rem 1rem', fontWeight: 800,
                      cursor: canComplete ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {marking ? 'Saving...' : (canComplete ? '✅ Mark Complete' : completeButtonText)}
                  </button>
                ) : (
                  <button
                    onClick={() => lesson.next_lesson_id && navigate(`/lessons/${lesson.next_lesson_id}`)}
                    disabled={!lesson.next_lesson_id || (!lesson.is_completed && !canComplete)}
                    style={{
                      border: 'none',
                      background: (lesson.next_lesson_id && (lesson.is_completed || canComplete)) ? '#0f172a' : '#cbd5e1',
                      color: '#fff', borderRadius: '1rem', padding: '0.85rem 1rem', fontWeight: 800,
                      cursor: (lesson.next_lesson_id && (lesson.is_completed || canComplete)) ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Next lesson
                  </button>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  )
}