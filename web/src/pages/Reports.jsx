import Layout from '../components/Layout'

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
            <ReportItem label="Full Stack Development" value="452" percentage={85} color="#2563eb" />
            <ReportItem label="AI & Machine Learning" value="320" percentage={60} color="#8b5cf6" />
            <ReportItem label="UI/UX Design" value="185" percentage={35} color="#ec4899" />
            <ReportItem label="Mobile App Dev" value="150" percentage={28} color="#f59e0b" />
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Instructor Performance</h3>
            <ReportItem label="Dr. Sarah Wilson" value="4.9/5" percentage={98} color="#10b981" />
            <ReportItem label="Prof. James Bond" value="4.7/5" percentage={94} color="#10b981" />
            <ReportItem label="Elena Rodriguez" value="4.5/5" percentage={90} color="#10b981" />
            <ReportItem label="Michael Chen" value="4.2/5" percentage={84} color="#2563eb" />
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
              {[
                { name: 'Advanced React Patterns', learners: 120, completed: 45, progress: '65%' },
                { name: 'Python for Data Science', learners: 240, completed: 88, progress: '58%' },
                { name: 'Modern UI Engineering', learners: 95, completed: 40, progress: '72%' },
                { name: 'Node.js Microservices', learners: 150, completed: 30, progress: '42%' }
              ].map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>{c.learners}</td>
                  <td style={{ padding: '1rem' }}>{c.completed}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>{c.progress}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
