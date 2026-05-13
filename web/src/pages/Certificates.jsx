import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function Certificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses/certificates/')
      .then((response) => setCertificates(response.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Certificates</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Achievement that looks as serious as the work behind it.</h1>
          <p style={{ color: '#51657f', lineHeight: 1.65, maxWidth: 720 }}>Completion certificates mark real progress through practical developer learning paths, including the featured WEB CRAFT FOR AI DEVELOPERS journey.</p>
        </section>

        {loading ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center', border: '1px solid rgba(148,163,184,0.16)' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.5rem' }}>No certificates yet</h2>
            <p style={{ color: '#64748b' }}>Complete your courses to unlock certificates of completion.</p>
          </div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {certificates.map((certificate) => (
              <article key={certificate.id} style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
                <div style={{ padding: '1.4rem', borderRadius: '1.2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #f59e0b 140%)', color: '#fff', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#bfdbfe', fontWeight: 800, marginBottom: '0.5rem' }}>KEDI Developer Hub</div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.45rem' }}>Certificate of Completion</h2>
                  <p style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>{certificate.course_title}</p>
                </div>
                <div style={{ display: 'grid', gap: '0.55rem', color: '#51657f' }}>
                  <div><strong style={{ color: '#0f172a' }}>Credential ID:</strong> {certificate.credential_id}</div>
                  <div><strong style={{ color: '#0f172a' }}>Learner:</strong> {certificate.learner_name}</div>
                  <div><strong style={{ color: '#0f172a' }}>Issued:</strong> {new Date(certificate.issued_at).toLocaleDateString()}</div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
