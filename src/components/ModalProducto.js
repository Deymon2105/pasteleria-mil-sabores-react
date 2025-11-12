import React from 'react'
import { Modal, Button, Image } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useCart } from '../context/CartContext'

export default function ModalProducto({ producto, onClose }) {
  const { addToCart } = useCart()

  if (!producto) return null

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{producto.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="modal-producto__image-container">
              <Image
                src={process.env.PUBLIC_URL + producto.image}
                alt={producto.title}
                fluid
                rounded
                onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                className="modal-producto__image"
              />
            </div>
          </div>
          <div className="col-md-6">
            <p className="mb-3">{producto.desc}</p>
            <p className="mb-2">
              <strong>Categoría:</strong> {producto.category}
            </p>
            <h5 className="text-primary">
              <strong>Precio:</strong> ${producto.price.toLocaleString('es-CL')}
            </h5>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex flex-column flex-sm-row justify-content-between gap-2">
        <Button variant="secondary" onClick={onClose} className="w-100 w-sm-auto">
          Cerrar
        </Button>
        <Button variant="success" onClick={() => addToCart(producto)} className="w-100 w-sm-auto">
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
