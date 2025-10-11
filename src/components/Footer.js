import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

export default function Footer(){
  return (
    <footer className="site-footer bg-light py-4">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Sobre nosotros</h5>
            <p>Desde 1975 endulzando Chile. Participantes del récord Guinness de la torta más grande (1995).</p>
          </Col>
          <Col md={4}>
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li><a href="/catalogo">Catálogo</a></li>
              <li><a href="/about">Historia</a></li>
              <li><a href="/blogs">Blog</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Síguenos</h5>
            <div>📷 📘 𝕏</div>
          </Col>
        </Row>
        <div className="text-center mt-3">© 2025 Pastelería Mil Sabores</div>
      </Container>
    </footer>
  )
}
