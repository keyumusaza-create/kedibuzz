import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/announcements/')
      .then((response) => setAnnouncements(response.data.announcements || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 46%, #ffedd5 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.45rem' }}>Announcements</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0f172a', fontWeight: 900, marginBottom: '0.75rem' }}>Stay aligned with the latest learning updates.</h1>
          <p style={{ color: '#51657f', lineHeight: 1.65, maxWidth: 720 }}>Admins and instructors can publish platform news, learning reminders, resources, and community signals here.</p>
        </section>

        {loading ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem' }}>Loading announcements...</div>
        ) : (
          <section style={{ display: 'grid', gap: '1rem' }}>
            {announcements.map((announcement) => (
              <article key={announcement.id} style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <h2 style={{ color: '#0f172a', fontWeight: 900 }}>{announcement.title}</h2>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{announcement.date}</span>
                </div>
                <p style={{ color: '#51657f', lineHeight: 1.65 }}>{announcement.content}</p>
                <div style={{ color: '#2563eb', fontWeight: 800, fontSize: '0.86rem', marginTop: '0.75rem' }}>Posted by {announcement.author}</div>
              </article>
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
