import type { AuthResponse, User } from '@/types/auth'
import React, { createContext, useContext, useState } from 'react'

type AuthContextType = {
  user: User | null
  token: string
  loginAction: (data: AuthResponse) => Promise<void>
}

const defaultAuthContext: AuthContextType = {
  user: {
    id: 'test-user',
    role: 'caregiver',
  }, // TODO: Set to null when done testing
  token: '',
  loginAction: async (_) => {
    /* no-op */
  },
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState('')

  const loginAction = async (data: AuthResponse) => {
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('token', data.token)
  }

  // const authValue: AuthContextType = {
  //   user,
  //   token,
  //   loginAction,
  // }

  const authValue = defaultAuthContext

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  )
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext)
