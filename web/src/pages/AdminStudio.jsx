import Layout from '../components/Layout'

const Placeholder = ({ title }) => (
  <Layout>
    <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.4rem', border: '1px solid rgba(148,163,184,0.16)', textAlign: 'center' }}>
      <h1 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Admin Mission Control: This management module is coming soon.</p>
    </div>
  </Layout>
)

export const AdminUsers = () => <Placeholder title="User Management" />
export const AdminInstructors = () => <Placeholder title="Instructor Management" />
export const AdminStudents = () => <Placeholder title="Student Directory" />
export const AdminCourses = () => <Placeholder title="Course Catalog Administration" />
export const AdminCategories = () => <Placeholder title="Category Management" />
export const AdminCertificates = () => <Placeholder title="Issued Certificates Monitor" />
export const AdminAnalytics = () => <Placeholder title="Platform Analytics" />
export const AdminPayments = () => <Placeholder title="Payment & Revenue Center" />
