'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, logout, getCurrentUser } from '@/lib/directus'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  handleLogin: (email: string, password: string) => Promise<void>
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginUser(email, password)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 