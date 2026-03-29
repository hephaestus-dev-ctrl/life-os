import LifeChat from '../modules/chat/LifeChat'

const BG     = '#0f1117'
const BORDER = 'rgba(255,255,255,0.07)'

export default function ChatPage({ session, messages, setMessages }) {
  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 760,
      margin: '0 auto',
      width: '100%',
    }}>
      <LifeChat session={session} messages={messages} setMessages={setMessages} />
    </div>
  )
}
