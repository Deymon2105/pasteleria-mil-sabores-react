import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Badge, Row, Col } from 'react-bootstrap';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //función watch para validaciones en tiempo real
  const watchEmail = watch('email', '');
  const watchBirthDate = watch('birthDate', '');
  const watchPromoCode = watch('promoCode', '');
  const watchPassword = watch('password', '');

  // Funciones de utilidad
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isDuocEmail = (email) => email.endsWith('@duocuc.cl'); //requisito para descuento con correo Duoc

  const age = watchBirthDate ? calculateAge(watchBirthDate) : 0;
  const hasSeniorDiscount = age >= 50; // requisito descuento senior a partir de 50 años
  const hasPromoDiscount = watchPromoCode === 'FELICES50'; //requisito código promocional
  const isDuocStudent = isDuocEmail(watchEmail);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]'); // Obtener usuarios existentes

      //verifica si el usuario ya existe
      if (users.some(u => u.email === data.email)) {
        throw new Error('Este email ya está registrado');
      }
      // Calcular descuentos
      const discounts = {
        senior: hasSeniorDiscount ? 50 : 0,
        promoCode: hasPromoDiscount ? 10 : 0,
        duocStudent: isDuocStudent,
        birthDate: data.birthDate
      };

      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        password: data.password,
        age,
        discounts,
        createdAt: new Date().toISOString()
      };

      //guardar usuario en el localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Mostrar beneficios
      let benefits = [];
      if (discounts.senior > 0) {
        benefits.push(`🎉 ${discounts.senior}% de descuento en todos los productos`);
      }
      if (discounts.promoCode > 0) {
        benefits.push(`🎁 ${discounts.promoCode}% de descuento adicional de por vida`);
      }
      if (discounts.duocStudent) {
        benefits.push('🎂 Torta gratis en tu cumpleaños');
      }

      if (benefits.length > 0) {
        alert('¡Registro exitoso!\n\n' + benefits.join('\n'));
      }

      // generar un login automático después del registro
      const { password, ...userWithoutPassword } = newUser;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="text-center mb-4">Registro de Usuario</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Beneficios activos */}
          {(hasSeniorDiscount || hasPromoDiscount || isDuocStudent) && (
            <Alert variant="success" className="benefits-alert">
              <h6 className="mb-2">🎉 Beneficios activados:</h6>
              {hasSeniorDiscount && (
                <Badge bg="success" className="me-2 mb-1">50% descuento senior</Badge>
              )}
              {hasPromoDiscount && (
                <Badge bg="info" className="me-2 mb-1">10% descuento FELICES50</Badge>
              )}
              {isDuocStudent && (
                <Badge bg="warning" text="dark" className="mb-1">🎂 Torta gratis</Badge>
              )}
            </Alert>
          )}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control type="text" placeholder="Juan Pérez"
                {...register('name', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres'
                  }
                })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="tu@email.com o estudiante@duocuc.cl"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                isInvalid={!!errors.email}
              />
              {isDuocStudent && (
                <Form.Text className="text-success">
                  ✓ Email institucional Duoc detectado
                </Form.Text>
              )}
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="birthDate">
                  <Form.Label>Fecha de nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('birthDate', {
                      required: 'La fecha de nacimiento es obligatoria',
                      validate: {
                        isAdult: (value) => {
                          const age = calculateAge(value);
                          return age >= 18 || 'Debes ser mayor de 18 años';
                        }
                      }
                    })}
                    isInvalid={!!errors.birthDate}
                  />
                  {hasSeniorDiscount && (
                    <Form.Text className="text-success">
                      ✓ Elegible para descuento senior ({age} años)
                    </Form.Text>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {errors.birthDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="promoCode">
                  <Form.Label>Código promocional (opcional)</Form.Label>
                  <Form.Control type="text" placeholder="FELICES50"
                    {...register('promoCode')}
                  />
                  {hasPromoDiscount && (
                    <Form.Text className="text-success">
                      ✓ Código válido aplicado
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="••••••••"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
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

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: value =>
                    value === watchPassword || 'Las contraseñas no coinciden'
                })}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="success" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p className="mb-0">¿Ya tienes cuenta?</p>
            <Link to="/login" className="btn btn-link">Inicia sesión aquí </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}