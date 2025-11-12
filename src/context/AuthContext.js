import React, { createContext, useState, useContext, useEffect } from 'react'
import { userService, setAuthToken, clearAuthToken } from '../service/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Recuperar usuario de sessionStorage al iniciar
    try {
      const savedUser = sessionStorage.getItem('currentUser')
      const savedToken = sessionStorage.getItem('authToken')
      if (savedUser && savedToken) {
        setAuthToken(savedToken)
        return JSON.parse(savedUser)
      }
    } catch (error) {
      console.error('Error al recuperar sesión:', error)
    }
    return null
  })
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(false)

  // Guardar usuario en sessionStorage cuando cambia
  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser))
      } catch (error) {
        console.error('Error al guardar sesión:', error)
      }
    } else {
      sessionStorage.removeItem('currentUser')
      sessionStorage.removeItem('authToken')
    }
  }, [currentUser])

  // Cargar usuarios desde la API al iniciar
  useEffect(() => {
    loadUsers()
  }, [])

  // Escuchar evento de sesión no autorizada
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null)
      clearAuthToken()
    }
    window.addEventListener('unauthorized', handleUnauthorized)
    return () => window.removeEventListener('unauthorized', handleUnauthorized)
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userService.getAll()
      setAllUsers(response.data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setAllUsers([])
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await userService.login({ email, password })
      const { user, token } = response.data
      
      setCurrentUser(user)
      setAuthToken(token)
      
      // Guardar token en sessionStorage
      sessionStorage.setItem('authToken', token)
      
      window.dispatchEvent(new Event('userSessionChange'))
      
      return { success: true, user }
    } catch (error) {
      console.error('Error en login:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Usuario o contraseña incorrectos' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    clearAuthToken()
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('authToken')
    window.dispatchEvent(new Event('userSessionChange'))
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await userService.register(userData)
      const { user, token } = response.data
      
      setCurrentUser(user)
      setAuthToken(token)
      
      // Guardar token en sessionStorage
      sessionStorage.setItem('authToken', token)
      
      // Actualizar lista de usuarios
      await loadUsers()
      
      window.dispatchEvent(new Event('userSessionChange'))
      return { success: true, user }
    } catch (error) {
      console.error('Error en registro:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario' 
      }
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }

  const isLoggedIn = () => {
    return currentUser !== null
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      allUsers,
      login,
      logout,
      register,
      isAdmin,
      isLoggedIn,
      loading,
      loadUsers
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
