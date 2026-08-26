import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { users } from './Applications/DirectMessages/data/staticData'

const AuthContext = createContext(null)
const TOKEN_KEY = 'authToken'

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function authFetch(path, options = {}) {
  const token = getStoredToken()
  const headers = { ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const base = process.env.REACT_APP_SERVER || ''
  return fetch(`${base}${path}`, { ...options, headers })
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken())

  useEffect(() => {
    const onStorage = () => setToken(getStoredToken())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const user = useMemo(() => {
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      const username = (decoded.username || '').toLowerCase()
      const profile = users[username]
      if (!profile) return null
      return { ...profile }
    } catch (e) {
      return null
    }
  }, [token])

  function logIn(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  function logOut() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
