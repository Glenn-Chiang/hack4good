import { useState, type ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Home, CheckSquare, BookOpen, Users, LogOut, User } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { currentUser, logout } = useAuth()

  const [logoutOpen, setLogoutOpen] = useState(false)

  const isActive = (path: string) => currentPath === path

  const initials =
    currentUser?.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('') || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (match RecipientDashboard style) */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg text-blue-700">{initials}</span>
              </div>
              <div>
                <h1 className="text-xl">CareConnect</h1>
                <p className="text-sm text-gray-500">
                  {currentUser?.name} •{' '}
                  {String(currentUser?.role).charAt(0).toUpperCase() +
                    String(currentUser?.role).slice(1)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {currentUser?.role === 'caregiver' && (
                <Link to="/caregiver-profile">
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}

              <Button variant="ghost" onClick={() => setLogoutOpen(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation (keep as-is) */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive('/')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/todos"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive('/todos')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Todo List</span>
            </Link>

            <Link
              to="/journal"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive('/journal')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Journal</span>
            </Link>

            <Link
              to="/recipients"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive('/recipients') ||
                currentPath.startsWith('/recipients/')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Recipients</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false)
                logout()
              }}
            >
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
