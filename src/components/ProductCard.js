import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Card, Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'

export default function ProductCard({product}){
  const { addToCart } = useCart()
  const [imgError, setImgError] = useState(false)
  
  return (
    <Card style={{width: '18rem'}} className="m-2 product-card">
      {imgError ? (
        <div className="d-flex align-items-center justify-content-center" style={{height: '200px', backgroundColor: '#f8f9fa', fontSize: '3rem'}}>
          🍰
        </div>
      ) : (
        <Card.Img 
          variant="top" 
          src={product.image} 
          alt={product.title}
          onError={() => setImgError(true)}
        />
      )}
      <Card.Body>
        <Card.Title>{product.title}</Card.Title>
        <Card.Text>${product.price.toLocaleString('es-CL')}</Card.Text>
        <Button onClick={()=>addToCart(product)} variant="primary">Agregar al carrito</Button>
      </Card.Body>
    </Card>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    desc: PropTypes.string,
    category: PropTypes.string
  }).isRequired
}
