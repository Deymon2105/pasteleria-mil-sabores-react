import React from 'react'
import { useCart } from '../context/CartContext'
import { Button, ListGroup, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Cart(){
  const { cart, removeFromCart, clearCart } = useCart()

  const total = cart.reduce((s,p)=> s + (p.price*(p.qty||1)), 0)

  if (cart.length === 0) {
    return (
      <div className="container my-4">
        <h2>Carrito de Compras</h2>
        <Alert variant="info" className="mt-4">
          <Alert.Heading>Tu carrito está vacío</Alert.Heading>
          <p>No tienes productos en tu carrito. ¡Descubre nuestros deliciosos productos!</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Link to="/catalogo">
              <Button variant="outline-info">Ver Catálogo</Button>
            </Link>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container my-4">
      <h2>Carrito de Compras</h2>
      <ListGroup className="mt-3">
        {cart.map(item=> (
          <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{item.title}</strong>
              <br />
              <small className="text-muted">Cantidad: {item.qty || 1}</small>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold">${(item.price*(item.qty||1)).toLocaleString('es-CL')}</span>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={()=>removeFromCart(item.id)}
              >
                Eliminar
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="mt-4 p-3 bg-light rounded">
        <h4 className="mb-3">Total: ${total.toLocaleString('es-CL')}</h4>
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={clearCart}>Vaciar carrito</Button>
          <Button variant="success">Finalizar compra</Button>
        </div>
      </div>
    </div>
  )
}
