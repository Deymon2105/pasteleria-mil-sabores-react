import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService, userService } from '../service/api'
import { supabase } from '../config/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Inicializar sesión y escuchar cambios de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session) {
          // Cargar datos completos del usuario
          const user = await authService.getCurrentUser()
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (session) {
        try {
          const user = await authService.getCurrentUser()
          setCurrentUser(user)
        } catch (error) {
          console.error('Error al obtener usuario:', error)
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }

      // Disparar evento personalizado para compatibilidad
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        window.dispatchEvent(new Event('userSessionChange'))
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.dispatchEvent(new Event('userSessionChange'))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Cargar usuarios desde la API al iniciar (solo admin)
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers()
    }
  }, [currentUser])

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
      const response = await authService.login(email, password)
      const { user, session } = response.data
      
      setCurrentUser(user)
      setSession(session)
      
      window.dispatchEvent(new Event('userSessionChange'))
      
      return { success: true, user }
    } catch (error) {
      console.error('Error en login:', error)
      return { 
        success: false, 
        error: error.message || 'Usuario o contraseña incorrectos' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setCurrentUser(null)
      setSession(null)
      window.dispatchEvent(new Event('userSessionChange'))
    } catch (error) {
      console.error('Error en logout:', error)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await authService.register(userData)
      const { user, session } = response.data
      
      setCurrentUser(user)
      setSession(session)
      
      // Actualizar lista de usuarios si es admin
      if (user.role === 'admin') {
        await loadUsers()
      }
      
      window.dispatchEvent(new Event('userSessionChange'))
      return { success: true, user }
    } catch (error) {
      console.error('Error en registro:', error)
      return { 
        success: false, 
        error: error.message || 'Error al registrar usuario' 
      }
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }

  const isLoggedIn = () => {
    return currentUser !== null && session !== null
  }

  /**
   * Verifica si el JWT es válido y no ha expirado
   * Supabase los refresca automáticamente
   */
  const isTokenValid = () => {
    if (!session || !session.expires_at) return false
    // Verificar si el token expira en más de 1 minuto
    const expiresAt = session.expires_at * 1000 // Convertir a millisegundos
    const now = Date.now()
    return expiresAt > now + 60000 // 1 minuto de margen
  }

  
   //Obtener el access token actual (JWT)
  const getAccessToken = () => {
    return session?.access_token || null
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      allUsers,
      login,
      logout,
      register,
      isAdmin,
      isLoggedIn,
      isTokenValid,
      getAccessToken,
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
