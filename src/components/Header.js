import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Container, Badge, Button, Dropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header(){
  const { totalCount } = useCart()
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  // Verificar si hay sesión activa
  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem('currentUser')
      if (user) {
        try {
          setCurrentUser(JSON.parse(user))
        } catch (e) {
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
    }

    checkUser()
    // Escuchar cambios en localStorage desde otras pestañas/componentes
    window.addEventListener('storage', checkUser)
    // Escuchar evento personalizado para cambios en la misma pestaña
    window.addEventListener('userSessionChange', checkUser)

    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('userSessionChange', checkUser)
    }
  }, [])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    navigate('/login')
  }

  return (
    <header>
      <Navbar bg="light" expand="lg" className="site-header">
        <Container>
          <Navbar.Brand as={Link} to="/">🍰 Mil Sabores</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Inicio</Nav.Link>
              <Nav.Link as={Link} to="/catalogo">Catálogo</Nav.Link>
              <Nav.Link as={Link} to="/blogs">Blog</Nav.Link>
              <Nav.Link as={Link} to="/about">Historia</Nav.Link>
              <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
            </Nav>
            <Nav>
              {currentUser ? (
                <Dropdown align="end" className='user-dropdown'>
                  <Dropdown.Toggle variant="outline-secondary" id="user-dropdown" size="sm">
                    👤 {currentUser.name || currentUser.email}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item disabled>
                      <small className="text-muted">{currentUser.email}</small>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Cerrar sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={Link} to="/login">Ingresar</Nav.Link>
              )}
              <Nav.Link as={Link} to="/cart">
                <Button variant="outline-primary" size="sm">Carrito <Badge bg="secondary">{totalCount}</Badge></Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
