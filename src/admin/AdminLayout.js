import React from 'react'
import '../styles/admin.css'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout(){
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="admin admin--layout">
      <header className="admin-header">
        <NavLink to="/admin" className="admin-header__brand">Admin Mil Sabores</NavLink>
        <nav className="admin-header__nav">
          <NavLink to="/admin" end className="admin-header__link">Dashboard</NavLink>
          <NavLink to="users" className="admin-header__link">Usuarios</NavLink>
          <NavLink to="products" className="admin-header__link">Productos</NavLink>
          <NavLink to="orders" className="admin-header__link">Pedidos</NavLink>
        </nav>
        <div className="admin-header__user">
          <span style={{marginRight: '15px', color: '#333'}}>
            {currentUser?.name || currentUser?.email}
          </span>
          <button 
            onClick={handleLogout} 
            className="btn"
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="admin-main container">
        <Outlet />
      </main>
    </div>
  )
}