import React from 'react'
import { Row, Col } from 'react-bootstrap'

export default function About(){
  return (
    <div className="about-section">
      <div className="container">
        <Row className="align-items-center">
          <Col lg={6} className="about-content">
            <div className="about-badge">
              <i className="bi bi-bookmark-heart me-2"></i>
              Nuestra Pasión
            </div>
            <h2 className="about-title">50 Años de Historia y Tradición</h2>
            <p className="about-text">
              Pastelería Mil Sabores celebra <strong>50 años</strong> como referente de la repostería chilena, 
              reconocida incluso por su participación en <strong>1995 en el Récord Guinness</strong> por colaborar 
              en la torta más grande del mundo.
            </p>
            <p className="about-text">
              Nuestras recetas provienen de tradición familiar y técnicas artesanales preservadas y 
              adaptadas a los tiempos modernos. Cada producto refleja ese origen único.
            </p>
            
            <Row className="about-values g-3 mt-4">
              <Col md={6}>
                <div className="value-card">
                  <div className="value-icon">
                    <i className="bi bi-trophy"></i>
                  </div>
                  <h4>Calidad Premium</h4>
                  <p>Ingredientes selectos y recetas tradicionales</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="value-card">
                  <div className="value-icon">
                    <i className="bi bi-heart-pulse"></i>
                  </div>
                  <h4>Compromiso Social</h4>
                  <p>Apoyamos a estudiantes de gastronomía</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="value-card">
                  <div className="value-icon">
                    <i className="bi bi-lightbulb"></i>
                  </div>
                  <h4>Innovación</h4>
                  <p>Tecnología al servicio de la tradición</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="value-card">
                  <div className="value-icon">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <h4>Experiencia</h4>
                  <p>Miles de clientes satisfechos</p>
                </div>
              </Col>
            </Row>
          </Col>
          
          <Col lg={6} className="about-visual">
            <div className="about-image-container">
              <div className="about-decoration about-decoration-1"></div>
              <div className="about-decoration about-decoration-2"></div>
              <div className="about-stats-floating">
                <div className="stat-float stat-float-1">
                  <i className="bi bi-award-fill"></i>
                  <div>
                    <strong>Récord Guinness</strong>
                    <span>1995</span>
                  </div>
                </div>
                <div className="stat-float stat-float-2">
                  <i className="bi bi-cake2-fill"></i>
                  <div>
                    <strong>Artesanal</strong>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
