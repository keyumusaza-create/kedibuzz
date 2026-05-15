import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.6rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  padding: '1.5rem',
}

const gradientTextStyle = {
  background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #f59e0b 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/instructor/')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Entering Studio...</div></Layout>

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 🔥 Top Hero Section */}
        <section style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #172554 40%, #1e3a8a 100%)', 
          borderRadius: '2rem', 
          padding: '3rem 2.5rem', 
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', fontWeight: 800, color: '#93c5fd', marginBottom: '0.75rem' }}>Teaching Studio</p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 950, lineHeight: 1, marginBottom: '1.5rem' }}>Teach. Inspire. <span style={{ color: '#fbbf24' }}>Build Developers.</span></h1>
            <p style={{ fontSize: '1.15rem', color: '#bfdbfe', maxWidth: '600px', lineHeight: 1.6 }}>
              You have <strong style={{ color: '#fff' }}>{data.total_enrollments} active learners</strong> across <strong style={{ color: '#fff' }}>{data.total_courses} courses</strong>. Your influence is shaping the next generation of engineers.
            </p>
          </div>
        </section>

        {/* 📊 Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatCard label="Active Students" value={data.total_enrollments} hint="Learners in your programs" icon="👥" color="#2563eb" />
          <StatCard label="Published Courses" value={data.total_courses} hint="Ready for enrollment" icon="📚" color="#10b981" />
          <StatCard label="Pending Reviews" value={data.pending_reviews} hint="Submissions needing feedback" icon="📝" color="#f59e0b" />
          <StatCard label="Execution Rate" value={`${Math.round(data.avg_completion || 68)}%`} hint="Learner success score" icon="🚀" color="#8b5cf6" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
          
          {/* 📚 My Courses Section */}
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>My Studio Courses</h2>
              <Link to="/instructor/courses/create" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>+ Create New</Link>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {data.course_stats.map((course) => (
                <article key={course.title} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{course.title}</h3>
                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontWeight: 700 }}>{course.enrollment_count} Students</span>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                      <span>Course Momentum</span>
                      <span>{Math.round(course.avg_progress || 0)}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${course.avg_progress}%`, height: '100%', background: '#2563eb' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionButton label="Edit" />
                    <ActionButton label="Lessons" />
                    <ActionButton label="Analytics" primary />
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 📝 Recent Student Activity */}
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Student Activity</h2>
            <div style={cardStyle}>
              {data.recent_activity?.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {data.recent_activity.map((act, i) => (
                    <ActivityItem key={i} {...act} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                  <p style={{ color: '#64748b', fontWeight: 600 }}>No new activity to report. Keep inspiring!</p>
                </div>
              )}
              <button style={{ width: '100%', marginTop: '2rem', padding: '0.85rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', color: '#0f172a' }}>View All Activity</button>
            </div>

            {/* 📈 Quick Analytics Section */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #fff 100%)' }}>
               <h3 style={{ fontSize: '1.05rem', fontWeight: 900, marginBottom: '1rem' }}>Engagement Pulse</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', border: '6px solid #dbeafe', borderTopColor: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 900, color: '#2563eb' }}>82%</div>
                 <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>Learners are most active on your <strong style={{ color: '#0f172a' }}>React Product Patterns</strong> module this week.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, hint, icon, color }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '0.8rem', background: `${color}10` }}>{icon}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>+4% ↑</div>
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#0f172a', marginBottom: '0.25rem' }}>{value}</h3>
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hint}</p>
    </div>
  )
}

function ActionButton({ label, primary }) {
  return (
    <button style={{ 
      flex: 1, 
      padding: '0.65rem', 
      borderRadius: '0.75rem', 
      border: primary ? 'none' : '1.5px solid #e2e8f0', 
      background: primary ? '#0f172a' : '#fff',
      color: primary ? '#fff' : '#0f172a',
      fontSize: '0.85rem',
      fontWeight: 800,
      cursor: 'pointer'
    }}>
      {label}
    </button>
  )
}

function ActivityItem({ user, action, time }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#1d4ed8' }}>{user[0]}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.4 }}>
          <strong style={{ fontWeight: 800 }}>{user}</strong> {action}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{time}</p>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
    </div>
  )
}