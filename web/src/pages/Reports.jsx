import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
  padding: '1.5rem',
}

const ReportItem = ({ label, value, percentage, color }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 600, color: '#475569' }}>{label}</span>
      <span style={{ fontWeight: 800, color: '#0f172a' }}>{value}</span>
    </div>
    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '10px' }}></div>
    </div>
  </div>
)

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/dashboard/admin/reports/')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching reports:', err)
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <Layout><div style={{ padding: '2rem', textAlign: 'center', fontWeight: 'bold' }}>Loading reports data...</div></Layout>
  if (error) return <Layout><div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div></Layout>

  // Fallback to empty arrays if data fields aren't present yet from the API
  const enrollmentData = data?.enrollmentByCategory || []
  const performanceData = data?.instructorPerformance || []
  const courseRates = data?.courseCompletionRates || []

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>Advanced Reports</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Comprehensive analytics on learner progress and course performance.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Enrollment by Category</h3>
            {enrollmentData.length > 0 ? enrollmentData.map((item, i) => (
              <ReportItem key={i} label={item.label} value={item.value} percentage={item.percentage} color={item.color || '#2563eb'} />
            )) : <p style={{ color: '#64748b' }}>No enrollment data available.</p>}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Instructor Performance</h3>
            {performanceData.length > 0 ? performanceData.map((item, i) => (
              <ReportItem key={i} label={item.label} value={item.value} percentage={item.percentage} color={item.color || '#10b981'} />
            )) : <p style={{ color: '#64748b' }}>No instructor data available.</p>}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Course Completion Rates</h3>
            <select style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>COURSE NAME</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>LEARNERS</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>COMPLETED</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>AVG. PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              {courseRates.length > 0 ? courseRates.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>{c.learners}</td>
                  <td style={{ padding: '1rem' }}>{c.completed}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>{c.progress}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No course data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
