import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ── Theme ─────────────────────────────────────────────────────────────────────
const BG     = '#0f1117'
const CARD   = '#1e2130'
const CARD2  = '#242736'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#e2e8f0'
const MUTED  = '#6b7280'
const ACCENT = '#6366f1'

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(str) {
  str = escapeHtml(str)
  str = str.replace(/`([^`]+)`/g, '<code>$1</code>')
  str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return str
}

function renderMarkdown(md) {
  if (!md) return ''
  const lines = md.split('\n')
  let html = ''
  let inUl = false
  let inOl = false
  let inPre = false
  let preContent = ''

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inPre) {
        if (inUl) { html += '</ul>'; inUl = false }
        if (inOl) { html += '</ol>'; inOl = false }
        inPre = true
        preContent = ''
      } else {
        inPre = false
        html += `<pre><code>${escapeHtml(preContent.trimEnd())}</code></pre>`
        preContent = ''
      }
      continue
    }
    if (inPre) { preContent += line + '\n'; continue }

    if (inUl && !line.startsWith('- '))  { html += '</ul>'; inUl = false }
    if (inOl && !/^\d+\. /.test(line))   { html += '</ol>'; inOl = false }

    if (line.startsWith('### '))      html += `<h3>${inlineFormat(line.slice(4))}</h3>`
    else if (line.startsWith('## ')) html += `<h2>${inlineFormat(line.slice(3))}</h2>`
    else if (line.startsWith('# '))  html += `<h1>${inlineFormat(line.slice(2))}</h1>`
    else if (line === '---')         html += '<hr/>'
    else if (line.startsWith('> ')) html += `<blockquote>${inlineFormat(line.slice(2))}</blockquote>`
    else if (line.startsWith('- ')) {
      if (!inUl) { html += '<ul>'; inUl = true }
      html += `<li>${inlineFormat(line.slice(2))}</li>`
    } else if (/^\d+\. /.test(line)) {
      if (!inOl) { html += '<ol>'; inOl = true }
      html += `<li>${inlineFormat(line.replace(/^\d+\. /, ''))}</li>`
    } else if (line.trim() === '') {
      html += '<div style="height:0.5em"></div>'
    } else {
      html += `<p>${inlineFormat(line)}</p>`
    }
  }

  if (inUl) html += '</ul>'
  if (inOl) html += '</ol>'
  if (inPre) html += `<pre><code>${escapeHtml(preContent.trimEnd())}</code></pre>`

  return html
}

const mdCss = `
  .chat-md h1,.chat-md h2,.chat-md h3{color:#e2e8f0;margin:0.6em 0 0.3em;font-weight:700}
  .chat-md h1{font-size:1.3em}.chat-md h2{font-size:1.15em}.chat-md h3{font-size:1.05em}
  .chat-md p{color:#d1d5db;margin:0.25em 0;line-height:1.65}
  .chat-md strong{color:#e2e8f0;font-weight:700}
  .chat-md em{font-style:italic;color:#c4b5fd}
  .chat-md code{background:#111827;color:#10b981;padding:0.1em 0.35em;border-radius:4px;font-size:0.85em;font-family:monospace}
  .chat-md pre{background:#111827;border-radius:8px;padding:0.8em 1em;overflow-x:auto;margin:0.5em 0}
  .chat-md pre code{background:transparent;padding:0;color:#10b981}
  .chat-md ul,.chat-md ol{padding-left:1.4em;margin:0.25em 0}
  .chat-md li{color:#d1d5db;margin:0.15em 0;line-height:1.6}
  .chat-md blockquote{border-left:3px solid #6366f1;padding-left:0.75em;margin:0.4em 0;color:#9ca3af}
  .chat-md hr{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:0.6em 0}
`

const SUGGESTED = [
  "How have my habits been this week?",
  "What should I focus on today?",
  "How is my consistency trending?",
  "What assignments do I have coming up?",
  "Give me a weekly summary",
  "What patterns do you notice in my life?",
]

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getWelcome(session) {
  const name = session?.user?.email?.split('@')[0] ?? 'there'
  return `Hey ${name}! I'm Muninn, your personal life coach. I have access to all your Life OS data — habits, journal, workouts, education, and more. What's on your mind?`
}

export default function LifeChat({ session, messages, setMessages }) {
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Init welcome message once
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: getWelcome(session),
        timestamp: Date.now(),
      }])
    }
  }, []) // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxH = parseInt(getComputedStyle(el).lineHeight) * 4 + 32
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px'
  }, [input])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed, timestamp: Date.now() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { data: { session: sess } } = await supabase.auth.getSession()
      const apiMessages = nextMessages.map(m => ({ role: m.role, content: m.content }))
      const { data, error: fnError } = await supabase.functions.invoke('life-chat', {
        body: { messages: apiMessages },
        headers: { Authorization: `Bearer ${sess?.access_token}` },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: typeof data.reply === 'string' ? data.reply : String(data.reply ?? ''),
        timestamp: Date.now(),
      }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && e.metaKey)) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return }
    setMessages([{
      role: 'assistant',
      content: getWelcome(session),
      timestamp: Date.now(),
    }])
    setConfirmClear(false)
    setError(null)
  }

  const hasOnlyWelcome = messages.length <= 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <style>{mdCss}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 20px 0', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>Muninn</div>
            <div style={{ fontSize: 13, color: MUTED }}>Your AI life coach</div>
          </div>
        </div>
        <button
          onClick={handleClear}
          style={{
            background: confirmClear ? 'rgba(239,68,68,0.15)' : 'transparent',
            border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.4)' : BORDER}`,
            color: confirmClear ? '#f87171' : MUTED,
            borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseLeave={() => setConfirmClear(false)}
        >
          {confirmClear ? 'Confirm clear' : 'Clear chat'}
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', minHeight: 0 }}>
        {/* Suggested prompts */}
        {hasOnlyWelcome && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Try asking
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: CARD2, border: `1px solid ${BORDER}`,
                    color: '#a5b4fc', borderRadius: 20, padding: '7px 14px',
                    fontSize: 13, cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = CARD2}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16,
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, marginRight: 8, marginTop: 2,
              }}>✦</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '10px 14px',
                backgroundColor: msg.role === 'user' ? '#6366f1' : CARD,
                color: msg.role === 'user' ? 'white' : '#e2e8f0',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: 14, lineHeight: 1.6,
              }}>
                {msg.role === 'user'
                  ? <span style={{ whiteSpace: 'pre-wrap' }}>{typeof msg.content === 'string' ? msg.content : String(msg.content ?? '')}</span>
                  : <div
                      className="chat-md"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(typeof msg.content === 'string' ? msg.content : String(msg.content ?? '')) }}
                    />
                }
              </div>
              <div style={{
                fontSize: 11, color: MUTED, marginTop: 4,
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}>
                {msg.timestamp ? formatTime(msg.timestamp) : ''}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, marginRight: 8,
            }}>✦</div>
            <div style={{
              padding: '12px 16px', backgroundColor: CARD, borderRadius: '18px 18px 18px 4px',
            }}>
              <LoadingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: `1px solid ${BORDER}`, paddingTop: 16, flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: CARD, borderRadius: 14, padding: '10px 12px',
          border: `1px solid ${BORDER}`,
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Muninn anything…"
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: TEXT, fontSize: 14, lineHeight: 1.5, resize: 'none',
              fontFamily: 'inherit', overflowY: 'hidden',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              background: !input.trim() || loading ? 'rgba(99,102,241,0.3)' : ACCENT,
              color: 'white', border: 'none', borderRadius: 10,
              width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              flexShrink: 0, transition: 'background 0.15s', fontSize: 16,
            }}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 20 }}>
      <style>{`
        @keyframes chat-bounce {
          0%,80%,100%{transform:translateY(0);opacity:0.4}
          40%{transform:translateY(-5px);opacity:1}
        }
      `}</style>
      {[0, 150, 300].map(delay => (
        <div key={delay} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#6366f1',
          animation: `chat-bounce 1.2s ${delay}ms ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}
