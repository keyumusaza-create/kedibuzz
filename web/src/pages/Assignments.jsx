import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const CalendarIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const CheckCircleIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const FileTextIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const AlertCircleIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export default function Assignments() {
  const [activeTab, setActiveTab] = useState('pending')
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionContent, setSubmissionContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [assnRes, subRes] = await Promise.all([
        api.get('/courses/assignments/'),
        api.get('/courses/submissions/')
      ])
      setAssignments(assnRes.data.results || assnRes.data || [])
      setSubmissions(subRes.data.results || subRes.data || [])
    } catch (err) {
      console.error('Failed to fetch assignments', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!submissionContent.trim() || !selectedAssignment) return
    
    setSubmitting(true)
    try {
      await api.post('/courses/submissions/', {
        assignment: selectedAssignment.id,
        content: submissionContent
      })
      setSelectedAssignment(null)
      setSubmissionContent('')
      await fetchData()
    } catch (err) {
      console.error('Submission failed', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading assignments...</div>
      </Layout>
    )
  }

  // Map submissions to assignments
  const submittedAssignmentIds = submissions.map(s => s.assignment)
  
  const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.includes(a.id))
  // Group submissions instead
  const completedSubmissions = submissions

  return (
    <Layout>
      <style>{`
        .glass-panel { background: rgba(255,255,255,0.9); border: 1px solid rgba(148,163,184,0.15); box-shadow: 0 10px 30px rgba(15,23,42,0.04); border-radius: 1.25rem; padding: 1.5rem; }
        .tab-btn { background: transparent; border: none; color: #64748b; font-weight: 700; padding: 0.75rem 1.25rem; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; white-space: nowrap; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
        .assignment-card { border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; background: #fff; }
        .assignment-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(15,23,42,0.06); border-color: #cbd5e1; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-badge.pending { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .status-badge.approved { background: #dcfce3; color: #16a34a; border: 1px solid #bbf7d0; }
        .status-badge.needs_revision { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        @media (max-width: 640px) {
          .assn-card-inner { flex-direction: column !important; align-items: flex-start !important; gap: 0.8rem !important; }
          .assn-meta { flex-direction: column !important; gap: 0.4rem !important; }
          .modal-content { padding: 1.25rem !important; width: 95% !important; border-radius: 1rem !important; }
        }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: 1000; display: grid; place-items: center; padding: 1rem; }
        .modal-content { background: #fff; width: 100%; max-width: 600px; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-height: 90vh; overflow-y: auto; }
      `}</style>

      <div style={{ padding: '0 1rem', maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Assignments</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem' }}>Complete projects and exercises to reinforce your learning.</p>

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 1rem', overflowX: 'auto' }}>
            <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Pending ({pendingAssignments.length})
            </button>
            <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
              Completed ({completedSubmissions.length})
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {activeTab === 'pending' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {pendingAssignments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <CheckCircleIcon size={48} color="#cbd5e1" />
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>You're all caught up! No pending assignments.</p>
                  </div>
                ) : (
                  pendingAssignments.map(assignment => (
                    <div key={assignment.id} className="assignment-card" onClick={() => setSelectedAssignment(assignment)}>
                      <div className="assn-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <p style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{assignment.course_title}</p>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{assignment.title}</h3>
                          <div className="assn-meta" style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <CalendarIcon size={14} /> Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <FileTextIcon size={14} /> {assignment.points} Points
                            </span>
                          </div>
                        </div>
                        <span className="status-badge pending">Action Required</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {completedSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600 }}>No completed assignments yet.</p>
                  </div>
                ) : (
                  completedSubmissions.map(sub => (
                    <div key={sub.id} className="assignment-card" style={{ cursor: 'default' }}>
                      <div className="assn-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Submitted on {new Date(sub.submitted_at).toLocaleDateString()}</p>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{sub.assignment_title}</h3>
                          
                          {sub.feedback && (
                            <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.2rem' }}>Instructor Feedback:</p>
                              <p style={{ fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.5 }}>{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span className={`status-badge ${sub.status}`}>
                            {sub.status === 'pending' ? 'Reviewing' : sub.status.replace('_', ' ')}
                          </span>
                          {sub.score !== null && <span style={{ fontWeight: 900, color: '#0f172a' }}>{sub.score} Pts</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{selectedAssignment.course_title}</p>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{selectedAssignment.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)}
                style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#64748b' }}
              >×</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CalendarIcon size={16} /> Due: {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : 'No due date'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileTextIcon size={16} /> {selectedAssignment.points} Points
              </span>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Instructions</h3>
              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedAssignment.description}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Your Submission</label>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Provide the URL to your repository, deployed project, or paste your solution below.</p>
                <textarea 
                  value={submissionContent}
                  onChange={e => setSubmissionContent(e.target.value)}
                  placeholder="https://github.com/yourusername/project..."
                  style={{ width: '100%', minHeight: 150, padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setSelectedAssignment(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !submissionContent.trim()} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: submissionContent.trim() ? 'pointer' : 'not-allowed', opacity: (submitting || !submissionContent.trim()) ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
