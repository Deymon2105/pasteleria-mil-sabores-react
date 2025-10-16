import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { Button, ListGroup, Alert, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Cart(){
  const { cart, removeFromCart, clearCart } = useCart()
  const [descuentosUsuario, setDescuentosUsuario] = useState(null)

  // Funcion para obtener los descuentos del usuario en localStorage
  useEffect(() => {
    const usuarioActual = localStorage.getItem('currentUser')
    if (usuarioActual) {
      try {
        const usuario = JSON.parse(usuarioActual)
        setDescuentosUsuario(usuario.discounts)
      } catch (error) {
        console.error('Error al obtener descuentos del usuario:', error)
      }
    }
  }, [])

  const subtotal = cart.reduce((s,p)=> s + (p.price*(p.qty||1)), 0) //calcular subtotal

  // Calcular descuentos 
  let descuentoTotal = 0
  let detallesDescuento = []

  if (descuentosUsuario) {
    if (descuentosUsuario.senior > 0) { // Descuento persona +50
      descuentoTotal += descuentosUsuario.senior
      detallesDescuento.push({ etiqueta: 'Descuento senior', valor: descuentosUsuario.senior })
    }

    if (descuentosUsuario.promoCode > 0) { //descuento código promocional
      descuentoTotal += descuentosUsuario.promoCode
      detallesDescuento.push({ etiqueta: 'Código FELICES50', valor: descuentosUsuario.promoCode })
    }
  }

  //calcular total con descuentos
  const montoDescuento = subtotal * (descuentoTotal / 100)
  const total = subtotal - montoDescuento

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
      
      {/* Resumen de compra */}
      <div className="mt-4 p-3 bg-light rounded">
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString('es-CL')}</span>
          </div>
          
          {/* Mostrar descuentos aplicados */}
          {detallesDescuento.length > 0 && (
            <>
              <hr />
              <div className="mb-2">
                <strong className="text-success">Descuentos aplicados:</strong>
                {detallesDescuento.map((desc, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center">
                    <span className="text-success">
                      <Badge bg="success" className="me-2">{desc.valor}%</Badge>
                      {desc.etiqueta}
                    </span>
                    <span className="text-success">
                      -${(subtotal * (desc.valor / 100)).toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
              <hr />
            </>
          )}

          {/* Beneficio Duoc (torta gratis) */}
          {descuentosUsuario?.duocStudent && (
            <Alert variant="info" className="mt-2 mb-2 py-2">
              <small>🎂 <strong>Beneficio activo:</strong> Torta gratis en tu cumpleaños</small>
            </Alert>
          )}
          
          <div className="d-flex justify-content-between">
            <h4 className="mb-0">Total:</h4>
            <h4 className="mb-0 text-success">${total.toLocaleString('es-CL')}</h4>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={clearCart}>Vaciar carrito</Button>
          <Button variant="success" as={Link} to="/compra">Finalizar compra</Button>
        </div>
      </div>
    </div>
  )
}
