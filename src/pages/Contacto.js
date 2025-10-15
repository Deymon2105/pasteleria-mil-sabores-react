import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

export default function Contacto() {
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const onSubmit = (e) => { //Funcion cuando se envia el formulario
    e.preventDefault();
    setShowAlert(true); // Mostrar mensaje de éxito
    setFormData({ name: '', email: '', message: '' }); // Limpiar formulario
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container className="contacto-container">
      <Card className="contacto-card">
        <Card.Body>
          <h2 className="text-center mb-4">Formulario de Contactos</h2>
          {/*Mostrar la alerta*/}
          {showAlert && (
            <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
              ¡Tu mensaje ha sido enviado! Te contactaremos pronto.
            </Alert>
          )}

          <Form onSubmit={onSubmit}>
            {/*apartado del nombre*/}
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/*apartado del email*/}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                placeholder="tu@email.com o estudiante@duocuc.cl"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/*apartado del mensaje*/}
            <Form.Group className="mb-3" controlId="message">
              <Form.Label>Mensaje</Form.Label>
              <Form.Control 
                as="textarea" 
                name="message"
                rows={3} 
                placeholder="Escribe tu mensaje aquí..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Enviar Mensaje
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}