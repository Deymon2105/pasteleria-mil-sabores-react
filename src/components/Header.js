import React from 'react'
import { Navbar, Nav, Badge, Button, Dropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header(){
  const { totalCount } = useCart()
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="modern-header">
      <Navbar expand="lg" className="navbar-modern">
        <div className="navbar-container">
          {/* Logo/Brand - Izquierda */}
          <Navbar.Brand as={Link} to="/" className="navbar-brand-modern">
            <span className="brand-icon">🍰</span>
            <span className="brand-text">Mil Sabores</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" className="navbar-toggler-modern" />
          
          <Navbar.Collapse id="main-nav">
            {/* Links de navegación - Centro/Izquierda */}
            <Nav className="navbar-nav-left">
              <Nav.Link as={Link} to="/" className="nav-link-modern">
                Inicio
              </Nav.Link>
              <Nav.Link as={Link} to="/catalogo" className="nav-link-modern">
                Catálogo
              </Nav.Link>
              <Nav.Link as={Link} to="/blogs" className="nav-link-modern">
                Blog
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="nav-link-modern">
                Historia
              </Nav.Link>
              <Nav.Link as={Link} to="/contacto" className="nav-link-modern">
                Contacto
              </Nav.Link>
              {isAdmin() && (
                <Nav.Link as={Link} to="/admin" className="nav-link-modern nav-link-admin">
                  <i className="bi bi-shield-check me-1"></i>
                  Panel Admin
                </Nav.Link>
              )}
            </Nav>

            {/* Usuario y Carrito - Derecha */}
            <Nav className="navbar-nav-right">
              {currentUser ? (
                <Dropdown align="end" className="user-dropdown-modern">
                  <Dropdown.Toggle variant="link" className="user-dropdown-toggle">
                    <div className="user-avatar">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <span className="user-name">{currentUser.name || currentUser.email}</span>
                    {isAdmin() && <Badge bg="danger" className="user-badge">Admin</Badge>}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="user-dropdown-menu">
                    <Dropdown.Item disabled className="user-info">
                      <i className="bi bi-envelope me-2"></i>
                      <small>{currentUser.email}</small>
                    </Dropdown.Item>
                    {isAdmin() && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/admin">
                          <i className="bi bi-speedometer2 me-2"></i>
                          Panel Admin
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="logout-item">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={Link} to="/login" className="nav-link-login">
                  <i className="bi bi-person me-1"></i>
                  Ingresar
                </Nav.Link>
              )}
              
              <Nav.Link as={Link} to="/cart" className="nav-link-cart">
                <Button className="cart-button">
                  <i className="bi bi-cart3"></i>
                  <span className="cart-text">Carrito</span>
                  {totalCount > 0 && (
                    <Badge className="cart-badge">{totalCount}</Badge>
                  )}
                </Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </header>
  )
}
