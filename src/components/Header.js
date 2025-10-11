import React from 'react'
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header(){
  const { totalCount } = useCart()
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
              <Nav.Link as={Link} to="/login">Ingresar</Nav.Link>
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
