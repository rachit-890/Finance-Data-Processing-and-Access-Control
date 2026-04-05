import { createContext, useContext, useState, useEffect } from 'react'
import { userAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      userAPI.getMe()
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (authResponse) => {
    // If the response contains a token, store it
    if (authResponse.token) localStorage.setItem('token', authResponse.token)
    
    // Store user data in localStorage and context
    localStorage.setItem('user', JSON.stringify(authResponse))
    setUser(authResponse)
  }

  const updateUser = (userData) => {
    // Get existing token and merge with new data
    const token = localStorage.getItem('token')
    const updated = { ...userData, token }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'ADMIN', isAnalyst: user?.role === 'ANALYST' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
