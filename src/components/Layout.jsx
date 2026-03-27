import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ session, children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
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
