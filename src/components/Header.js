import React from 'react'
import { Navbar, Nav, Container, Badge, Button, Dropdown } from 'react-bootstrap'
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
              {isAdmin() && (
                <Nav.Link as={Link} to="/admin" className="text-primary fw-bold">
                  Panel Admin
                </Nav.Link>
              )}
            </Nav>
            <Nav>
              {currentUser ? (
                <Dropdown align="end" className='user-dropdown'>
                  <Dropdown.Toggle variant="outline-secondary" id="user-dropdown" size="sm">
                    {currentUser.name || currentUser.email}
                    {isAdmin() && <Badge bg="danger" className="ms-1">Admin</Badge>}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item disabled>
                      <small className="text-muted">{currentUser.email}</small>
                    </Dropdown.Item>
                    {isAdmin() && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/admin">
                          Panel Admin
                        </Dropdown.Item>
                      </>
                    )}
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
