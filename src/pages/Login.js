import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser, isAdmin } = useAuth();

  useEffect(() => { 
    if (currentUser) {
      // Si ya hay sesión, redirigir según el rol
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [currentUser, isAdmin, navigate]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const email = data.email.trim();
      // La contraseña es opcional para usuarios de demo
      const password = data.password?.trim() || '';

      const result = login(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Email o contraseña incorrectos');
      }

      window.dispatchEvent(new Event('userSessionChange'));
      
      // Redirigir según el rol del usuario
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
          
          {/* Banner de Demo */}
          <Alert variant="info" className="mb-4">
            <Alert.Heading className="h6">🎯 Demo - Acceso Rápido</Alert.Heading>
            <hr />
            <p className="mb-2"><strong>Panel Admin:</strong></p>
            <ul className="mb-2">
              <li><code>ana@duocuc.cl</code> (sin contraseña)</li>
              <li><code>admin@example.com</code> (sin contraseña)</li>
            </ul>
            <p className="mb-2"><strong>Usuario Normal:</strong></p>
            <ul className="mb-0">
              <li><code>luis@example.com</code></li>
              <li><code>maria@duocuc.cl</code></li>
            </ul>
            <hr className="my-2" />
            <small className="text-muted">💡 Para demo: solo ingresa el email, la contraseña es opcional</small>
          </Alert>
          
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
                  },
                  setValueAs: (value) => value.trim()
                })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña <small className="text-muted">(opcional para demo)</small></Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: false, // Ya no es obligatoria para demo
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  },
                  setValueAs: (value) => value?.trim() || ''
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