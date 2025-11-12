import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import About from './About'

export default function Home(){
  return (
    <div className="home-page">
      <Hero />
      <FeaturedProducts />
      
      {/* Sección de Beneficios */}
      <section className="benefits-section">
        <Container>
          <Row className="g-4">
            <Col md={3} sm={6}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <h4>Envío Rápido</h4>
                <p>Delivery en 24-48 horas</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Calidad Garantizada</h4>
                <p>Productos frescos diarios</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-percent"></i>
                </div>
                <h4>Descuentos Especiales</h4>
                <p>Ofertas por aniversario</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-headset"></i>
                </div>
                <h4>Atención Personalizada</h4>
                <p>Te ayudamos 24/7</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección About */}
      <About />
      
      {/* Llamada a la Acción */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="cta-badge">
                  <i className="bi bi-gift me-2"></i>
                  Oferta Especial
                </div>
                <h2 className="cta-title">¿Listo para endulzar tu día?</h2>
                <p className="cta-text">
                  Explora nuestro catálogo completo y descubre las mejores ofertas. 
                  ¡Descuentos especiales por nuestro 50° aniversario!
                </p>
              </Col>
              <Col lg={4} className="text-lg-end text-center mt-3 mt-lg-0">
                <Button as={Link} to="/catalogo" className="cta-button">
                  <i className="bi bi-basket me-2"></i>
                  Explorar Catálogo
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  )
}
