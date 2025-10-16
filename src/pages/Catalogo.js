import React, { useState } from 'react'
import { Container, Row, Col, Form, Alert } from 'react-bootstrap'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Catalogo(){

  const [selectedCategory, setSelectedCategory] = useState('Todos') //estado categorias seleccionadas
  const [searchTerm, setSearchTerm] = useState('') //estado texto de busqueda

  const categories = ['Todos', 'Tortas Cuadradas', 'Tortas Circulares', 
                      'Postres Individuales', 'Productos Sin Azúcar', 'Pastelería Tradicional', 
                      'Productos Sin Gluten', 'Productos Vegana', 'Tortas Especiales']

  //Funcion para el filtro
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'Todos' || product.category === selectedCategory //filtro categoría
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || product.desc.toLowerCase().includes(searchTerm.toLowerCase()) //filtro busqueda

    return matchCategory && matchSearch
  })

  return (
    <Container className="my-4">
      <h2 className="mb-4">Catálogo</h2>

      <Row className="mb-4 g-3">
        <Col md={6}>
          <Form.Label htmlFor="categoryFilter" className="fw-bold">
            Filtrar por Categoría:
          </Form.Label>
          <Form.Select id="categoryFilter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={6}>
          <Form.Label htmlFor="searchInput" className="fw-bold">
            Buscar Productos:
          </Form.Label>
          <Form.Control
            id="searchInput"
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      <p className="text-muted mb-3">
        Mostrando {filteredProducts.length} de {products.length} productos
      </p>
      <div className="d-flex flex-wrap">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <Alert variant="info" className="w-100">
            No se encontraron productos con esa descripción.
          </Alert>
        )}
      </div>
    </Container>
  )
}
