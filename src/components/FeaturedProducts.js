import React, { useState } from 'react'
import {Row, Col } from 'react-bootstrap'
import products from '../data/products'
import ProductCard from './ProductCard'
import ModalProducto from './ModalProducto'

export default function FeaturedProducts(){
  const featured = products.filter(p=>p.featured)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto)
  }

  const cerrarModal = () => setProductoSeleccionado(null)

  return (
    <section className="section section--featured container my-4">
      <h2 className="section__title">Destacados</h2>
      <Row>
        {featured.map(p=> (
          <Col key={p.id} md={4} sm={6} xs={12} className="mb-4">
            <ProductCard product={p} onVerDetalles={handleVerDetalles} />
          </Col>
        ))}
      </Row>

      {/* Modal de detalles usado en la Home */}
      {productoSeleccionado && (
        <ModalProducto producto={productoSeleccionado} onClose={cerrarModal} />
      )}
    </section>
  )
}
