import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setNotice('')
    setError('')
    try {
      await api.patch('/accounts/users/me/', profile)
      setNotice('Profile preferences updated.')
    } catch {
      setError('We could not save your profile changes.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (passwords.next !== passwords.confirm) {
      setError('New passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await api.post('/accounts/users/change-password/', {
        current_password: passwords.current,
        new_password: passwords.next,
      })
      setNotice('Password updated successfully.')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch {
      setError('We could not update your password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', borderRadius: '1.5rem', padding: 'clamp(1.25rem, 5vw, 2rem)', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Settings</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: 1.1, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Account settings for your developer journey.</h1>
          <p style={{ color: '#51657f', lineHeight: 1.6, maxWidth: 720, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Update your profile details and security preferences while keeping the same authentication experience.</p>
        </section>

        {(notice || error) && (
          <div style={{ padding: '1rem 1.1rem', borderRadius: '1rem', background: error ? '#fff7f7' : '#eff6ff', color: error ? '#b91c1c' : '#1d4ed8', border: `1px solid ${error ? '#fecaca' : '#bfdbfe'}`, fontWeight: 700 }}>
            {error || notice}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>
          <section style={sectionStyle}>
            <h2 style={sectionTitle}>Profile Preferences</h2>
            <form onSubmit={saveProfile} style={{ display: 'grid', gap: '0.9rem' }}>
              <Field label="First Name" value={profile.first_name} onChange={(value) => setProfile((state) => ({ ...state, first_name: value }))} />
              <Field label="Last Name" value={profile.last_name} onChange={(value) => setProfile((state) => ({ ...state, last_name: value }))} />
              <Field label="Phone" value={profile.phone} onChange={(value) => setProfile((state) => ({ ...state, phone: value }))} />
              <button type="submit" disabled={savingProfile} style={buttonStyle}>{savingProfile ? 'Saving...' : 'Save profile'}</button>
            </form>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitle}>Security</h2>
            <form onSubmit={savePassword} style={{ display: 'grid', gap: '0.9rem' }}>
              <Field label="Current Password" type="password" value={passwords.current} onChange={(value) => setPasswords((state) => ({ ...state, current: value }))} />
              <Field label="New Password" type="password" value={passwords.next} onChange={(value) => setPasswords((state) => ({ ...state, next: value }))} />
              <Field label="Confirm New Password" type="password" value={passwords.confirm} onChange={(value) => setPasswords((state) => ({ ...state, confirm: value }))} />
              <button type="submit" disabled={savingPassword} style={buttonStyle}>{savingPassword ? 'Updating...' : 'Update password'}</button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ color: '#334155', fontWeight: 800 }}>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} style={{ padding: '0.9rem 1rem', borderRadius: '1rem', border: '1px solid #dbeafe', outline: 'none', fontSize: '0.95rem' }} />
    </label>
  )
}

const sectionStyle = {
  background: '#fff',
  borderRadius: '1.5rem',
  padding: '1.5rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
}

const sectionTitle = {
  color: '#0f172a',
  fontWeight: 900,
  marginBottom: '1rem',
}

const buttonStyle = {
  border: 'none',
  borderRadius: '999px',
  padding: '0.9rem 1rem',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
}
