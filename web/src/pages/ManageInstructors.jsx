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

export default function ManageInstructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'instructor'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const res = await api.get('/accounts/users/?role=instructor')
      setInstructors(res.data.results || res.data)
    } catch (err) {
      setError('Failed to load instructors.')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (instr) => {
    try {
      await api.patch(`/accounts/users/${instr.id}/`, { is_active: !instr.is_active })
      fetchInstructors()
    } catch {
      setError('Failed to update instructor status.')
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/accounts/users/register/', formData)
      setShowForm(false)
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'instructor'
      })
      fetchInstructors()
    } catch (err) {
      const data = err.response?.data
      const firstError = typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to create instructor.'
      setError(firstError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Manage Instructors</h1>
            <p style={{ color: '#64748b' }}>Add and oversee the teaching staff of KEDI Developer Hub.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.75rem', 
              background: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {showForm ? 'Cancel' : 'Add New Instructor'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {showForm && (
          <div style={{ ...cardStyle, padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Instructor Details</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>First Name</label>
                <input name="first_name" value={formData.first_name} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Last Name</label>
                <input name="last_name" value={formData.last_name} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Username</label>
                <input name="username" value={formData.username} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confirm Password</label>
                <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleInputChange} style={inputStyle} required />
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ 
                    width: '100%', 
                    padding: '0.9rem', 
                    borderRadius: '0.75rem', 
                    background: 'linear-gradient(90deg, #1e40af, #2563eb)', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: 800, 
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Creating instructor account...' : 'Create Instructor Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading instructors...</div>
        ) : (
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instr) => (
                  <tr key={instr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#0f172a' }}>{instr.first_name} {instr.last_name}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>{instr.email}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800,
                        background: instr.is_active ? '#f0fdf4' : '#fef2f2',
                        color: instr.is_active ? '#16a34a' : '#dc2626'
                      }}>{instr.is_active ? 'Active' : 'Suspended'}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <button
                        onClick={() => toggleStatus(instr)}
                        style={{ color: instr.is_active ? '#ef4444' : '#16a34a', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                      >{instr.is_active ? 'Suspend' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {instructors.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No instructors found.</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
