import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const SendIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/messages/conversations/')
      setConversations(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to fetch conversations', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages/`)
      setMessages(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to fetch messages', error)
    }
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      await api.post(`/messages/conversations/${selectedConversation.id}/messages/`, {
        content: newMessage
      })
      setNewMessage('')
      fetchMessages(selectedConversation.id)
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading messages...</div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 120px)', gap: '1px', background: '#e2e8f0' }}>
      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conv.id ? '#f8fafc' : '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                      {conv.other_user_name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {conv.last_message?.content?.substring(0, 40) || 'No messages yet'}...
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span style={{
                      background: '#2563eb',
                      color: '#fff',
                      minWidth: 20,
                      height: 20,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontWeight: 800, color: '#0f172a' }}>
                {selectedConversation.other_user_name || 'Conversation'}
              </h3>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: msg.sender?.id === user?.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    background: msg.sender?.id === user?.id ? '#2563eb' : '#f1f5f9',
                    color: msg.sender?.id === user?.id ? '#fff' : '#0f172a'
                  }}>
                    <p style={{ fontSize: '0.9rem' }}>{msg.content}</p>
                    <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{ padding: '0 1rem', borderRadius: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <SendIcon size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}