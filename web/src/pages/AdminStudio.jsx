import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

// ─── Shared Utilities ─────────────────────────────────────────────────────────

export const Avatar = ({ user, size = 40 }) => {
  const url = user?.avatar_url
  return url ? (
    <img src={url} alt={user?.first_name || user?.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #e2e8f0' }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
      display: 'grid', placeItems: 'center', color: '#fff',
      fontSize: size * 0.35, fontWeight: 900, flexShrink: 0,
      border: '2.5px solid #e2e8f0'
    }}>
      {(user?.first_name || user?.name || user?.email || '?').charAt(0).toUpperCase()}
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  borderRadius: '1.4rem',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
}

const thStyle = {
  padding: '1rem 1.2rem',
  color: '#64748b',
  fontSize: '0.72rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textAlign: 'left',
  borderBottom: '1px solid #f1f5f9',
}

const tdStyle = { padding: '1rem 1.2rem', borderBottom: '1px solid #f8fafc' }

const StatusBadge = ({ active }) => (
  <span style={{
    padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800,
    background: active ? '#f0fdf4' : '#fef2f2', color: active ? '#16a34a' : '#dc2626'
  }}>
    {active ? 'Active' : 'Inactive'}
  </span>
)

const RoleBadge = ({ role }) => {
  const map = {
    admin: { bg: '#eff6ff', color: '#1d4ed8' },
    instructor: { bg: '#f5f3ff', color: '#7c3aed' },
    learner: { bg: '#f8fafc', color: '#64748b' },
  }
  const s = map[role] || map.learner
  return (
    <span style={{
      padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800,
      background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>{role}</span>
  )
}

const PublishBadge = ({ published }) => (
  <span style={{
    padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 800,
    background: published ? '#ecfdf5' : '#fff7ed', color: published ? '#059669' : '#ea580c'
  }}>{published ? 'Published' : 'Draft'}</span>
)

const PaymentStatusBadge = ({ status }) => {
  const map = {
    completed: { bg: '#f0fdf4', color: '#16a34a' },
    pending: { bg: '#fefce8', color: '#ca8a04' },
    failed: { bg: '#fef2f2', color: '#dc2626' },
    refunded: { bg: '#f5f3ff', color: '#7c3aed' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 800,
      background: s.bg, color: s.color, textTransform: 'capitalize'
    }}>{status}</span>
  )
}

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0',
      outline: 'none', background: '#fff', fontSize: '0.9rem', minWidth: '220px'
    }}
  />
)

const PageHeader = ({ title, subtitle, action }) => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>{title}</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{subtitle}</p>
    </div>
    {action}
  </header>
)

const EmptyState = ({ message }) => (
  <tr><td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>{message}</td></tr>
)

const LoadingRows = ({ cols = 5, rows = 4 }) => (
  Array(rows).fill(0).map((_, i) => (
    <tr key={i}><td colSpan={cols} style={{ padding: '1.2rem', textAlign: 'center', color: '#cbd5e1' }}>Loading...</td></tr>
  ))
)

// ─── Admin: User Management ──────────────────────────────────────────────────

