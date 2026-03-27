import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ session, children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0f1117', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar session={session} />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
