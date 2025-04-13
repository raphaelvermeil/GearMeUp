'use client'


/*
This is a React Context that manages the authentication state throughout the application
It provides:
The current authentication state (logged in/out)
User information
Login/logout functionality
Token management
It's used throughout the application to:
Protect routes
Show/hide UI elements based on auth state
Access user information
Handle authentication-related operations
*/


import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, getCurrentUser, DirectusUser, AuthenticationData, logout } from '@/lib/directus'

interface AuthContextType {
  user: DirectusUser | null
  loading: boolean
  error: string | null
  handleLogin: (email: string, password: string) => Promise<void>
  handleLogout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DirectusUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  console.log("AuthContext: Initializing provider...")

  const loadUser = async () => {
    try {
      console.log("AuthContext: Attempting to load current user...")
      const currentUser = await getCurrentUser()
      console.log("AuthContext: Current user response:", currentUser)
      
      if (currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("AuthContext: Error loading user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("AuthContext: Running initial user check...")
    loadUser()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginUser(email, password);
      console.log('Login response:', response);
      
      // Add a small delay to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userData = await getCurrentUser();
      setUser(userData);
      router.push('/gear');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("AuthContext: Starting logout process...")
      setLoading(true)
      
      await logout()
      setUser(null)
      router.push("/")
      console.log("AuthContext: Logout successful")
    } catch (error) {
      console.error("AuthContext: Logout error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    handleLogin,
    handleLogout,
  }

  console.log("AuthContext: Provider initialized with value:", value)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 