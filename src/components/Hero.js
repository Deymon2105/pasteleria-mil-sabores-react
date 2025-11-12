import React from 'react'
import { Container, Button, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Hero(){
  const pasteleriaFisica = process.env.PUBLIC_URL + '/img/pasteleriaFisica.png'
  
  return (
    <div className="hero-modern" style={{
      backgroundImage: `url(${pasteleriaFisica})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="hero-overlay"></div>
      <Container className="hero-content">
        <Row className="align-items-center">
          <Col lg={7} className="hero-text">
            <div className="hero-badge">
              <i className="bi bi-star-fill me-2"></i>
              50 Años de Tradición
            </div>
            <h1 className="hero-title">
              Celebra la <span className="hero-highlight">Dulzura</span> de la Vida
            </h1>
            <p className="hero-subtitle">
              Deléitate con nuestras creaciones artesanales, hechas con amor y los ingredientes más frescos. 
              Disfruta de descuentos exclusivos por nuestro aniversario.
            </p>
            <div className="hero-buttons">
              <Button as={Link} to="/catalogo" className="hero-btn-primary">
                <i className="bi bi-basket me-2"></i>
                Ver Catálogo
              </Button>
              <Button as={Link} to="/about" className="hero-btn-secondary">
                <i className="bi bi-heart me-2"></i>
                Nuestra Historia
              </Button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <i className="bi bi-award"></i>
                <div>
                  <strong>50+</strong>
                  <span>Años de Experiencia</span>
                </div>
              </div>
              <div className="hero-stat">
                <i className="bi bi-people"></i>
                <div>
                  <strong>10K+</strong>
                  <span>Clientes Felices</span>
                </div>
              </div>
              <div className="hero-stat">
                <i className="bi bi-cake2"></i>
                <div>
                  <strong>100+</strong>
                  <span>Productos Únicos</span>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={5} className="hero-visual">
            <div className="hero-decoration-circle hero-decoration-circle-1"></div>
            <div className="hero-decoration-circle hero-decoration-circle-2"></div>
            <div className="hero-decoration-circle hero-decoration-circle-3"></div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
