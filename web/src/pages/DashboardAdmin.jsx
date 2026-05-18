import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const cardStyle = {
  background: '#fff',
  borderRadius: '1rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 4px 12px rgba(15,23,42,0.03)',
  padding: '1.5rem',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({
    total_users: 0,
    active_learners: 0,
    total_courses: 0,
    total_instructors: 0,
    completion_rate: 72,
    revenue: 0.00,
    recent_courses: [],
    recent_activity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/admin/')
      .then(res => setData(res.data))
      .catch(() => setError('Could not load dashboard. Check that the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Initializing Mission Control...</div></Layout>
  if (error || !data) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#b91c1c', fontWeight: 700 }}>{error || 'No data available.'}</div></Layout>

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* 🧑💼 Admin Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <div>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem' }}>Platform Intelligence</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>Mission Control</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <QuickAction label="Add Instructor" to="/admin/users" />
            <QuickAction label="Publish Course" to="/instructor/courses/builder" primary />
          </div>
        </header>

        {/* 📊 Top Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatCard label="Total Users" value={data.total_users} trend="+12.5%" hint="System-wide accounts" />
          <StatCard label="Active Learners" value={data.active_learners} trend="+8.2%" hint="Engaged in last 30d" />
          <StatCard label="Published Courses" value={data.total_courses} hint="Live on catalog" />
          <StatCard label="Instructors" value={data.total_instructors} hint="Approved educators" />
          <StatCard label="Completion Rate" value={`${Math.round(data.completion_rate || 72)}%`} trend="+3%" hint="Platform average" />
          <StatCard label="Platform Revenue" value={`$${data.revenue || '0.00'}`} trend="+15.4%" hint="Monthly gross" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          
          {/* 📈 Analytics & Growth */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 800, color: '#0f172a' }}>Registration Growth</h3>
                <select style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', padding: '0 1rem' }}>
                {data.registration_growth ? data.registration_growth.map((item, i) => {
                  const maxCount = Math.max(...data.registration_growth.map(g => g.count), 1)
                  const height = (item.count / maxCount) * 150 + 10
                  const isCurrent = i === data.registration_growth.length - 1
                  return (
                    <div key={i} style={{ flex: 1, display: 'grid', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ 
                        height: `${height}px`, 
                        background: isCurrent ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)' : '#e2e8f0', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease-out'
                      }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{item.month}</span>
                    </div>
                  )
                }) : (
                  <div style={{ margin: 'auto', color: '#cbd5e1' }}>No growth data available</div>
                )}
              </div>
            </div>

            {/* 📚 Course Management Table Preview */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, color: '#0f172a' }}>Project-Ready Courses</h3>
                <Link to="/admin/courses" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>View All</Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 0' }}>Course Name</th>
                    <th>Instructor</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_courses?.map((course) => (
                    <tr key={course.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.9rem' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 700, color: '#0f172a' }}>{course.title}</td>
                      <td style={{ color: '#475569' }}>{course.instructor_name}</td>
                      <td style={{ fontWeight: 700 }}>{course.student_count}</td>
                      <td>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.4rem', background: course.is_published ? '#ecfdf5' : '#fff7ed', color: course.is_published ? '#059669' : '#ea580c', fontSize: '0.75rem', fontWeight: 800 }}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/courses/${course.id}`} style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ⚡ Social & System Feed */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>System Status</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <StatusItem label="API Infrastructure" status="Operational" color="#10b981" />
                <StatusItem label="Video Streaming" status="Operational" color="#10b981" />
                <StatusItem label="Payment Gateway" status="Operational" color="#10b981" />
                <StatusItem label="Storage (S3/Media)" status="Maintenance" color="#f59e0b" />
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Recent Platform Activity</h3>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {data.recent_activity?.map((act, i) => (
                  <ActivityLine key={i} {...act} />
                ))}
              </div>
              <Link to="/admin/reports" style={{ display: 'block', width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', color: '#0f172a', textAlign: 'center' }}>Full Activity Log</Link>
            </div>

            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', color: '#fff', border: 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Admin Quick Actions</h3>
              <p style={{ fontSize: '0.85rem', color: '#93c5fd', marginBottom: '1.25rem', lineHeight: 1.5 }}>Perform routine maintenance or global broadcast actions.</p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <Link to="/admin/announcements" style={quickButtonStyle}>📢 Send Global Announcement</Link>
                <Link to="/admin/reports" style={quickButtonStyle}>📊 Export Monthly Analytics</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, trend, hint }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>{label}</p>
        {trend && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>{trend} ↑</span>}
      </div>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>{value}</h3>
      <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{hint}</p>
    </div>
  )
}

function QuickAction({ label, to, primary }) {
  return (
    <Link to={to} style={{
      display: 'inline-flex',
      padding: '0.75rem 1.25rem',
      borderRadius: '0.75rem',
      background: primary ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)' : '#fff',
      color: primary ? '#fff' : '#0f172a',
      fontWeight: 800,
      fontSize: '0.9rem',
      textDecoration: 'none',
      border: primary ? 'none' : '1px solid #e2e8f0',
      boxShadow: primary ? '0 10px 25px rgba(37, 99, 235, 0.2)' : 'none'
    }}>
      {label}
    </Link>
  )
}

function StatusItem({ label, status, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{status}</span>
      </div>
    </div>
  )
}

function ActivityLine({ description, time, type }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <div style={{ width: 2, height: '100%', minHeight: '20px', background: '#e2e8f0' }} />
      <div>
        <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4 }}>{description}</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{time}</p>
      </div>
    </div>
  )
}

const quickButtonStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '0.75rem',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: '0.75rem',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: 700,
  border: '1px solid rgba(255,255,255,0.1)'
}