export const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'learner' })
  const [submitting, setSubmitting] = useState(false)

  // Profile Drawer
  const [selectedUser, setSelectedUser] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerUser, setDrawerUser] = useState(null)
  const [roleChanging, setRoleChanging] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/accounts/users/', { params: { search, role: roleFilter } })
      setUsers(resp.data.results || resp.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [search, roleFilter])

  const openProfile = async (user) => {
    setSelectedUser(user)
    setDrawerUser(user)
    setDrawerLoading(true)
    try {
      // Fetch full profile detail with avatar_url
      const res = await api.get(`/accounts/users/${user.id}/`)
      setDrawerUser(res.data)
    } finally {
      setDrawerLoading(false)
    }
  }

  const closeDrawer = () => { setSelectedUser(null); setDrawerUser(null) }

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/accounts/users/${user.id}/`, { is_active: !user.is_active })
      fetchUsers()
      if (drawerUser?.id === user.id) setDrawerUser(prev => ({ ...prev, is_active: !prev.is_active }))
    } catch { alert('Failed to update status') }
  }

  const changeRole = async (userId, newRole) => {
    setRoleChanging(true)
    try {
      await api.patch(`/accounts/users/${userId}/`, { role: newRole })
      fetchUsers()
      setDrawerUser(prev => ({ ...prev, role: newRole }))
    } catch { alert('Failed to change role') }
    finally { setRoleChanging(false) }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/accounts/users/register/', newUser)
      setShowModal(false)
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: 'learner' })
      fetchUsers()
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data || err.message))
    } finally { setSubmitting(false) }
  }

  const ProfileField = ({ label, value }) => (
    value ? (
      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{value}</span>
      </div>
    ) : null
  )

  return (
    <Layout>
      {/* ── Add User Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '1.5rem', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.4rem', color: '#0f172a' }}>Add New User</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create a new account manually.</p>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['first_name', 'last_name'].map(f => (
                  <div key={f}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>{f === 'first_name' ? 'First Name' : 'Last Name'}</label>
                    <input type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                      value={newUser[f]} onChange={e => setNewUser({ ...newUser, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>Email Address</label>
                <input type="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>Initial Password</label>
                <input type="password" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>Role</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff' }}
                  value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.85rem', borderRadius: '0.8rem', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.85rem', borderRadius: '0.8rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Profile Drawer ── */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex' }} onClick={closeDrawer}>
          <div style={{ flex: 1, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '400px', height: '100vh', background: '#fff',
              boxShadow: '-20px 0 60px rgba(15,23,42,0.12)', overflowY: 'auto',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Drawer Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '2rem', position: 'relative' }}>
              <button onClick={closeDrawer} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'grid', placeItems: 'center' }}>✕</button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
                {drawerLoading ? (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ position: 'relative' }}>
                    {drawerUser?.avatar_url ? (
                      <img src={drawerUser.avatar_url} alt={drawerUser.first_name}
                        style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
                    ) : (
                      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'grid', placeItems: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', border: '3px solid rgba(255,255,255,0.2)' }}>
                        {(drawerUser?.first_name || drawerUser?.email || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: drawerUser?.is_active ? '#22c55e' : '#ef4444', border: '2px solid #1e3a5f' }} />
                  </div>
                )}
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{drawerUser?.first_name} {drawerUser?.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>{drawerUser?.email}</div>
                  <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <RoleBadge role={drawerUser?.role} />
                    <StatusBadge active={drawerUser?.is_active} />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.5rem', flex: 1 }}>
              {drawerLoading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading profile...</div>
              ) : (
                <>
                  {/* Profile Details */}
                  <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: 0 }}>Profile Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <ProfileField label="First Name" value={drawerUser?.first_name || '—'} />
                      <ProfileField label="Last Name" value={drawerUser?.last_name || '—'} />
                      <ProfileField label="Username" value={drawerUser?.username || '—'} />
                      <ProfileField label="Phone" value={drawerUser?.phone || '—'} />
                      <ProfileField label="Date of Birth" value={drawerUser?.date_of_birth || '—'} />
                      <ProfileField label="Sex" value={drawerUser?.sex ? (drawerUser.sex.charAt(0).toUpperCase() + drawerUser.sex.slice(1)) : '—'} />
                    </div>
                    <ProfileField label="Email" value={drawerUser?.email} />
                    <ProfileField label="Member Since" value={drawerUser?.created_at ? new Date(drawerUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                    <ProfileField label="Profile Completed" value={drawerUser?.profile_completed ? '✅ Complete' : '⚠️ Incomplete'} />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 1.25rem' }} />

                  {/* Role Management */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '0.75rem' }}>Change Role</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      {['learner', 'instructor', 'admin'].map(role => (
                        <button key={role} disabled={roleChanging || drawerUser?.role === role}
                          onClick={() => changeRole(drawerUser.id, role)}
                          style={{
                            padding: '0.6rem', borderRadius: '0.6rem', border: '1.5px solid',
                            borderColor: drawerUser?.role === role ? '#2563eb' : '#e2e8f0',
                            background: drawerUser?.role === role ? '#eff6ff' : '#fff',
                            color: drawerUser?.role === role ? '#1d4ed8' : '#475569',
                            fontWeight: 700, fontSize: '0.78rem', cursor: drawerUser?.role === role ? 'default' : 'pointer',
                            textTransform: 'capitalize', opacity: roleChanging ? 0.6 : 1
                          }}>
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 1.25rem' }} />

                  {/* Actions */}
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: 0 }}>Account Actions</h3>
                    <button
                      onClick={() => toggleStatus(drawerUser)}
                      style={{
                        padding: '0.8rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, cursor: 'pointer',
                        background: drawerUser?.is_active ? '#fef2f2' : '#f0fdf4',
                        color: drawerUser?.is_active ? '#dc2626' : '#16a34a'
                      }}>
                      {drawerUser?.is_active ? '🚫 Deactivate Account' : '✅ Activate Account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Table ── */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="User Management"
          subtitle="Click any row to view the full profile."
          action={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="instructor">Instructors</option>
                <option value="learner">Learners</option>
              </select>
              <button onClick={() => setShowModal(true)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.8rem', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                + Add User
              </button>
            </div>
          }
        />
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>
                  {['User', 'Role', 'Status', 'Phone', 'Joined', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={6} /> : users.length === 0 ? <EmptyState message="No users found." /> : users.map(user => (
                  <tr key={user.id} className="hover-row clickable-row" onClick={() => openProfile(user)}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar user={user} size={38} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{user.first_name} {user.last_name || user.username}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><RoleBadge role={user.role} /></td>
                    <td style={tdStyle}><StatusBadge active={user.is_active} /></td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{user.phone || '—'}</td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{new Date(user.date_joined || user.created_at).toLocaleDateString()}</td>
                    <td style={tdStyle} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openProfile(user)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                          View
                        </button>
                        <button onClick={() => toggleStatus(user)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: user.is_active ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        .hover-row:hover { background: #f8fbff; }
        .clickable-row { cursor: pointer; }
      `}</style>
    </Layout>
  )
}

