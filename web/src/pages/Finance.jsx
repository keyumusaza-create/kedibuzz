import Layout from '../components/Layout'

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
  padding: '1.5rem',
}

const StatCard = ({ label, value, trend, color }) => (
  <div style={cardStyle}>
    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: color }}>{trend}</div>
    </div>
  </div>
)

export default function Finance() {
  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>Finance Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Track platform revenue, instructor payouts, and financial growth.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <StatCard label="Gross Volume" value="$12,450.00" trend="+14.5% ↑" color="#10b981" />
          <StatCard label="Platform Fees" value="$2,490.00" trend="+12.2% ↑" color="#10b981" />
          <StatCard label="Instructor Payouts" value="$9,960.00" trend="+15.1% ↑" color="#10b981" />
          <StatCard label="Pending Payments" value="$1,200.00" trend="-2.4% ↓" color="#f59e0b" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Revenue Overview</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '2rem', background: '#f1f5f9', fontWeight: 700 }}>Monthly</span>
                <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '2rem', background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>Yearly</span>
              </div>
            </div>
            {/* Mock Chart Area */}
            <div style={{ height: '300px', background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)', borderRadius: '0.75rem', position: 'relative', overflow: 'hidden', border: '1px dashed #e2e8f0' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 1rem' }}>
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                  <div key={i} style={{ width: '8%', height: `${h}%`, background: h > 70 ? '#2563eb' : '#94a3b833', borderRadius: '4px 4px 0 0' }}></div>
                ))}
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Analytics Visualization</div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recent Payouts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { name: 'Dr. Sarah Wilson', amount: '$1,250.00', status: 'Paid', date: 'May 12' },
                { name: 'Prof. James Bond', amount: '$850.00', status: 'Processing', date: 'May 11' },
                { name: 'Elena Rodriguez', amount: '$2,100.00', status: 'Paid', date: 'May 09' },
                { name: 'Michael Chen', amount: '$620.00', status: 'Scheduled', date: 'May 15' }
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.amount}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: p.status === 'Paid' ? '#10b981' : '#f59e0b' }}>{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>View All Payments</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
