import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/DashboardAdmin'
import InstructorDashboard from './pages/DashboardInstructor'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonViewer from './pages/LessonViewer'
import MyLearning from './pages/MyLearning'
import Certificates from './pages/Certificates'
import PracticeLab from './pages/PracticeLab'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Announcements from './pages/Announcements'
import Signup from './pages/Signup'
import ManageInstructors from './pages/ManageInstructors'
import ManageAnnouncements from './pages/ManageAnnouncements'
import Finance from './pages/Finance'
import Reports from './pages/Reports'




function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, margin: '0 auto 1rem', borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontWeight: 600 }}>Opening KEDI Developer Hub...</p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const allRoles = ['admin', 'instructor', 'learner']

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<PrivateRoute allowedRoles={allRoles}><Dashboard /></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute allowedRoles={allRoles}><Courses /></PrivateRoute>} />
      <Route path="/courses/:id" element={<PrivateRoute allowedRoles={allRoles}><CourseDetail /></PrivateRoute>} />
      <Route path="/lessons/:id" element={<PrivateRoute allowedRoles={allRoles}><LessonViewer /></PrivateRoute>} />
      <Route path="/my-learning" element={<PrivateRoute allowedRoles={['learner']}><MyLearning /></PrivateRoute>} />
      <Route path="/practice" element={<PrivateRoute allowedRoles={allRoles}><PracticeLab /></PrivateRoute>} />
      <Route path="/certificates" element={<PrivateRoute allowedRoles={['admin', 'learner']}><Certificates /></PrivateRoute>} />
      <Route path="/announcements" element={<PrivateRoute allowedRoles={allRoles}><Announcements /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute allowedRoles={allRoles}><Profile /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute allowedRoles={allRoles}><Settings /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/instructors" element={<PrivateRoute allowedRoles={['admin']}><ManageInstructors /></PrivateRoute>} />
      <Route path="/admin/announcements" element={<PrivateRoute allowedRoles={['admin']}><ManageAnnouncements /></PrivateRoute>} />
      <Route path="/admin/finance" element={<PrivateRoute allowedRoles={['admin']}><Finance /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
      <Route path="/instructor" element={<PrivateRoute allowedRoles={['instructor']}><InstructorDashboard /></PrivateRoute>} />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