// ─── Admin: Student Directory ─────────────────────────────────────────────────

export const AdminStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const fetchStudents = async (q = '') => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/admin/students/', { params: { search: q } })
      setStudents(res.data.students || [])
      setTotal(res.data.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const toggleStatus = async (s) => {
    try {
      await api.patch(`/accounts/users/${s.id}/`, { is_active: !s.is_active })
      fetchStudents(search)
    } catch { alert('Failed to update status') }
  }

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Student Directory"
          subtitle={`${total} learners registered on the platform.`}
          action={<SearchBar value={search} onChange={setSearch} placeholder="Search students..." />}
        />
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>
                  {['Student', 'Status', 'Enrolled Courses', 'Completed', 'Joined', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={6} /> : students.length === 0 ? <EmptyState message="No students found." /> : students.map(s => (
                  <tr key={s.id} className="hover-row">
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar user={s} size={36} />
                    <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><StatusBadge active={s.is_active} /></td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>{s.enrollments}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#16a34a' }}>{s.completed}</td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{s.joined}</td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleStatus(s)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: s.is_active ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        {s.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.hover-row:hover { background: #f8fbff; }`}</style>
    </Layout>
  )
}

// ─── Admin: Course Catalog ─────────────────────────────────────────────────────

export const AdminCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/admin/courses/')
      let data = res.data.courses || []
      setTotal(res.data.total || data.length)
      if (filter === 'published') data = data.filter(c => c.is_published)
      if (filter === 'draft') data = data.filter(c => !c.is_published)
      if (search) data = data.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()))
      setCourses(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCourses() }, [search, filter])

  const togglePublish = async (course) => {
    try {
      await api.patch('/dashboard/admin/courses/', { id: course.id })
      fetchCourses()
    } catch { alert('Failed to toggle publish status') }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) return
    try {
      await api.delete(`/dashboard/admin/courses/?id=${course.id}`)
      fetchCourses()
    } catch { alert('Failed to delete course') }
  }

  const difficultyColors = { beginner: '#16a34a', intermediate: '#ea580c', advanced: '#dc2626' }

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Course Catalog"
          subtitle={`Managing ${total} courses across all instructors.`}
          action={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          }
        />
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>{['Course', 'Instructor', 'Category', 'Difficulty', 'Students', 'Status', 'Created', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={8} /> : courses.length === 0 ? <EmptyState message="No courses found." /> : courses.map(c => (
                  <tr key={c.id} className="hover-row">
                    <td style={tdStyle}><span style={{ fontWeight: 800, color: '#0f172a' }}>{c.title}</span></td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{c.instructor}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{c.category}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: difficultyColors[c.difficulty] || '#64748b', textTransform: 'capitalize' }}>{c.difficulty}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{c.student_count}</td>
                    <td style={tdStyle}><PublishBadge published={c.is_published} /></td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{c.created_at}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/courses/${c.id}`}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                          View
                        </Link>
                        <button onClick={() => togglePublish(c)}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: c.is_published ? '#ea580c' : '#16a34a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          {c.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => handleDelete(c)}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.hover-row:hover { background: #f8fbff; }`}</style>
    </Layout>
  )
}

// ─── Admin: Category Management ───────────────────────────────────────────────

