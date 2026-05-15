import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

function markdownToHtml(markdown = '') {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
}

export default function LessonViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  useEffect(() => {
    api.get(`/courses/lessons/${id}/`)
      .then((response) => setLesson(response.data))
      .finally(() => setLoading(false))
  }, [id])

  const completeLesson = async () => {
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

  return (
    <Layout>
      {showCertificateModal && lesson.certificate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: '1.5rem', 
            padding: '2rem', 
            width: '90%', 
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '0.78rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.14em', 
              color: '#1d4ed8', 
              fontWeight: 800, 
              marginBottom: '0.5rem' 
            }}>KEDI Developer Hub</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Certificate of Completion</h2>
            <p style={{ color: '#51657f', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {lesson.course_title}
            </p>
            <div style={{ 
              display: 'grid', 
              gap: '0.5rem', 
              color: '#51657f',
              textAlign: 'left'
            }}>
              <div><strong>Credential ID:</strong> {lesson.certificate.credential_id}</div>
              <div><strong>Learner:</strong> {lesson.certificate.learner_name}</div>
              <div><strong>Issued:</strong> {new Date(lesson.certificate.issued_at).toLocaleDateString()}</div>
            </div>
            <button
              onClick={() => setShowCertificateModal(false)}
              style={{ 
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.75rem', 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 700, 
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to={`/courses/${lesson.course}`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 800 }}>← Back to course</Link>
          {!lesson.is_completed && (
            <button onClick={completeLesson} disabled={marking} style={{ border: 'none', borderRadius: '999px', padding: '0.85rem 1rem', fontWeight: 800, background: '#0f172a', color: '#fff', cursor: 'pointer' }}>
              {marking ? 'Saving progress...' : 'Mark lesson complete'}
            </button>
          )}
        </div>

        <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.6rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>{lesson.course_title}</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', lineHeight: 1.08, color: '#0f172a', fontWeight: 900, marginBottom: '0.55rem' }}>{lesson.title}</h1>
          <p style={{ color: lesson.is_completed ? '#16a34a' : '#64748b', fontWeight: 700 }}>{lesson.is_completed ? 'Completed and progress saved.' : 'Watch, read, and apply the lesson, then save your progress.'}</p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
          <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
            {lesson.video_url && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem', marginBottom: '1.2rem', background: '#0f172a' }}>
                <iframe src={lesson.video_url} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            )}
            <div style={{ color: '#334155', lineHeight: 1.75 }}>
              <div dangerouslySetInnerHTML={{ __html: `<p>${markdownToHtml(lesson.content)}</p>` }} />
            </div>
          </section>

          <aside style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.8rem' }}>Resources</h2>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {(lesson.resources || []).map((resource) => (
                  <div key={resource.label} style={{ padding: '0.85rem 0.95rem', borderRadius: '1rem', background: '#f8fbff' }}>
                    <div style={{ color: '#0f172a', fontWeight: 800 }}>{resource.label}</div>
                    <div style={{ color: '#64748b', fontSize: '0.84rem', textTransform: 'uppercase' }}>{resource.type}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.8rem' }}>Lesson Navigation</h2>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                <button onClick={() => lesson.previous_lesson_id && navigate(`/lessons/${lesson.previous_lesson_id}`)} disabled={!lesson.previous_lesson_id} style={{ border: '1px solid #dbeafe', background: '#fff', color: lesson.previous_lesson_id ? '#1d4ed8' : '#94a3b8', borderRadius: '1rem', padding: '0.85rem 1rem', fontWeight: 800, cursor: lesson.previous_lesson_id ? 'pointer' : 'not-allowed' }}>Previous lesson</button>
                <button onClick={() => lesson.next_lesson_id && navigate(`/lessons/${lesson.next_lesson_id}`)} disabled={!lesson.next_lesson_id} style={{ border: 'none', background: lesson.next_lesson_id ? '#0f172a' : '#cbd5e1', color: '#fff', borderRadius: '1rem', padding: '0.85rem 1rem', fontWeight: 800, cursor: lesson.next_lesson_id ? 'pointer' : 'not-allowed' }}>Next lesson</button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
