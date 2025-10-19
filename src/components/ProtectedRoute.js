import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, isAdmin } = useAuth()

  // Si no hay usuario logueado
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Si requiere admin pero el usuario no es admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />
  }

  // Usuario autorizado
  return children
}
