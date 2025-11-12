import React, { useState, useEffect } from 'react'
import { Row, Col, Spinner, Alert } from 'react-bootstrap'
import { productService } from '../service/api'
import ProductCard from './ProductCard'
import ModalProducto from './ModalProducto'

export default function FeaturedProducts(){
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  // Cargar productos destacados desde la API
  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productService.getFeatured()
      setFeatured(response.data)
    } catch (err) {
      console.error('Error al cargar productos destacados:', err)
      setError('Error al cargar productos destacados')
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto)
  }

  const cerrarModal = () => setProductoSeleccionado(null)

  if (loading) {
    return (
      <section className="featured-section">
        <div className="container text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="featured-section">
        <div className="container py-5">
          <Alert variant="warning">{error}</Alert>
        </div>
      </section>
    )
  }

  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <div className="featured-badge">
            <i className="bi bi-star-fill me-2"></i>
            Lo Mejor de Nuestra Pastelería
          </div>
          <h2 className="featured-title">Productos Destacados</h2>
          <p className="featured-subtitle">
            Descubre nuestras creaciones más populares, elaboradas con ingredientes de primera calidad
          </p>
        </div>
        <Row className="g-4">
          {featured.map(p=> (
            <Col key={p.id} lg={4} md={6} xs={12}>
              <ProductCard product={p} onVerDetalles={handleVerDetalles} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Modal de detalles usado en la Home */}
      {productoSeleccionado && (
        <ModalProducto producto={productoSeleccionado} onClose={cerrarModal} />
      )}
    </section>
  )
}
