import React, { useState } from 'react'
import { Container, Row, Col, Form, Alert } from 'react-bootstrap'
import products from '../data/products'
import ProductCard from '../components/ProductCard'
import ModalProducto from '../components/ModalProducto'

export default function Catalogo() {

  const [selectedCategory, setSelectedCategory] = useState('Todos') //estado categorias seleccionadas
  const [searchTerm, setSearchTerm] = useState('') //estado texto de busqueda

  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto)
  }

  const cerrarModal = () => {
    setProductoSeleccionado(null)
  }

  const categories = ['Todos', 'Tortas Cuadradas', 'Tortas Circulares', 
                      'Postres Individuales', 'Productos Sin Azúcar', 'Pastelería Tradicional', 
                      'Productos Sin Gluten', 'Productos Vegana', 'Tortas Especiales']

  //Funcion para el filtro
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'Todos' || product.category === selectedCategory //filtro categoría
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.desc.toLowerCase().includes(searchTerm.toLowerCase()) //filtro texto
    return matchCategory && matchSearch
  })

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Catálogo de Productos</h1>

      {/* Buscador y categorías */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Productos filtrados */}
      <Row>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Col key={product.id} md={4} sm={6} className="mb-4">
              <ProductCard product={product} onVerDetalles={handleVerDetalles} />
            </Col>
          ))
        ) : (
          <Alert variant="info">No se encontraron productos.</Alert>
        )}
      </Row>

      {/* --- MODAL DE DETALLES --- */}
      {productoSeleccionado && (
        <ModalProducto producto={productoSeleccionado} onClose={cerrarModal} />
      )}
    </Container>
  )
}
