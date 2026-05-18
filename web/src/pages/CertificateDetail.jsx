import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

export default function CertificateDetail() {
  const { id } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/courses/certificates/${id}/`)
      .then((response) => setCertificate(response.data))
      .catch((err) => {
        console.error('Failed to fetch certificate', err)
        setError('Could not load certificate.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const downloadCertificate = () => {
    window.print()
  }

  if (loading) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center' }}>Loading certificate...</div></Layout>
  if (error) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center', color: '#b91c1c' }}>{error}</div></Layout>
  if (!certificate) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center' }}>Certificate not found.</div></Layout>

  const brandBlue = '#1d4ed8'
  const brandAmber = '#f59e0b'

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        {/* Certificate Container - KEDI Brand Border */}
        <div id="certificate-print" style={{
          background: '#fff',
          borderRadius: '1.5rem',
          padding: '3rem',
          boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 600,
          // KEDI brand border: double border effect
          border: `6px solid ${brandBlue}`,
          outline: `3px solid ${brandAmber}`,
          outlineOffset: '-9px',
        }}>
          {/* Top brand gradient bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 10,
            background: `linear-gradient(90deg, ${brandBlue} 0%, #2563eb 50%, ${brandAmber} 100%)`,
          }} />

          {/* Bottom brand gradient bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 10,
            background: `linear-gradient(90deg, ${brandAmber} 0%, #2563eb 50%, ${brandBlue} 100%)`,
          }} />

          {/* Left brand accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 10, height: '100%',
            background: `linear-gradient(180deg, ${brandBlue} 0%, ${brandAmber} 100%)`,
            opacity: 0.15,
          }} />

          {/* Right brand accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 10, height: '100%',
            background: `linear-gradient(180deg, ${brandAmber} 0%, ${brandBlue} 100%)`,
            opacity: 0.15,
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem' }}>
            {/* Logo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={`${import.meta.env.BASE_URL}kedi-logo.png`}
                alt="KEDI Developer Hub"
                style={{ width: 80, height: 'auto', display: 'inline-block' }}
              />
            </div>

            <div style={{
              textTransform: 'uppercase', letterSpacing: '0.2em',
              fontSize: '0.8rem', fontWeight: 800, color: brandBlue,
              marginBottom: '0.75rem',
            }}>
              KEDI Developer Hub
            </div>

            <h1 style={{
              fontSize: '2.5rem', fontWeight: 900, color: '#0f172a',
              marginBottom: '1rem', letterSpacing: '-0.5px',
            }}>
              Certificate of Completion
            </h1>

            <div style={{ fontSize: '1.2rem', color: '#51657f', marginBottom: '1.5rem' }}>
              This is to certify that
            </div>

            <div style={{
              fontSize: '2.2rem', fontWeight: 800, color: brandBlue,
              marginBottom: '1.5rem', letterSpacing: '1px',
            }}>
              {certificate.learner_name}
            </div>

            <div style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '0.5rem' }}>
              has successfully completed the course
            </div>

            <div style={{
              fontSize: '1.8rem', fontWeight: 800, color: '#0f172a',
              marginBottom: '2rem', letterSpacing: '0.5px',
            }}>
              {certificate.course_title}
            </div>

            {/* Details row */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '2rem',
              marginBottom: '2rem', flexWrap: 'wrap',
            }}>
              <div style={{ textAlign: 'center', minWidth: 150 }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Credential ID</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>
                  {certificate.credential_id}
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 150 }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Date Issued</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {new Date(certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 150 }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Issued by</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  KEDI Developer Hub
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <div style={{
                background: '#fff', padding: '0.75rem', borderRadius: '1rem',
                border: `3px solid ${brandBlue}`,
                display: 'inline-block',
              }}>
                {certificate.verification_url && (
                  <QRCodeSVG
                    value={certificate.verification_url}
                    size={100}
                    level="M"
                    fgColor={brandBlue}
                  />
                )}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Scan to verify this certificate
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={downloadCertificate}
            style={{
              background: `linear-gradient(90deg, ${brandBlue} 0%, #2563eb 60%, ${brandAmber} 100%)`,
              color: '#fff', border: 'none', borderRadius: '0.75rem',
              padding: '0.9rem 2rem', fontWeight: 800, fontSize: '1rem',
              cursor: 'pointer', boxShadow: `0 4px 12px rgba(29, 78, 216, 0.3)`,
            }}
          >
            Download Certificate
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#fff', color: '#0f172a', border: '2px solid #0f172a',
              borderRadius: '0.75rem', padding: '0.9rem 2rem', fontWeight: 800,
              fontSize: '1rem', cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print { position: absolute; left: 0; top: 0; width: 100%; border: 6px solid #1d4ed8 !important; outline: 3px solid #f59e0b !important; outline-offset: -9px !important; }
          header, nav, button, main > div:last-child { display: none !important; }
        }
      `}</style>
    </Layout>
  )
}