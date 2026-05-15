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

const ImageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const CodeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const RocketIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.5-2 4-2 4s2.5-.5 4-2l2-2-2-2-2 2Z" />
    <path d="M14 10 9 15" />
    <path d="M16 4c3.2 0 5 1.8 5 5-3.8.4-6.8 3.4-7.2 7.2-3.2 0-5-1.8-5-5C8.8 7 12 4 16 4Z" />
  </svg>
)

const PostCard = ({ post, onLike }) => {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState(null)
  const [commentImagePreview, setCommentImagePreview] = useState(null)
  const [postingComment, setPostingComment] = useState(false)

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const res = await api.get(`/community/comments/?post=${post.id}`)
      setComments(res.data.results || res.data || [])
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    if (showComments) fetchComments()
  }, [showComments])

  const handleCommentImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCommentImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setCommentImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setPostingComment(true)
    try {
      const formData = new FormData()
      formData.append('post', post.id)
      formData.append('content', commentText)
      if (commentImage) formData.append('image', commentImage)

      await api.post('/community/comments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCommentText('')
      setCommentImage(null)
      setCommentImagePreview(null)
      fetchComments()
      post.comments_count += 1
    } catch (err) {
      console.error('Comment failed', err)
    } finally {
      setPostingComment(false)
    }
  }

  return (
    <div className="post-card">
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

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div className={`post-type-badge type-${post.post_type}`}>
          {post.post_type === 'issue' ? <CodeIcon size={12} /> : post.post_type === 'project' ? <RocketIcon size={12} /> : <MessageSquareIcon size={12} />}
          {post.post_type}
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.4 }}>{post.title}</h3>

      <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        {post.content}
      </p>

      {post.image && (
        <img src={post.image} alt={post.title} className="post-img" />
      )}

      {post.tags && (
        <div style={{ marginBottom: '1rem' }}>
          {post.tags.split(',').map((tag, i) => tag.trim() && <span key={i} className="tag-c">#{tag.trim()}</span>)}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className={`act-btn ${post.is_liked ? 'liked' : ''}`}
          onClick={() => onLike(post.id, post.is_liked)}
        >
          <HeartIcon size={17} color={post.is_liked ? '#ef4444' : 'currentColor'} filled={post.is_liked} />
          {post.likes_count}
        </button>
        <button className="act-btn" onClick={() => setShowComments(!showComments)}>
          <MessageSquareIcon size={17} />
          {post.comments_count} Replies
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <form onSubmit={submitComment} style={{ marginBottom: '1.5rem' }}>
            <textarea
              className="form-f"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a reply..."
              style={{ minHeight: '80px', marginBottom: '0.5rem', fontSize: '0.9rem' }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" id={`comment-img-${post.id}`} style={{ display: 'none' }} onChange={handleCommentImage} />
                <label htmlFor={`comment-img-${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
                  <ImageIcon size={14} /> {commentImage ? 'Image attached' : 'Attach image'}
                </label>
                {commentImagePreview && (
                  <div style={{ marginTop: '0.4rem', position: 'relative', width: '60px' }}>
                    <img src={commentImagePreview} alt="Preview" style={{ width: '100%', height: '40px', objectFit: 'cover', borderRadius: '0.4rem' }} />
                    <button type="button" onClick={() => { setCommentImage(null); setCommentImagePreview(null); }} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '10px', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={postingComment} style={{ padding: '0.5rem 1rem', borderRadius: '0.6rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
                {postingComment ? '...' : 'Reply'}
              </button>
            </div>
          </form>

          {loadingComments ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Loading replies...</p>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No replies yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="avatar-c" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{(comment.author_name || 'U')[0]}</div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{comment.author_name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>{comment.content}</p>
                    {comment.image && (
                      <img src={comment.image} alt="Reply" style={{ marginTop: '0.6rem', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Community() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', tags: '', post_type: 'discussion' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
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
      const formData = new FormData()
      formData.append('title', newPost.title)
      formData.append('content', newPost.content)
      formData.append('post_type', newPost.post_type)
      if (newPost.category) formData.append('category', newPost.category)
      if (newPost.tags) formData.append('tags', newPost.tags)
      if (selectedImage) formData.append('image', selectedImage)

      await api.post('/community/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowCreateModal(false)
      setNewPost({ title: '', content: '', category: '', tags: '', post_type: 'discussion' })
      setSelectedImage(null)
      setImagePreview(null)
      fetchData()
    } catch (err) {
      console.error('Failed to create post', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <Layout>
      <style>{`
        .comm-glass { background: rgba(255,255,255,0.9); border: 1px solid rgba(148,163,184,0.15); box-shadow: 0 10px 30px rgba(15,23,42,0.04); border-radius: 1.25rem; }
        .post-card { border-bottom: 1px solid #e2e8f0; padding: 1.5rem; transition: background 0.2s; }
        .post-card:last-child { border-bottom: none; }
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
        .post-type-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.6rem; borderRadius: 0.5rem; fontSize: 0.75rem; fontWeight: 800; textTransform: uppercase; margin-bottom: 0.5rem; }
        .type-discussion { background: #eff6ff; color: #2563eb; }
        .type-issue { background: #fef2f2; color: #dc2626; }
        .type-project { background: #f0fdf4; color: #16a34a; }
        .post-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 1rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; }
        .type-btn { flex: 1; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; transition: all 0.2s; }
        .type-btn:hover { border-color: #2563eb; background: #f8fbff; }
        .type-btn.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; font-weight: 800; }
      `}</style>

      <div className="container" style={{ padding: '0 0.75rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }} className="mobile-only">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Community</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Connect and learn with developers.</p>
          <button onClick={() => setShowCreateModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
            <PlusIcon size={18} /> New Post
          </button>
        </div>

        <div className="desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>Community</h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Connect, share, and learn with fellow KEDI developers.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)', fontFamily: 'inherit' }}>
            <PlusIcon size={18} /> New Post
          </button>
        </div>

        <div className="flex-responsive" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
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
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>

          <div className="community-sidebar" style={{ width: '100%', maxWidth: 280, flexShrink: 0, position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <style>{`
               @media (max-width: 768px) {
                 .community-sidebar { max-width: 100% !important; position: static !important; order: -1; }
                 .community-sidebar .comm-glass { padding: 1rem !important; }
                 .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
                 .guidelines-card { display: none; }
               }
            `}</style>
            <div className="comm-glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Categories</h3>
              <div className="categories-grid">
                <button className={`cat-btn-c ${activeCategory === '' ? 'active' : ''}`} onClick={() => { setActiveCategory(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  All Topics
                </button>
                {categories.map(cat => (
                  <button key={cat.id} className={`cat-btn-c ${activeCategory === cat.slug ? 'active' : ''}`} onClick={() => { setActiveCategory(cat.slug); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="comm-glass guidelines-card" style={{ padding: '1.5rem', background: 'linear-gradient(160deg,#1e293b,#0f172a)', border: 'none', color: '#fff' }}>
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

      {showCreateModal && (
        <div className="modal-ov" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Create Post</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', fontFamily: 'inherit' }}>×</button>
            </div>

            <form onSubmit={handleCreatePost}>
              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Title</label>
              <input className="form-f" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="What's on your mind?" required />

              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Post Type</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <button type="button" className={`type-btn ${newPost.post_type === 'discussion' ? 'active' : ''}`} onClick={() => setNewPost({...newPost, post_type: 'discussion'})}>
                  <MessageSquareIcon size={18} />
                  <span>Discussion</span>
                </button>
                <button type="button" className={`type-btn ${newPost.post_type === 'issue' ? 'active' : ''}`} onClick={() => setNewPost({...newPost, post_type: 'issue'})}>
                  <CodeIcon size={18} />
                  <span>Code Issue</span>
                </button>
                <button type="button" className={`type-btn ${newPost.post_type === 'project' ? 'active' : ''}`} onClick={() => setNewPost({...newPost, post_type: 'project'})}>
                  <RocketIcon size={18} />
                  <span>Project</span>
                </button>
              </div>

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
                  <input className="form-f" value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} placeholder="react, python, debug" />
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Content</label>
              <textarea className="form-f" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder="Describe your question..." style={{ minHeight: 120, resize: 'vertical' }} required />

              <label style={{ display: 'block', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Attach Image</label>
              <div style={{ marginBottom: '1.5rem' }}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="post-image-input" />
                <label htmlFor="post-image-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '2px dashed #cbd5e1', borderRadius: '0.75rem', cursor: 'pointer', color: '#64748b', fontWeight: 700 }}>
                  <ImageIcon size={20} />
                  {selectedImage ? selectedImage.name : 'Choose an image...'}
                </label>
                {imagePreview && (
                  <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.75rem' }} />
                    <button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(15,23,42,0.6)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting || !newPost.title || !newPost.content} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{submitting ? 'Publishing...' : 'Publish Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}