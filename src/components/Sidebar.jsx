import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { NAV_ITEMS } from '../config/navItems'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar({ session }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside
      className={`hidden md:flex flex-col border-r transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ backgroundColor: '#1a1d27', borderRightColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <span
            className="select-none"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.025em',
            }}
          >
            Life OS
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-gray-600 hover:bg-gray-800 hover:text-gray-300 transition-colors ${
            collapsed ? 'mx-auto' : 'ml-auto'
          }`}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              isActive
                ? `nav-active flex items-center gap-3 py-2 rounded-lg text-sm font-medium ${
                    collapsed ? 'justify-center px-3' : 'pr-3'
                  }`
                : `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-gray-100 transition-colors ${
                    collapsed ? 'justify-center' : ''
                  }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-2 py-3 space-y-0.5 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
        {!collapsed && session?.user?.email && (
          <p className="px-3 py-1 text-xs text-gray-700 truncate">
            {session.user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-800 hover:text-red-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}
