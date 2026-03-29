import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LifeChat from './LifeChat'

const ACCENT = '#6366f1'
const CARD   = '#1e2130'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#e2e8f0'
const MUTED  = '#6b7280'

export default function ChatBubble({ session, messages, setMessages }) {
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const panelRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Hide bubble entirely on /chat page
  if (location.pathname === '/chat') return null

  // Track unread AI messages when closed
  const prevLenRef = useRef(messages.length)
  useEffect(() => {
    if (!open && messages.length > prevLenRef.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === 'assistant') setHasUnread(true)
    }
    prevLenRef.current = messages.length
  }, [messages, open])

  useEffect(() => {
    if (open) setHasUnread(false)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40 }}>
      {/* Expanded panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            // Mobile: full screen overlay; desktop: panel above bubble
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            // Desktop override via inline media — handled by class
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 40,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
          className="chat-bubble-panel"
        >
          <style>{`
            @media (min-width: 640px) {
              .chat-bubble-panel {
                position: absolute !important;
                bottom: 70px !important;
                right: 0 !important;
                left: auto !important;
                top: auto !important;
                width: 340px !important;
                height: 480px !important;
                border-radius: 16px !important;
              }
            }
          `}</style>

          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
              }}>✦</div>
              <span style={{ fontWeight: 600, color: TEXT, fontSize: 14 }}>Muninn</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => { setOpen(false); navigate('/chat') }}
                style={{
                  background: 'transparent', border: 'none', color: '#a5b4fc',
                  fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                  borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Open full chat →
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: MUTED,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Chat content — reuses LifeChat with shared messages */}
          <div style={{ flex: 1, padding: '12px 14px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <LifeChat session={session} messages={messages} setMessages={setMessages} compact />
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          fontSize: 22,
          zIndex: 41,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        title="Chat with Muninn"
      >
        {open ? '×' : '✦'}
        {/* Unread dot */}
        {hasUnread && !open && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 10, height: 10, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #0f1117',
          }} />
        )}
      </button>
    </div>
  )
}
