import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap'
import { productService } from '../service/api'
import ProductCard from '../components/ProductCard'
import ModalProducto from '../components/ModalProducto'

export default function Catalogo() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Todos') //estado categorias seleccionadas
  const [searchTerm, setSearchTerm] = useState('') //estado texto de busqueda

  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  // Cargar productos desde la API al montar el componente
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productService.getAll()
      setProducts(response.data)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('Error al cargar los productos. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Buscar productos usando la API
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim() === '') {
        // Si el campo está vacío, cargar todos los productos
        loadProducts()
        return
      }

      try {
        setError(null)
        const response = await productService.search(searchTerm)
        setProducts(response.data)
        setSelectedCategory('Todos') // se resetea categoría al buscar
      } catch (err) {
        console.error('Error al buscar productos:', err)
        setError('Error al buscar productos. Por favor, intenta de nuevo.')
      }
    }

    const timeoutId = setTimeout(() => {
      searchProducts()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto)
  }

  const cerrarModal = () => {
    setProductoSeleccionado(null)
  }

  // Extraer categorías dinámicamente desde los productos
  const categories = ['Todos', ...new Set(products.map(p => p.category))]

  // Filtrar por categoría
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'Todos' || product.category === selectedCategory
    return matchCategory
  })

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </Spinner>
        <p className="mt-3">Cargando productos...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <p>{error}</p>
          <button className="btn btn-link" onClick={loadProducts}>Reintentar</button>
        </Alert>
      </Container>
    )
  }

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
