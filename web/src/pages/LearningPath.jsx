import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const CheckIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const LockIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const PlayIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export default function LearningPath() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          api.get('/courses/'),
          api.get('/enrollments/')
        ])
        const coursesData = coursesRes.data.results || coursesRes.data
        const enrollmentsData = enrollmentsRes.data.results || enrollmentsRes.data
        
        setCourses(Array.isArray(coursesData) ? coursesData : [])
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
      } catch (err) {
        console.error("Failed to fetch learning path data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading your learning path...</div>
      </Layout>
    )
  }

  // Use safe versions of data for filtering and lookups
  const safeCourses = Array.isArray(courses) ? courses : []
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : []

  // Group courses by difficulty to create a roadmap
  const groupedCourses = {
    beginner: safeCourses.filter(c => c.difficulty === 'beginner'),
    intermediate: safeCourses.filter(c => c.difficulty === 'intermediate'),
    advanced: safeCourses.filter(c => c.difficulty === 'advanced')
  }

  // Create an ordered path representation (levels)
  const pathLevels = [
    { id: 'level-1', title: 'Foundations', level: 'beginner', courses: groupedCourses.beginner },
    { id: 'level-2', title: 'Core Engineering', level: 'intermediate', courses: groupedCourses.intermediate },
    { id: 'level-3', title: 'Advanced Mastery', level: 'advanced', courses: groupedCourses.advanced }
  ]

  // Determine if a level is unlocked.
  // Rule: Core is unlocked if at least 1 Foundation is complete. Advanced is unlocked if at least 1 Core is complete.

  // Determine if a level is unlocked.
  // Rule: Core is unlocked if at least 1 Foundation is complete. Advanced is unlocked if at least 1 Core is complete.
  const isCourseComplete = (courseId) => {
    const enr = safeEnrollments.find(e => e?.course?.id === courseId)
    return enr ? enr.is_completed : false
  }
  
  const getCourseProgress = (courseId) => {
    const enr = safeEnrollments.find(e => e?.course?.id === courseId)
    return enr ? enr.progress : 0
  }

  const isLevelComplete = (levelCourses) => {
    const levelArray = Array.isArray(levelCourses) ? levelCourses : []
    if (!levelArray.length) return true; 
    return levelArray.some(c => isCourseComplete(c.id))
  }

  let unlockedLevels = { 'level-1': true, 'level-2': false, 'level-3': false }
  if (isLevelComplete(groupedCourses.beginner)) unlockedLevels['level-2'] = true
  if (unlockedLevels['level-2'] && isLevelComplete(groupedCourses.intermediate)) unlockedLevels['level-3'] = true

  return (
    <Layout>
      <style>{`
        .roadmap-container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          padding: 2rem 0;
        }
        .roadmap-line {
          position: absolute;
          left: 40px;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          z-index: 1;
        }
        .level-block {
          position: relative;
          z-index: 2;
          margin-bottom: 4rem;
          padding-left: 80px;
        }
        .level-marker {
          position: absolute;
          left: 20px;
          top: 0;
          width: 44px;
          height: 44px;
          background: #fff;
          border-radius: 50%;
          border: 4px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #94a3b8;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }
        .level-marker.unlocked {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .level-marker.completed {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }
        .course-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(15,23,42,0.03);
          margin-top: 1.5rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .course-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(15,23,42,0.08);
        }
        .course-card.locked {
          opacity: 0.7;
          filter: grayscale(100%);
          pointer-events: none;
        }
        .course-thumb {
          width: 120px;
          height: 80px;
          border-radius: 0.75rem;
          background: #f1f5f9;
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
        }
        .progress-track {
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          overflow: hidden;
          margin-top: 0.75rem;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
      `}</style>

      <div style={{ padding: '0 1rem 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Your Learning <span style={{ color: '#2563eb' }}>Path</span></h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 600 }}>Follow this curated roadmap to build your skills from foundation to mastery. Unlock new levels as you complete courses.</p>
      </div>

      <div className="roadmap-container">
        <div className="roadmap-line" />
        
        {pathLevels.map((lvl, index) => {
          const isUnlocked = unlockedLevels[lvl.id]
          const isCompleted = isLevelComplete(lvl.courses) && isUnlocked && lvl.courses.length > 0
          
          return (
            <div key={lvl.id} className="level-block">
              <div className={`level-marker ${isUnlocked ? 'unlocked' : ''} ${isCompleted ? 'completed' : ''}`}>
                {isCompleted ? <CheckIcon size={24} /> : (isUnlocked ? index + 1 : <LockIcon size={20} />)}
              </div>
              
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: isUnlocked ? '#0f172a' : '#94a3b8' }}>
                  Stage {index + 1}: {lvl.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {lvl.level.charAt(0).toUpperCase() + lvl.level.slice(1)} Level
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {lvl.courses.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem', borderRadius: '1rem', border: '1px dashed #cbd5e1', marginTop: '1.5rem', color: '#94a3b8' }}>
                      <p>Content coming soon</p>
                    </div>
                  ) : (
                    lvl.courses.map(course => {
                      const completed = isCourseComplete(course.id)
                      const progress = getCourseProgress(course.id)
                      
                      return (
                        <div className="course-card" key={course.id}>
                          <div className="course-thumb" style={{ backgroundImage: `url(${course.thumbnail})` }} />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{course.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                            
                            {isUnlocked && (
                              <div className="progress-track">
                                <div className="progress-bar" style={{ width: `${progress}%` }} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0, minWidth: 120 }}>
                            {completed ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce3', color: '#16a34a', padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.85rem' }}>
                                <CheckIcon size={16} /> Completed
                              </div>
                            ) : isUnlocked ? (
                              <button 
                                onClick={() => navigate(`/courses/${course.id}`)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: progress > 0 ? '#0f172a' : '#eff6ff', color: progress > 0 ? '#fff' : '#2563eb', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                {progress > 0 ? 'Continue' : 'Start'} 
                                {progress === 0 && <PlayIcon size={16} />}
                              </button>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                                <LockIcon size={16} /> Locked
                              </div>
                            )}
                            {isUnlocked && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{progress}% Complete</span>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
