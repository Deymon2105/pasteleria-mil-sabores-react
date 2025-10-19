import React, { createContext, useState, useContext, useEffect } from 'react'
import { users as seedUsers } from '../data/adminData'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [allUsers, setAllUsers] = useState(() => {
    try {
      const ls = localStorage.getItem('users')
      return ls ? JSON.parse(ls) : seedUsers
    } catch {
      return seedUsers
    }
  })

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
      } else {
        localStorage.removeItem('currentUser')
      }
    } catch {}
  }, [currentUser])

  useEffect(() => {
    try {
      localStorage.setItem('users', JSON.stringify(allUsers))
    } catch {}
  }, [allUsers])

  const login = (email, password) => {
    // Buscar usuario en los datos
    const user = allUsers.find(u => u.email === email)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false, error: 'Usuario no encontrado' }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const register = (userData) => {
    const exists = allUsers.find(u => u.email === userData.email)
    if (exists) {
      return { success: false, error: 'El email ya está registrado' }
    }

    const newUser = {
      name: userData.name,
      email: userData.email,
      password: userData.password, // Guardamos la contraseña si viene
      role: userData.role || 'user', // Por defecto usuarios normales
      birthdate: userData.birthdate || '',
      benefits: userData.benefits || [],
      age: userData.age,
      createdAt: userData.createdAt
    }

    setAllUsers(prev => [...prev, newUser])
    setCurrentUser(newUser) // Iniciar sesión automáticamente
    window.dispatchEvent(new Event('userSessionChange')) // Disparar evento
    return { success: true, user: newUser }
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
      isLoggedIn
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
