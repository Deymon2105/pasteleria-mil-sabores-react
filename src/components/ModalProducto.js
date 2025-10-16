import React from 'react'
import { Modal, Button, Image } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useCart } from '../context/CartContext'

export default function ModalProducto({ producto, onClose }) {
  const { addToCart } = useCart()

  if (!producto) return null

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{producto.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="text-center mb-3">
          <Image
            src={producto.image}
            alt={producto.title}
            fluid
            rounded
            onError={(e) => (e.target.src = '/images/placeholder.jpg')}
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
        </div>
        <p className="mb-2">{producto.desc}</p>
        <p className="mb-2">
          <strong>Categoría:</strong> {producto.category}
        </p>
        <h5 className="text-primary">
          <strong>Precio:</strong> ${producto.price.toLocaleString('es-CL')}
        </h5>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="success" onClick={() => addToCart(producto)}>
          Agregar al carrito
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

ModalProducto.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
    price: PropTypes.number.isRequired,
    category: PropTypes.string,
    image: PropTypes.string.isRequired
  }),
  onClose: PropTypes.func.isRequired
}
