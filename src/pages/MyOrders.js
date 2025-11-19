import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { orderService, ORDER_STATUS_MAP } from '../service/api';
import '../styles/styles.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error al cargar mis pedidos:', error);
      setError(error.message || 'Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando tus pedidos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar pedidos</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Mis Pedidos</h2>
      
      {orders.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No tienes pedidos aún</Alert.Heading>
          <p>Cuando realices tu primera compra, aparecerá aquí.</p>
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.code}</strong>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <strong>{formatCurrency(order.total)}</strong>
                    {order.discount > 0 && (
                      <div className="text-success small">
                        Descuento: {formatCurrency(order.discount)}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge 
                      bg={ORDER_STATUS_MAP[order.status]?.badgeColor || 'secondary'}
                      pill
                    >
                      {ORDER_STATUS_MAP[order.status]?.label || order.status}
                    </Badge>
                  </td>
                  <td>
                    {order.items && order.items.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="small">
                            {item.product?.name || 'Producto'} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">Sin items</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {orders.length > 0 && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Información de Contacto</Card.Title>
            <Card.Text className="text-muted">
              Para consultas sobre tus pedidos, contáctanos a través de nuestra página de contacto 
              o envíanos un email con tu código de pedido.
            </Card.Text>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
