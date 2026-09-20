import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { getCurrentUserProfile, updateCurrentUserProfile } from '../api/users'
import { clearToken, getToken, setToken } from '../lib/token'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    getCurrentUserProfile()
      .then(setCurrentUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const signup = async (email, password, displayName) => {
    const { token, user } = await authApi.signup({ email, password, displayName })
    setToken(token)
    setCurrentUser(user)
  }

  const login = async (email, password) => {
    const { token, user } = await authApi.login({ email, password })
    setToken(token)
    setCurrentUser(user)
  }

  const logout = () => {
    clearToken()
    setCurrentUser(null)
  }

  const updateProfile = async (updates) => {
    const user = await updateCurrentUserProfile(updates)
    setCurrentUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
