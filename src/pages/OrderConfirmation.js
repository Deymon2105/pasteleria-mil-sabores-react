import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Card, Alert, ListGroup, Badge, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

export default function OrderConfirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Vaciar el carrito al cargar la página de confirmación
        clearCart();

        // Obtener datos de la orden desde el state de navegación
        if (location.state && location.state.orderData) {
            setOrderData(location.state.orderData);
        } else {
            // Si no hay datos, redirigir al inicio
            navigate('/');
        }
    }, [location, navigate, clearCart]);

    if (!orderData) {
        return (
            <Container className="my-4">
                <Alert variant="info">
                    <Alert.Heading>Cargando confirmación...</Alert.Heading>
                </Alert>
            </Container>
        );
    }

    const {
        code,
        total,
        discount,
        subtotal,
        shippingAddress,
        paymentInfo,
        items,
        created_at
    } = orderData;

    const fecha = new Date(created_at || new Date()).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const recipientEmail = shippingAddress?.correo || orderData.guest_email || orderData.user?.email;

    return (
        <Container className="my-5">
            <Alert variant="success" className="mb-4">
                <Alert.Heading>
                    <i className="bi bi-envelope-check me-2"></i>
                    Boleta enviada al correo
                </Alert.Heading>
                <p className="mb-0">
                    Hemos enviado la boleta completa de tu compra a: <strong>{recipientEmail}</strong>
                </p>
                <p className="mb-0 mt-2 small">
                    Por favor revisa tu bandeja de entrada (y la carpeta de spam si no lo encuentras).
                </p>
            </Alert>

            <div className="row">
                {/* Información del Pedido */}
                <div className="col-md-8">
                    <Card className="mb-4">
                        <Card.Body>
                            <h3 className="mb-4" style={{ color: '#8B4513' }}>
                                <i className="bi bi-receipt me-2"></i>
                                Detalles del Pedido
                            </h3>

                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Código de Pedido:</strong>
                                    </p>
                                    <Badge bg="primary" style={{ fontSize: '16px', padding: '8px 12px' }}>
                                        {code}
                                    </Badge>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Fecha:</strong>
                                    </p>
                                    <p className="mb-0">{fecha}</p>
                                </div>
                            </div>

                            <hr />

                            <h5 className="mb-3">Productos Comprados</h5>
                            <ListGroup variant="flush">
                                {items && items.map((item, index) => (
                                    <ListGroup.Item key={index} className="px-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <strong>{item.title || item.name || 'Producto'}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Cantidad: {item.quantity || 1} × ${(item.price || 0).toLocaleString('es-CL')}
                                                </small>
                                            </div>
                                            <span className="fw-bold">
                                                ${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <hr />

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${(subtotal || total + (discount || 0)).toLocaleString('es-CL')}</span>
                            </div>

                            {discount > 0 && (
                                <div className="d-flex justify-content-between mb-2 text-success">
                                    <span>Descuento:</span>
                                    <span>-${(discount || 0).toLocaleString('es-CL')}</span>
                                </div>
                            )}

                            <hr />

                            <div className="d-flex justify-content-between">
                                <h4>Total Pagado:</h4>
                                <h4 className="text-success">${(total || 0).toLocaleString('es-CL')}</h4>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Dirección de Envío */}
                    {shippingAddress && (
                        <Card className="mb-4">
                            <Card.Body>
                                <h5 className="mb-3" style={{ color: '#8B4513' }}>
                                    <i className="bi bi-geo-alt me-2"></i>
                                    Dirección de Envío
                                </h5>
                                <p className="mb-1">
                                    <strong>{shippingAddress.nombre}</strong>
                                </p>
                                <p className="mb-1">
                                    {shippingAddress.calle}
                                    {shippingAddress.depto && `, ${shippingAddress.depto}`}
                                </p>
                                <p className="mb-1">
                                    {shippingAddress.comuna}, {shippingAddress.region}
                                </p>
                                {shippingAddress.codigo_postal && (
                                    <p className="mb-1">
                                        Código Postal: {shippingAddress.codigo_postal}
                                    </p>
                                )}
                                {shippingAddress.telefono && (
                                    <p className="mb-1">
                                        Teléfono: {shippingAddress.telefono}
                                    </p>
                                )}
                                {shippingAddress.indicaciones && (
                                    <p className="mb-0 mt-2">
                                        <small className="text-muted">
                                            <strong>Indicaciones:</strong> {shippingAddress.indicaciones}
                                        </small>
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Información de Pago */}
                    {paymentInfo && (
                        <Card className="mb-4">
                            <Card.Body>
                                <h5 className="mb-3" style={{ color: '#8B4513' }}>
                                    <i className="bi bi-credit-card me-2"></i>
                                    Información de Pago
                                </h5>
                                <p className="mb-1">
                                    <strong>Método:</strong> {paymentInfo.method === 'credit_card' ? 'Tarjeta de Crédito' : paymentInfo.method}
                                </p>
                                {paymentInfo.lastFourDigits && (
                                    <p className="mb-1">
                                        <strong>Tarjeta:</strong> ****{paymentInfo.lastFourDigits}
                                    </p>
                                )}
                                {paymentInfo.cardHolderName && (
                                    <p className="mb-0">
                                        <strong>Titular:</strong> {paymentInfo.cardHolderName}
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </div>

                {/* Resumen Lateral */}
                <div className="col-md-4">
                    <Card className="mb-4" style={{ position: 'sticky', top: '20px' }}>
                        <Card.Body>
                            <h5 className="mb-3">Resumen</h5>
                            
                            <div className="mb-3">
                                <p className="mb-1 small text-muted">Código de Pedido</p>
                                <p className="mb-0 fw-bold">{code}</p>
                            </div>

                            <div className="mb-3">
                                <p className="mb-1 small text-muted">Total</p>
                                <p className="mb-0 fs-4 text-success fw-bold">
                                    ${(total || 0).toLocaleString('es-CL')}
                                </p>
                            </div>

                            <div className="mb-3">
                                <p className="mb-1 small text-muted">Estado</p>
                                <Badge bg="warning" style={{ fontSize: '14px' }}>
                                    Pendiente
                                </Badge>
                            </div>

                            <hr />

                            <Alert variant="info" className="mb-3 py-2">
                                <small>
                                    <strong>📧 Email enviado</strong><br />
                                    La boleta completa ha sido enviada a tu correo electrónico.
                                </small>
                            </Alert>

                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary" 
                                    as={Link} 
                                    to="/catalogo"
                                >
                                    <i className="bi bi-bag me-2"></i>
                                    Seguir Comprando
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    as={Link} 
                                    to="/"
                                >
                                    <i className="bi bi-house me-2"></i>
                                    Volver al Inicio
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}

