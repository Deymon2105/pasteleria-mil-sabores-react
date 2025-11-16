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

  const fondoLogin = process.env.PUBLIC_URL + '/img/fondoLogin.png';
  const logoPasteleria = process.env.PUBLIC_URL + '/img/logoPasteleria.png';

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
      const password = data.password?.trim() || '';

      const result = await login(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Email o contraseña incorrectos');
      }
      
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
    <div className="login-page" style={{
      backgroundImage: `url(${fondoLogin})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 245, 225, 0.7)',
        zIndex: 0
      }}></div>
      <Container className="login-container">
        <Card className="login-card-modern">
          <Card.Body className="login-card-body">
            <div className="login-header">
              <div className="login-icon">
                <img src={logoPasteleria} alt="Logo Pastelería Mil Sabores" style={{width: '500px'}} />
              </div>
              <h2 className="login-title">Iniciar Sesión</h2>
              <p className="login-subtitle">Bienvenido de vuelta a Mil Sabores</p>
            </div>
            
            {error && (
              <Alert variant="danger" className="login-alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="login-label">
                  <i className="bi bi-envelope me-2"></i>
                  Correo Electrónico
                </Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="tu@email.com"
                  className="login-input"
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

              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="login-label">
                  <i className="bi bi-lock me-2"></i>
                  Contraseña
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  className="login-input"
                  {...register('password', {
                    required: 'La contraseña es requerida',
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

              <Button type="submit" className="login-button w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </Form>

            <div className="login-footer">
              <p className="login-footer-text">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="login-link">
                  Regístrate gratis
                </Link>
              </p>
            </div>

            {/* Usuarios de prueba */}
            <div className="login-demo">
              <p className="login-demo-title">
                <i className="bi bi-info-circle me-1"></i>
                Usuarios de prueba:
              </p>
              <div className="login-demo-credentials">
                <code>ana@duocuc.cl / admin123</code>
                <code>luis@example.com / 123456</code>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}