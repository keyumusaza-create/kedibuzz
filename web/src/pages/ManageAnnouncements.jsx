import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.625rem',
  fontSize: '0.9rem',
  outline: 'none',
  background: '#f8fafc',
  fontFamily: 'inherit',
}

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_global: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/courses/announcements/')
      setAnnouncements(res.data.results || res.data)
    } catch (err) {
      setError('Failed to load announcements.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/courses/announcements/', formData)
      setShowForm(false)
      setFormData({ title: '', content: '', is_global: true })
      fetchAnnouncements()
    } catch (err) {
      setError('Failed to create announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      await api.delete(`/courses/announcements/${id}/`)
      fetchAnnouncements()
    } catch (err) {
      setError('Failed to delete announcement.')
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Global Announcements</h1>
            <p style={{ color: '#64748b' }}>Broadcast updates to all learners and instructors across KEDI Developer Hub.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.75rem', 
              background: '#f59e0b', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancel' : 'Post New Announcement'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {showForm && (
          <div style={{ ...cardStyle, padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Create Announcement</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Platform Maintenance Saturday" required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Content</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
                  placeholder="Provide details about the announcement..."
                  required 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  id="is_global"
                  name="is_global" 
                  checked={formData.is_global} 
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="is_global" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Broadcast as Global (Visible to everyone)</label>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                style={{ 
                  padding: '0.9rem', 
                  borderRadius: '0.75rem', 
                  background: 'linear-gradient(90deg, #d97706, #f59e0b)', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 800, 
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading announcements...</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {announcements.map((ann) => (
              <div key={ann.id} style={{ ...cardStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{ann.title}</h3>
                    <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{ann.is_global ? 'Global' : 'Course'}</span>
                  </div>
                  <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.95rem' }}>{ann.content}</p>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Posted on {ann.date} by {ann.author}</div>
                </div>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
            {announcements.length === 0 && (
              <div style={{ ...cardStyle, padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No announcements posted yet.</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
