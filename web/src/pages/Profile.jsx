import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    sex: user?.sex || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isIncomplete = !user?.profile_completed

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const fd = new FormData()
      fd.append('first_name', form.first_name)
      fd.append('last_name', form.last_name)
      fd.append('phone', form.phone)
      fd.append('date_of_birth', form.date_of_birth)
      fd.append('sex', form.sex)
      if (avatarFile) {
        fd.append('avatar', avatarFile)
      }
      await updateUser(fd)
      setSaved(true)
      // If profile was incomplete, redirect to dashboard
      if (isIncomplete) {
        setTimeout(() => {
          const roleRoutes = { admin: '/admin', instructor: '/instructor', learner: '/my-learning' }
          navigate(roleRoutes[user?.role] || '/', { replace: true })
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const input = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const label = {
    display: 'block',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.4rem',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
        {/* Banner for incomplete profile */}
        {isIncomplete && (
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '1.2rem',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #f59e0b',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>✏️</span>
            <div>
              <div style={{ fontWeight: 900, color: '#92400e', fontSize: '0.95rem' }}>Complete Your Profile</div>
              <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                Please fill in your details to get started. You'll be redirected automatically.
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)',
          borderRadius: '1.5rem', padding: '2rem',
          border: '1px solid rgba(148,163,184,0.16)',
          boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
        }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Profile</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>
            {isIncomplete ? 'Welcome! Set Up Your Profile' : 'Your Profile'}
          </h1>
          <p style={{ color: '#51657f', lineHeight: 1.65, maxWidth: 600 }}>
            {isIncomplete
              ? 'Please provide your name, date of birth, and optionally a profile picture and other details before continuing.'
              : 'Keep your account information current while you learn, build, and progress through developer training.'}
          </p>
        </section>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff', borderRadius: '1.5rem', padding: '2rem',
          border: '1px solid rgba(148,163,184,0.16)',
          boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
          display: 'grid', gap: '1.5rem',
        }}>
          {saved && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
              ✅ Profile saved successfully!
              {isIncomplete && <span> Redirecting...</span>}
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                background: '#f1f5f9', border: '3px solid #dbeafe',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, position: 'relative',
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem', color: '#94a3b8' }}>📷</span>
              )}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                className="avatar-overlay"
              >
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>Change</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                {user?.full_name || 'Profile Picture'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {user?.email} · {user?.role}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                marginTop: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '0.5rem',
                border: '1.5px solid #dbeafe', background: '#f8fbff',
                color: '#2563eb', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
              }}>
                Upload Photo
              </button>
            </div>
          </div>

          <style>{`.avatar-overlay:hover { opacity: 1 !important; }`}</style>

          {/* Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={label}>First Name *</label>
              <input style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" required={isIncomplete} />
            </div>
            <div>
              <label style={label}>Last Name *</label>
              <input style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" required={isIncomplete} />
            </div>
          </div>

          {/* Date of Birth + Sex */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={label}>Date of Birth *</label>
              <input type="date" style={input} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} required={isIncomplete} />
            </div>
            <div>
              <label style={label}>Sex</label>
              <select style={input} value={form.sex} onChange={e => set('sex', e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={label}>Phone</label>
            <input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 123-4567" />
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={label}>Email (read-only)</label>
            <input style={{ ...input, background: '#f8fafc', color: '#64748b' }} value={user?.email || ''} disabled />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            {!isIncomplete && (
              <button type="button" onClick={() => navigate(-1)} style={{
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={saving} style={{
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none',
              background: saving ? '#94a3b8' : '#0f172a',
              color: '#fff', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
            }}>
              {saving ? 'Saving...' : (isIncomplete ? 'Save & Continue →' : 'Save Profile')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}