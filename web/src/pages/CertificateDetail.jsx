import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useNavigate, useParams } from 'react-router-dom'

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
    // Trigger print dialog which allows saving as PDF
    window.print()
  }

  if (loading) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center' }}>Loading certificate...</div></Layout>
  if (error) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center', color: '#b91c1c' }}>{error}</div></Layout>
  if (!certificate) return <Layout><div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', textAlign: 'center' }}>Certificate not found.</div></Layout>

  return (
    <Layout>
      <div style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '0 1rem',
        position: 'relative'
      }}>
        {/* Certificate Container - styled to look like a certificate */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '1.5rem', 
          padding: '3rem', 
          boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
          border: '2px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '600px'
        }}>
          {/* Top Decorative Border */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '8px', 
            background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #f59e0b 100%)'
          }}></div>
          
          {/* KEDI Logo at the Top */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            position: 'relative',
            zIndex: 2
          }}>
            <img 
              src={`${import.meta.env.BASE_URL}kedi-logo.png`} 
              alt="KEDI Developer Hub" 
              style={{ 
                width: '80px', 
                height: 'auto', 
                display: 'inline-block'
              }}
            />
          </div>

          {/* Certificate Content */}
          <div style={{ 
            position: 'relative', 
            zIndex: 2,
            textAlign: 'center',
            padding: '0 2rem'
          }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              color: '#0f172a', 
              marginBottom: '1rem',
              letterSpacing: '-0.5px'
            }}>Certificate of Completion</h1>
            
            <div style={{ 
              fontSize: '1.2rem', 
              color: '#51657f', 
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              This is to certify that
            </div>
            
            <div style={{ 
              fontSize: '2.2rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              marginBottom: '1.5rem',
              letterSpacing: '1px'
            }}>
              {certificate.learner_name}
            </div>
            
            <div style={{ 
              fontSize: '1.4rem', 
              color: '#64748b', 
              marginBottom: '0.5rem'
            }}>
              has successfully completed the course
            </div>
            
            <div style={{ 
              fontSize: '1.8rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              marginBottom: '2rem',
              letterSpacing: '0.5px'
            }}>
              {certificate.course_title}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                textAlign: 'center',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Credential ID</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>
                  {certificate.credential_id}
                </div>
              </div>
              <div style={{ 
                textAlign: 'center',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Date Issued</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: '8px', 
              background: 'linear-gradient(90deg, #f59e0b 0%, #2563eb 50%, #1d4ed8 100%)'
            }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          gap: '1rem',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={downloadCertificate}
            style={{ 
              background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.9rem 2rem',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            Download Certificate
          </button>
          <button 
            onClick={() => navigate('/certificates')}
            style={{ 
              background: '#fff',
              color: '#0f172a',
              border: '2px solid #0f172a',
              borderRadius: '0.75rem',
              padding: '0.9rem 2rem',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            View All Certificates
          </button>
        </div>
      </div>
    </Layout>
  )
}