export const AdminCategories = () => {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(null) // null = add, id = edit
  const [form, setForm] = useState({ name: '', description: '', icon: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchCats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/admin/categories/')
      setCats(res.data.categories || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCats() }, [])

  const openAdd = () => { setForm({ name: '', description: '', icon: '' }); setEditMode(null); setShowForm(true); setError('') }
  const openEdit = (cat) => { setForm({ id: cat.id, name: cat.name, description: cat.description, icon: cat.icon }); setEditMode(cat.id); setShowForm(true); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editMode) {
        await api.patch('/dashboard/admin/categories/', { ...form, id: editMode })
      } else {
        await api.post('/dashboard/admin/categories/', form)
      }
      setShowForm(false)
      fetchCats()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category.')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Courses assigned to it will lose their category.')) return
    try {
      await api.delete(`/dashboard/admin/categories/?id=${id}`)
      fetchCats()
    } catch { alert('Failed to delete category') }
  }

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Category Management"
          subtitle="Organise courses into navigable subject areas."
          action={
            <button onClick={openAdd} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.8rem', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              + New Category
            </button>
          }
        />

        {showForm && (
          <div style={{ ...cardStyle, padding: '1.75rem' }}>
            <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>{editMode ? 'Edit Category' : 'Add Category'}</h2>
            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Icon</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 💻 or react"
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {submitting ? 'Saving...' : editMode ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ ...cardStyle, padding: '1.5rem', minHeight: '120px', background: '#f8fafc' }} />
            ))
          ) : cats.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No categories yet. Add your first one.</div>
          ) : cats.map(cat => (
            <div key={cat.id} style={{ ...cardStyle, padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {cat.icon && <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>}
                  <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{cat.name}</h3>
                </div>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  {cat.course_count} course{cat.course_count !== 1 ? 's' : ''}
                </span>
              </div>
              {cat.description && <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{cat.description}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button onClick={() => openEdit(cat)} style={{ padding: '0.4rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.4rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

// ─── Admin: Instructor Management (stub for sidebar nav) ─────────────────────

export const AdminInstructors = () => {
  // Reuse ManageInstructors logic inline
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchInstructors = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accounts/users/', { params: { role: 'instructor', search } })
      setInstructors(res.data.results || res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchInstructors, 300)
    return () => clearTimeout(t)
  }, [search])

  const toggleStatus = async (instr) => {
    try {
      await api.patch(`/accounts/users/${instr.id}/`, { is_active: !instr.is_active })
      fetchInstructors()
    } catch { alert('Failed to update status') }
  }

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Instructor Management"
          subtitle="Oversee teaching staff across your platform."
          action={<SearchBar value={search} onChange={setSearch} placeholder="Search instructors..." />}
        />
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>{['Instructor', 'Status', 'Joined', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={4} /> : instructors.length === 0 ? <EmptyState message="No instructors found." /> : instructors.map(instr => (
                  <tr key={instr.id} className="hover-row">
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 900 }}>
                          {(instr.first_name || instr.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{instr.first_name} {instr.last_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{instr.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><StatusBadge active={instr.is_active} /></td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{new Date(instr.date_joined).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleStatus(instr)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: instr.is_active ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        {instr.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.hover-row:hover { background: #f8fbff; }`}</style>
    </Layout>
  )
}

// ─── Admin: Certificates Monitor ──────────────────────────────────────────────

export const AdminCertificates = () => {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const fetchCerts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/admin/certificates/')
      let data = res.data.certificates || []
      setTotal(res.data.total || data.length)
      if (search) data = data.filter(c =>
        c.learner.toLowerCase().includes(search.toLowerCase()) ||
        c.course.toLowerCase().includes(search.toLowerCase()) ||
        c.certificate_number.toLowerCase().includes(search.toLowerCase())
      )
      setCerts(data)
    } finally { setLoading(false) }
  }

  const toggleValidity = async (c) => {
    try {
      await api.patch('/dashboard/admin/certificates/', { id: c.id, is_valid: !c.is_valid })
      fetchCerts()
    } catch { alert('Failed to update certificate validity') }
  }

  useEffect(() => { fetchCerts() }, [search])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Issued Certificates"
          subtitle={`${total} certificates awarded to learners.`}
          action={<SearchBar value={search} onChange={setSearch} placeholder="Search by learner or course..." />}
        />
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>{['Learner', 'Course', 'Certificate #', 'Issued On', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={6} /> : certs.length === 0 ? <EmptyState message="No certificates issued yet." /> : certs.map(c => (
                  <tr key={c.id} className="hover-row">
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.learner}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.learner_email}</div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{c.course}</td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: '#334155' }}>{c.certificate_number}</span>
                    </td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{c.issued_at}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '999px', background: c.is_valid !== false ? '#dcfce7' : '#fee2e2', color: c.is_valid !== false ? '#166534' : '#991b1b', border: `1px solid ${c.is_valid !== false ? '#bbf7d0' : '#fecaca'}` }}>
                        {c.is_valid !== false ? 'Valid' : 'Revoked'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/certificate/${c.id}`}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                          View
                        </Link>
                        <button onClick={() => toggleValidity(c)}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: '#fff', color: c.is_valid !== false ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          {c.is_valid !== false ? 'Revoke' : 'Issue'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.hover-row:hover { background: #f8fbff; }`}</style>
    </Layout>
  )
}

// ─── Admin: Platform Analytics ────────────────────────────────────────────────

const BarChart = ({ data, label, color = '#2563eb', valueKey = 'count' }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
        {data.map((d, i) => {
          const pct = (d[valueKey] / max) * 100
          const isCurrent = i === data.length - 1
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{d[valueKey]}</div>
              <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, background: isCurrent ? color : `${color}33`, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} />
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{d.month}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const AdminAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin/analytics/')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading analytics...</div></Layout>
  if (!data) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#dc2626' }}>Failed to load analytics.</div></Layout>

  const kpis = [
    { label: 'Total Users', value: data.total_users, color: '#2563eb' },
    { label: 'Learners', value: data.total_learners, color: '#0ea5e9' },
    { label: 'Instructors', value: data.total_instructors, color: '#7c3aed' },
    { label: 'Total Courses', value: data.total_courses, color: '#059669' },
    { label: 'Published', value: data.published_courses, color: '#16a34a' },
    { label: 'Certificates', value: data.total_certificates, color: '#f59e0b' },
    { label: 'Completion Rate', value: `${data.completion_rate}%`, color: '#ea580c' },
    { label: 'Total Revenue', value: `$${data.total_revenue.toFixed(2)}`, color: '#0f172a' },
  ]

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader title="Platform Analytics" subtitle="Real-time intelligence across your learning platform." />

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {kpis.map(k => (
            <div key={k.label} style={{ ...cardStyle, padding: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>{k.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <BarChart data={data.registrations} label="User Registrations (6 months)" color="#2563eb" valueKey="count" />
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <BarChart data={data.enrollments} label="New Enrollments (6 months)" color="#0ea5e9" valueKey="count" />
          </div>
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <BarChart data={data.revenue} label="Revenue (6 months)" color="#059669" valueKey="amount" />
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ─── Admin: Payments & Revenue ────────────────────────────────────────────────

export const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [revenue, setRevenue] = useState(0)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/admin/payments/')
      let data = res.data.payments || []
      setTotal(res.data.total || data.length)
      setRevenue(res.data.total_revenue || 0)
      if (statusFilter) data = data.filter(p => p.status === statusFilter)
      if (search) data = data.filter(p =>
        p.learner.toLowerCase().includes(search.toLowerCase()) ||
        p.learner_email.toLowerCase().includes(search.toLowerCase())
      )
      setPayments(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchPayments() }, [search, statusFilter])

  return (
    <Layout>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <PageHeader
          title="Payment & Revenue Center"
          subtitle={`${total} transactions · $${Number(revenue).toFixed(2)} total completed revenue`}
          action={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search by learner..." />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          }
        />

        {/* Revenue Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Revenue', value: `$${Number(revenue).toFixed(2)}`, color: '#16a34a' },
            { label: 'Total Transactions', value: total, color: '#2563eb' },
            { label: 'Completed', value: payments.filter(p => p.status === 'completed').length, color: '#059669' },
            { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: '#ca8a04' },
          ].map(k => (
            <div key={k.label} style={{ ...cardStyle, padding: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>{k.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>{['Learner', 'Plan', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? <LoadingRows cols={6} /> : payments.length === 0 ? <EmptyState message="No payment records found." /> : payments.map(p => (
                  <tr key={p.id} className="hover-row">
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.learner}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.learner_email}</div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{p.plan}</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#0f172a' }}>${p.amount.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.currency}</span></td>
                    <td style={{ ...tdStyle, color: '#64748b', textTransform: 'capitalize', fontSize: '0.85rem' }}>{p.method}</td>
                    <td style={tdStyle}><PaymentStatusBadge status={p.status} /></td>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.85rem' }}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.hover-row:hover { background: #f8fbff; }`}</style>
    </Layout>
  )
}
