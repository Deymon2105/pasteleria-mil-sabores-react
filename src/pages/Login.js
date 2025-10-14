import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/'); //redirigir si ya hay sesión activa
    }
  }, [navigate]);

  const onSubmit = async (data) => { //se ejecuta un función asincrona al enviar el formulario
    setError('');
    setLoading(true);

    try {
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
        if (!Array.isArray(users)) throw new Error('Invalid users data');
      } catch (e) {
        // si users está corrupto, resetear a array vacío
        users = [];
        localStorage.setItem('users', JSON.stringify(users));
      }

      const email = data.email.trim(); // trim por si quedan espacios alrededor
      const password = data.password.trim();

      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }

      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword)); //guardar sesión
      
      window.dispatchEvent(new Event('userSessionChange')); // disparar evento para que el Header se actualice
      navigate('/'); //enviar a la pantalla del home
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
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  },
                  setValueAs: (value) => value.trim()
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