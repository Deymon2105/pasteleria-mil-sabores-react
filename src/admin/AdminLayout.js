import React from 'react'
import '../styles/admin.css'
import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout(){
  return (
    <div className="admin admin--layout">
      <header className="admin-header">
        <a className="admin-header__brand" href="/admin">Admin Mil Sabores</a>
        <nav className="admin-header__nav">
          <NavLink to="users" className="admin-header__link">Usuarios</NavLink>
          <NavLink to="products" className="admin-header__link">Productos</NavLink>
          <NavLink to="orders" className="admin-header__link">Pedidos</NavLink>
        </nav>
      </header>
      <main className="admin-main container">
        <Outlet />
      </main>
    </div>
  )
}
