import React, { useState } from 'react'
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
      <div className="d-flex flex-wrap">
        {featured.map(p=> (
          <ProductCard key={p.id} product={p} onVerDetalles={handleVerDetalles} />
        ))}
      </div>

      {/* Modal de detalles usado en la Home */}
      {productoSeleccionado && (
        <ModalProducto producto={productoSeleccionado} onClose={cerrarModal} />
      )}
    </section>
  )
}
