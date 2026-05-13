import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  const fields = [
    ['Full Name', user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Not set'],
    ['Email', user?.email || 'Not set'],
    ['Username', user?.username || 'Not set'],
    ['Role', user?.role || 'Not set'],
    ['Phone', user?.phone || 'Not set'],
    ['Joined', user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not set'],
  ]

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Profile</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Your identity inside the KEDI Developer Hub.</h1>
          <p style={{ color: '#51657f', lineHeight: 1.65, maxWidth: 720 }}>Keep your account information current while you learn, build, and progress through developer training.</p>
        </section>

        <section style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fbff', display: 'grid', gap: '0.25rem' }}>
                <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ color: '#0f172a', fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
