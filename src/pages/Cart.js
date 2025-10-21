import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { Button, ListGroup, Alert, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Cart(){
  const { cart, removeFromCart, clearCart } = useCart()
  const [userBenefits, setUserBenefits] = useState([])
  const [userName, setUserName] = useState('')

  // Obtener beneficios y nombre del usuario
  useEffect(() => {
    const usuarioActual = localStorage.getItem('currentUser')
    if (usuarioActual) {
      try {
        const usuario = JSON.parse(usuarioActual)
        setUserBenefits(usuario.benefits || [])
        setUserName(usuario.name || '')
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error)
      }
    }
  }, [])

  const subtotal = cart.reduce((s,p)=> s + (p.price*(p.qty||1)), 0)

  // Función para verificar si es el cumpleaños del usuario
  const esCumpleanios = () => {
    const usuarioActual = localStorage.getItem('currentUser')
    if (!usuarioActual) return false
    
    try {
      const usuario = JSON.parse(usuarioActual)
      if (!usuario.birthdate) return false
      
      const hoy = new Date()
      const fechaNacimiento = new Date(usuario.birthdate)
      
      // Comparar mes y día
      return hoy.getMonth() === fechaNacimiento.getMonth() && 
             hoy.getDate() === fechaNacimiento.getDate()
    } catch (error) {
      return false
    }
  }

  // Calcular descuentos basados en benefits array
  let descuentoTotal = 0
  let detallesDescuento = []
  let tortaGratisCumpleanios = false
  let montoTortaGratis = 0

  // Declaraciones para el flujo DUOC (se usan más abajo y en el bloque de cumpleaños)
  let duocDiscountAmount = 0
  let duocItem = null

  // Verificar torta gratis por cumpleaños (beneficio DUOC)
  if (userBenefits.includes('DUOC') && esCumpleanios()) {
    // Buscar si hay tortas en el carrito
    const tortasEnCarrito = cart.filter(p => 
      p.category && (
        p.category.includes('Torta') || 
        p.category.includes('Especial') ||
        p.title.toLowerCase().includes('torta')
      )
    )
    
    if (tortasEnCarrito.length > 0) {
      // Aplicar descuento de la torta más barata
      const tortaMasBarata = tortasEnCarrito.reduce((min, torta) => 
        torta.price < min.price ? torta : min
      )
      montoTortaGratis = tortaMasBarata.price
      tortaGratisCumpleanios = true
      // Marcar duoc item/amount para que la UI lo refleje en el listado de items
      duocItem = tortaMasBarata
      duocDiscountAmount = montoTortaGratis
      detallesDescuento.push({ 
        etiqueta: '🎂 Torta gratis por cumpleaños (DUOC)', 
        valor: 0,
        montoFijo: montoTortaGratis 
      })
    }
  }

  // Descuento mayores de 50 (50%)
  if (userBenefits.includes('>50')) {
    descuentoTotal += 50
    detallesDescuento.push({ etiqueta: 'Descuento mayores de 50 años', valor: 50 })
  }

  // Descuento código FELICES50 (10%)
  if (userBenefits.includes('FELICES50')) {
    descuentoTotal += 10
    detallesDescuento.push({ etiqueta: 'Código FELICES50', valor: 10 })
  }

  // Beneficio DUOC (torta gratis en cumpleaños, no aplica descuento aquí)
  const hasDuocBenefit = userBenefits.includes('DUOC')

  // --- Calcular descuento DUOC para el caso NO cumpleaños ---
  // Nota: si ya se aplicó la torta gratis por cumpleaños (tortaGratisCumpleanios===true),
  // no ejecutamos esta búsqueda para evitar sobreescribir el duocItem/amount.
  if (hasDuocBenefit && cart && cart.length > 0 && !tortaGratisCumpleanios) {
    // Nuevo requisito: aplicar el beneficio a la TORTA más barata
    // cuya *title* contenga la palabra 'torta' (case-insensitive).
    const eligibleCakeItems = cart.filter(item => {
      if (!item || !item.title) return false
      return item.title.toString().toLowerCase().includes('torta')
    })

    if (eligibleCakeItems.length > 0) {
      // Seleccionar la torta con menor precio unitario
      const cheapestCake = eligibleCakeItems.reduce((min, item) => {
        if (!min) return item
        return (item.price < (min.price || Infinity)) ? item : min
      }, null)

      if (cheapestCake) {
        duocItem = cheapestCake
        // Beneficio aplica a una sola unidad (la más barata encontrada)
        duocDiscountAmount = cheapestCake.price || 0
      }
    }
  }

  //calcular total con descuentos
  const montoDescuento = subtotal * (descuentoTotal / 100)
  // Monto DUOC aplicado: puede venir de la torta de cumpleaños (montoTortaGratis)
  // o del flujo general (duocDiscountAmount). Sumamos ambos por seguridad
  const duocAppliedAmount = (montoTortaGratis || 0) + (duocDiscountAmount || 0)
  const total = subtotal - montoDescuento - duocAppliedAmount

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Carrito de Compras</h2>
        {userName && <span className="text-muted">Cliente: {userName}</span>}
      </div>

      {/* Mostrar beneficios activos del usuario */}
      {userBenefits.length > 0 && (
        <Alert variant="success" className="mb-3">
          <strong>Beneficios activos:</strong>{' '}
          {userBenefits.map((benefit, idx) => (
            <Badge key={idx} bg="success" className="me-1">
              {benefit === '>50' ? 'Descuento Senior 50%' : 
               benefit === 'FELICES50' ? 'Código Promo 10%' : 
               benefit === 'DUOC' ? 'Torta Gratis Cumpleaños' : benefit}
            </Badge>
          ))}
        </Alert>
      )}

      <ListGroup className="mt-3">
        {cart.map(item=> {
          const qty = item.qty || 1
          const itemTotal = item.price * qty
          const isDuocApplied = hasDuocBenefit && duocItem && duocItem.id === item.id && duocDiscountAmount > 0
          const billedAmount = isDuocApplied ? Math.max(0, itemTotal - item.price) : itemTotal

          return (
            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <strong>{item.title}</strong>
                  {isDuocApplied && (
                    <Badge bg="info" pill style={{ fontSize: '0.75rem' }}>
                      1 unidad gratis
                    </Badge>
                  )}
                </div>
                <div>
                  <small className="text-muted">Precio unitario: ${item.price.toLocaleString('es-CL')}</small>
                  {' | '}
                  <small className="text-muted">Cantidad: {qty}</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  {isDuocApplied ? (
                    <>
                      <div className="fw-bold">${billedAmount.toLocaleString('es-CL')}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>(-{item.price.toLocaleString('es-CL')} por 1 unidad gratis)</div>
                    </>
                  ) : (
                    <span className="fw-bold">${billedAmount.toLocaleString('es-CL')}</span>
                  )}
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={()=>removeFromCart(item.id)}
                >
                  Eliminar
                </Button>
              </div>
            </ListGroup.Item>
          )
        })}
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
                  <div key={idx} className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-success">
                      {desc.montoFijo ? (
                        <Badge bg="warning" text="dark" className="me-2">GRATIS</Badge>
                      ) : (
                        <Badge bg="success" className="me-2">{desc.valor}%</Badge>
                      )}
                      {desc.etiqueta}
                    </span>
                    <span className="text-success fw-bold">
                      {desc.montoFijo ? (
                        `-$${desc.montoFijo.toLocaleString('es-CL')}`
                      ) : (
                        `-$${(subtotal * (desc.valor / 100)).toLocaleString('es-CL')}`
                      )}
                    </span>
                  </div>
                ))}
                {/* DUOC: producto gratis (una unidad) */}
                {hasDuocBenefit && duocAppliedAmount > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-success">
                      <Badge bg="info" className="me-2">Producto gratis</Badge>
                      {duocItem ? `${duocItem.title} (beneficio DUOC)` : 'Producto elegible (beneficio DUOC)'}
                    </span>
                    <span className="text-success fw-bold">-{duocAppliedAmount.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fw-bold">Total descuento:</span>
                  <span className="text-success fw-bold">
                    -{descuentoTotal}% (-${(montoDescuento + duocAppliedAmount).toLocaleString('es-CL')})
                  </span>
                </div>
              </div>
              <hr />
            </>
          )}
          
          <div className="d-flex justify-content-between">
            <h4 className="mb-0">Total a pagar:</h4>
            <h4 className="mb-0 text-success">${total.toLocaleString('es-CL')}</h4>
          </div>
          
          {(descuentoTotal > 0 || duocAppliedAmount > 0) && (
            <div className="text-end mt-2">
              <small className="text-muted">
                Ahorras: ${(montoDescuento + duocAppliedAmount).toLocaleString('es-CL')}
                {descuentoTotal > 0 && ` (${descuentoTotal}%)`}
                {tortaGratisCumpleanios && ' + Torta Gratis 🎂'}
              </small>
            </div>
          )}
        </div>
        
        {hasDuocBenefit && (
          <Alert variant={tortaGratisCumpleanios ? "success" : "info"} className="mt-3 mb-3 py-2">
            {tortaGratisCumpleanios ? (
              <small><strong>🎉 ¡Feliz Cumpleaños!</strong> Tu torta es GRATIS (Beneficio DUOC)</small>
            ) : esCumpleanios() ? (
              <small><strong>🎂 ¡Es tu cumpleaños!</strong> Agrega una torta al carrito y será gratis (Beneficio DUOC)</small>
            ) : (
              <small><strong>Beneficio DUOC activo:</strong> Recuerda que tienes una torta gratis en tu cumpleaños</small>
            )}
          </Alert>
        )}
        
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" onClick={clearCart}>Vaciar carrito</Button>
          <Button variant="success" as={Link} to="/compra" size="lg">
            Finalizar compra (${total.toLocaleString('es-CL')})
          </Button>
        </div>
      </div>
    </div>
  )
}
