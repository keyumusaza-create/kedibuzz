import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

const KEDILogo = () => (
  <img src={`${import.meta.env.BASE_URL}kedi-logo.png`} alt="KEDI Developer Hub" style={{ width: '320px', height: 'auto' }} />
)

const DevIllustration = () => (
  <svg viewBox="0 0 400 180" width="100%" xmlns="http://www.w3.org/2000/svg">
    <rect x="100" y="40" width="200" height="120" fill="#c8dce8" rx="6" stroke="#7aa8c8" strokeWidth="2"/>
    <rect x="110" y="50" width="180" height="90" fill="#1e293b" rx="2"/>
    <rect x="120" y="60" width="60" height="4" fill="#38bdf8" rx="2"/>
    <rect x="120" y="72" width="100" height="4" fill="#a855f7" rx="2"/>
    <rect x="140" y="84" width="80" height="4" fill="#22c55e" rx="2"/>
    <rect x="120" y="96" width="120" height="4" fill="#38bdf8" rx="2"/>
    <rect x="160" y="108" width="40" height="4" fill="#eab308" rx="2"/>
    <path d="M80 160 L320 160 L330 170 L70 170 Z" fill="#a8c4d8" stroke="#7aa8c8" strokeWidth="2"/>
    <circle cx="340" cy="60" r="25" fill="#f59e0b" opacity="0.15"/>
    <circle cx="340" cy="60" r="18" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"/>
    <path d="M334 55 A4 4 0 1 1 346 55 M340 60 L340 70 M330 65 L350 65" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
    <rect x="40" y="60" width="20" height="20" fill="#2563eb" rx="4" opacity="0.2" transform="rotate(15 40 60)"/>
    <rect x="360" y="110" width="15" height="15" fill="#2563eb" rx="3" opacity="0.2" transform="rotate(-15 360 110)"/>
    <rect x="0" y="178" width="400" height="4" fill="#9ab8cc" rx="1"/>
  </svg>
)

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const baseInput = {
    width: '100%',
    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '0.625rem',
    fontSize: '0.9rem',
    color: '#1e293b',
    outline: 'none',
    background: '#f8fafc',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/login', {
        state: {
          message: 'Account created successfully. Sign in to start learning.',
          email: form.email,
        },
      })
    } catch (err) {
      const data = err.response?.data
      const firstError = typeof data === 'object' && data
        ? Object.values(data).flat().join(' ')
        : null
      setError(firstError || 'Could not create your account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes kedi-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .kedi-card { animation: kedi-fadein 0.4s ease; }
        .kedi-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; background: #fff !important; }
        .kedi-btn:hover:not(:disabled) { opacity: 0.91; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4) !important; }
        .kedi-btn:active:not(:disabled) { transform: translateY(0); }
        .kedi-mobile-logo { display: none; margin-bottom: 2rem; justify-content: center; }
        @media (max-width: 640px) { 
          .kedi-left { display: none !important; } 
          .kedi-right { padding: 2.5rem 1.75rem !important; } 
          .kedi-mobile-logo { display: flex !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d5e4ee', padding: '1rem' }}>
        <div className="kedi-card" style={{ display: 'flex', width: '100%', maxWidth: '980px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', minHeight: '620px' }}>
          <div className="kedi-left" style={{ flex: 1, background: 'linear-gradient(145deg, #eef5fb 0%, #ddeaf6 55%, #cce0f2 100%)', padding: '2.5rem 2.25rem', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ marginBottom: '0.25rem' }}><KEDILogo /></div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.35 }}>Create. Practice.</span>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.35 }}>Grow with AI.</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4a6585', lineHeight: 1.65, maxWidth: '290px' }}>
              Create your learner account and start building real-world web, programming, and AI-assisted development skills.
            </p>
            <div style={{ marginTop: 'auto', position: 'relative' }}>
              <DevIllustration />
              <div style={{ position: 'absolute', bottom: 0, left: '-2.25rem', right: '-2.25rem', overflow: 'hidden', height: '38px' }}>
                <svg viewBox="0 0 400 38" preserveAspectRatio="none" width="100%" height="38">
                  <path d="M0 18 Q100 4 200 18 Q300 32 400 18 L400 38 L0 38Z" fill="#1e3a8a" opacity="0.55"/>
                  <path d="M0 26 Q100 12 200 26 Q300 40 400 26 L400 38 L0 38Z" fill="#f59e0b" opacity="0.65"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="kedi-right" style={{ flex: 1, background: 'white', padding: '2.5rem 2.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="kedi-mobile-logo"><KEDILogo /></div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>Create Your Account</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join KEDI Developer Hub as a learner.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div className="grid grid-2" style={{ gap: '0.9rem', marginBottom: '1rem' }}>
                <InputField label="First Name" value={form.first_name} onChange={(value) => handleChange('first_name', value)} icon={<UserIcon />} placeholder="Ada" style={baseInput} />
                <InputField label="Last Name" value={form.last_name} onChange={(value) => handleChange('last_name', value)} icon={<UserIcon />} placeholder="Lovelace" style={baseInput} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <InputField label="Username" value={form.username} onChange={(value) => handleChange('username', value)} icon={<UserIcon />} placeholder="adalovelace" style={baseInput} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <InputField label="Email" type="email" value={form.email} onChange={(value) => handleChange('email', value)} icon={<MailIcon />} placeholder="you@example.com" style={baseInput} />
              </div>

              <PasswordField
                label="Password"
                value={form.password}
                onChange={(value) => handleChange('password', value)}
                show={showPassword}
                setShow={setShowPassword}
                style={baseInput}
              />

              <PasswordField
                label="Confirm Password"
                value={form.password_confirm}
                onChange={(value) => handleChange('password_confirm', value)}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                style={baseInput}
              />

              <button
                type="submit"
                className="kedi-btn"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.5rem',
                  background: loading ? '#94a3b8' : 'linear-gradient(90deg, #1e40af 0%, #2563eb 45%, #f59e0b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.625rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                  letterSpacing: '0.03em',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(37,99,235,0.32)',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRightIcon />}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.8rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <ShieldIcon />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Your learning profile is safe and protected</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Need help? <a href="mailto:support@kedihub.com" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function InputField({ label, icon, value, onChange, placeholder, style, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
          {icon}
        </span>
        <input
          type={type}
          className="kedi-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          style={style}
        />
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, setShow, style }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
          <LockIcon />
        </span>
        <input
          type={show ? 'text' : 'password'}
          className="kedi-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••••"
          required
          style={{ ...style, paddingRight: '2.75rem' }}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}
