import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Card, Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, onVerDetalles }) { 
  const { addToCart } = useCart()
  const [imgError, setImgError] = useState(false)
  
  return (
    <Card className="m-2 product-card h-100">
      <div className="product-card__image-container">
        {imgError ? (
          <div 
            className="d-flex align-items-center justify-content-center product-card__placeholder" 
          >
            🍰
          </div>
        ) : (
          <Card.Img 
            variant="top" 
            src={process.env.PUBLIC_URL + product.image} 
            alt={product.title}
            onError={() => setImgError(true)}
            className="product-card__image"
          />
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="product-card__title">{product.title}</Card.Title>
        <Card.Text className="product-card__price">${product.price.toLocaleString('es-CL')}</Card.Text>
        <div className="d-flex flex-column gap-2 mt-auto">
          <Button onClick={() => addToCart(product)} variant="primary" className="w-100">
            Agregar al carrito
          </Button>
          {/* 👇 este botón usa la prop que puede venir desde Catalogo; protegemos su uso */}
          <Button
            className="btn-detalles w-100"
            variant="secondary"
            onClick={() => {
              if (typeof onVerDetalles === 'function') onVerDetalles(product)
            }}
          >
            Ver detalles
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    desc: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  onVerDetalles: PropTypes.func 
}

ProductCard.defaultProps = {
  onVerDetalles: undefined
}