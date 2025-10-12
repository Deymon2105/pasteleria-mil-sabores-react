import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => { //se ejecuta un función asincrona al enviar el formulario
    setError('');
    setLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]'); //obtener usuarios del localStorage
      const user = users.find(u => u.email === data.email && u.password === data.password);

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }
      localStorage.setItem('currentUser', JSON.stringify(user)); //guardar sesión
      navigate('/dashboard'); // redirigir al dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="*****@email.com"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p className="mb-0">¿No tienes cuenta?</p>
            <Link to="/register" className="btn btn-link">Regístrate aquí</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
