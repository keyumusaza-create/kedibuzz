import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const MessageSquareIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const HeartIcon = ({ size = 20, color = 'currentColor', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export default function Community() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', tags: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeCategory])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = activeCategory ? `?category=${activeCategory}` : ''
      const [postsRes, catsRes] = await Promise.all([
        api.get('/community/posts/' + params),
        api.get('/community/categories/')
      ])
      setPosts(postsRes.data.results || postsRes.data || [])
      setCategories(catsRes.data.results || catsRes.data || [])
    } catch (err) {
      console.error('Failed to load community data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId, isLiked) => {
    try {
      await api.post('/community/posts/' + postId + '/like/')
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: !isLiked, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ))
    } catch (err) {
      console.error('Like failed', err)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/community/posts/', newPost)
      setShowCreateModal(false)
      setNewPost({ title: '', content: '', category: '', tags: '' })
      fetchData()
    } catch (err) {
      console.error('Failed to create post', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <style>{`
        .comm-glass { background: rgba(255,255,255,0.9); border: 1px solid rgba(148,163,184,0.15); box-shadow: 0 10px 30px rgba(15,23,42,0.04); border-radius: 1.25rem; }
        .post-card { border-bottom: 1px solid #e2e8f0; padding: 1.5rem; transition: background 0.2s; }
        .post-card:last-child { border-bottom: none; }
        .post-card:hover { background: #f8fafc; }
        .avatar-c { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
        .tag-c { background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-right: 0.4rem; }
        .act-btn { display: flex; align-items: center; gap: 0.4rem; background: transparent; border: none; color: #64748b; font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 0.4rem 0.75rem; border-radius: 0.5rem; transition: all 0.2s; }
        .act-btn:hover { background: #f1f5f9; color: #0f172a; }
        .act-btn.liked { color: #ef4444; }
        .act-btn.liked:hover { background: #fef2f2; }
        .cat-btn-c { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 1rem; background: transparent; border: none; text-align: left; color: #64748b; font-weight: 600; cursor: pointer; border-radius: 0.5rem; margin-bottom: 0.2rem; transition: all 0.18s; font-family: inherit; font-size: 0.95rem; }
        .cat-btn-c:hover { background: #f1f5f9; color: #0f172a; }
        .cat-btn-c.active { background: #eff6ff; color: #2563eb; font-weight: 800; }
        .modal-ov { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: 1000; display: grid; place-items: center; padding: 1rem; }
        .modal-box { background: #fff; width: 100%; max-width: 600px; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-height: 90vh; overflow-y: auto; }
        .form-f { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; font-size: 0.95rem; font-family: inherit; margin-bottom: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .form-f:focus { border-color: #2563eb; }
      `}</style>

      <div style={{ padding: '0 1rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>Community</h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Connect, share, and learn with fellow KEDI developers.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)', fontFamily: 'inherit' }}
          >
            <PlusIcon size={18} /> New Post
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Posts Feed */}
          <div className="comm-glass" style={{ flex: 1, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading posts...</div>
            ) : posts.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ marginBottom: '1rem' }}><MessageSquareIcon size={48} color="#cbd5e1" /></div>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>No posts here yet.</p>
                <button onClick={() => { setActiveCategory(''); fetchData() }} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  View all posts
                </button>
              </div>
            ) : posts.map(post => (
              <div key={post.id} className="post-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="avatar-c">{(post.author_name || 'U')[0]}</div>
                  <div>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', margin: 0 }}>{post.author_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      {post.category_name && ` • ${post.category_name}`}
                    </p>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.4 }}>{post.title}</h3>

                <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </p>

                {post.tags && (
                  <div style={{ marginBottom: '1rem' }}>
                    {post.tags.split(',').map((tag, i) => tag.trim() && <span key={i} className="tag-c">#{tag.trim()}</span>)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`act-btn ${post.is_liked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id, post.is_liked)}
                  >
                    <HeartIcon size={17} color={post.is_liked ? '#ef4444' : 'currentColor'} filled={post.is_liked} />
                    {post.likes_count}
                  </button>
                  <button className="act-btn">
                    <MessageSquareIcon size={17} />
                    {post.comments_count}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="comm-glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Categories</h3>
              <button
                className={`cat-btn-c ${activeCategory === '' ? 'active' : ''}`}
                onClick={() => setActiveCategory('')}
              >
                All Topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn-c ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="comm-glass" style={{ padding: '1.5rem', background: 'linear-gradient(160deg,#1e293b,#0f172a)', border: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, marginBottom: '0.75rem' }}>Community Guidelines</h3>
              <ul style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li>Be respectful and constructive</li>
                <li>Share code to explain issues</li>
                <li>Search before you post</li>
                <li>Format code blocks properly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-ov" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Create Post</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', fontFamily: 'inherit' }}>×</button>
            </div>

            <form onSubmit={handleCreatePost}>
              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Title</label>
              <input
                className="form-f"
                value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="What's on your mind?"
                required
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Category</label>
                  <select className="form-f" value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}>
                    <option value="">Select...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Tags</label>
                  <input
                    className="form-f"
                    value={newPost.tags}
                    onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="react, python, debug"
                  />
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Content</label>
              <textarea
                className="form-f"
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Describe your question or share something useful..."
                style={{ minHeight: 140, resize: 'vertical' }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newPost.title || !newPost.content}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: submitting || !newPost.title || !newPost.content ? 'not-allowed' : 'pointer', opacity: submitting || !newPost.title || !newPost.content ? 0.6 : 1, fontFamily: 'inherit' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}