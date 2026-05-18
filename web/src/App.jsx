import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy-loaded pages for code splitting
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminDashboard = lazy(() => import('./pages/DashboardAdmin'))
const InstructorDashboard = lazy(() => import('./pages/DashboardInstructor'))
const Courses = lazy(() => import('./pages/Courses'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const CourseBuilder = lazy(() => import('./pages/CourseBuilder'))
const LessonViewer = lazy(() => import('./pages/LessonViewer'))
const MyLearning = lazy(() => import('./pages/MyLearning'))
const Certificates = lazy(() => import('./pages/Certificates'))
const PracticeLab = lazy(() => import('./pages/PracticeLab'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const LearningPath = lazy(() => import('./pages/LearningPath'))
const Assignments = lazy(() => import('./pages/Assignments'))
const Messages = lazy(() => import('./pages/Messages'))
const Community = lazy(() => import('./pages/Community'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Signup = lazy(() => import('./pages/Signup'))
const ManageInstructors = lazy(() => import('./pages/ManageInstructors'))
const ManageAnnouncements = lazy(() => import('./pages/ManageAnnouncements'))
const Finance = lazy(() => import('./pages/Finance'))
const Reports = lazy(() => import('./pages/Reports'))
const CertificateDetail = lazy(() => import('./pages/CertificateDetail'))
import {
  InstructorCourses,
  CreateCourse,
  InstructorLessons,
  InstructorAssignments,
  InstructorStudents,
  InstructorSubmissions,
  InstructorCertificates,
  InstructorMessages,
  InstructorAnalytics
} from './pages/InstructorStudio'
import {
  AdminUsers,
  AdminInstructors,
  AdminStudents,
  AdminCourses,
  AdminCategories,
  AdminCertificates,
  AdminAnalytics,
  AdminPayments
} from './pages/AdminStudio'






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
     <Suspense fallback={
       <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)' }}>
         <div style={{ textAlign: 'center' }}>
           <div style={{ width: 40, height: 40, margin: '0 auto 1rem', borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />
           <p style={{ color: '#64748b', fontWeight: 600 }}>Loading...</p>
           <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
         </div>
       </div>
     }>
     <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<PrivateRoute allowedRoles={allRoles}><Dashboard /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute allowedRoles={allRoles}><Courses /></PrivateRoute>} />
        <Route path="/courses/:id" element={<PrivateRoute allowedRoles={allRoles}><CourseDetail /></PrivateRoute>} />
        <Route path="/lessons/:id" element={<PrivateRoute allowedRoles={allRoles}><LessonViewer /></PrivateRoute>} />
        <Route path="/my-learning" element={<PrivateRoute allowedRoles={['learner']}><MyLearning /></PrivateRoute>} />
        <Route path="/learning-path" element={<PrivateRoute allowedRoles={['learner']}><LearningPath /></PrivateRoute>} />
        <Route path="/assignments" element={<PrivateRoute allowedRoles={['learner']}><Assignments /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute allowedRoles={['learner', 'instructor']}><Messages /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute allowedRoles={allRoles}><Community /></PrivateRoute>} />
        <Route path="/practice" element={<PrivateRoute allowedRoles={allRoles}><PracticeLab /></PrivateRoute>} />
        <Route path="/certificates" element={<PrivateRoute allowedRoles={['admin', 'learner']}><Certificates /></PrivateRoute>} />
        <Route path="/certificate/:id" element={<PrivateRoute allowedRoles={['admin', 'learner']}><CertificateDetail /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute allowedRoles={allRoles}><Announcements /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute allowedRoles={allRoles}><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute allowedRoles={allRoles}><Settings /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/instructors" element={<PrivateRoute allowedRoles={['admin']}><ManageInstructors /></PrivateRoute>} />
        <Route path="/admin/announcements" element={<PrivateRoute allowedRoles={['admin']}><ManageAnnouncements /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/students" element={<PrivateRoute allowedRoles={['admin']}><AdminStudents /></PrivateRoute>} />
        <Route path="/admin/courses" element={<PrivateRoute allowedRoles={['admin']}><AdminCourses /></PrivateRoute>} />
        <Route path="/admin/categories" element={<PrivateRoute allowedRoles={['admin']}><AdminCategories /></PrivateRoute>} />
        <Route path="/admin/certificates" element={<PrivateRoute allowedRoles={['admin']}><AdminCertificates /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['admin']}><AdminAnalytics /></PrivateRoute>} />
        <Route path="/admin/payments" element={<PrivateRoute allowedRoles={['admin']}><AdminPayments /></PrivateRoute>} />
        <Route path="/admin/finance" element={<PrivateRoute allowedRoles={['admin']}><Finance /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />

        <Route path="/instructor" element={<PrivateRoute allowedRoles={['instructor']}><InstructorDashboard /></PrivateRoute>} />
        <Route path="/instructor/courses" element={<PrivateRoute allowedRoles={['instructor']}><InstructorCourses /></PrivateRoute>} />
        <Route path="/instructor/courses/builder" element={<PrivateRoute allowedRoles={['instructor']}><CourseBuilder /></PrivateRoute>} />
        <Route path="/instructor/courses/:course_id/builder" element={<PrivateRoute allowedRoles={['instructor']}><CourseBuilder /></PrivateRoute>} />
        <Route path="/instructor/lessons" element={<PrivateRoute allowedRoles={['instructor']}><InstructorLessons /></PrivateRoute>} />
        <Route path="/instructor/assignments" element={<PrivateRoute allowedRoles={['instructor']}><InstructorAssignments /></PrivateRoute>} />
        <Route path="/instructor/students" element={<PrivateRoute allowedRoles={['instructor']}><InstructorStudents /></PrivateRoute>} />
        <Route path="/instructor/submissions" element={<PrivateRoute allowedRoles={['instructor']}><InstructorSubmissions /></PrivateRoute>} />
        <Route path="/instructor/certificates" element={<PrivateRoute allowedRoles={['instructor']}><InstructorCertificates /></PrivateRoute>} />
        <Route path="/instructor/announcements" element={<PrivateRoute allowedRoles={['instructor']}><ManageAnnouncements /></PrivateRoute>} />
        <Route path="/instructor/messages" element={<PrivateRoute allowedRoles={['instructor']}><InstructorMessages /></PrivateRoute>} />
        <Route path="/instructor/analytics" element={<PrivateRoute allowedRoles={['instructor']}><InstructorAnalytics /></PrivateRoute>} />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
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


