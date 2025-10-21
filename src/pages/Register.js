import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [benefitMessages, setBenefitMessages] = useState([]);
  const navigate = useNavigate();
  const { currentUser, allUsers, register: registerUser } = useAuth();

  //redirigir si ya hay sesión activa
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  //función watch para validaciones en tiempo real
  const watchEmail = watch('email', '');
  const watchBirthDate = watch('birthDate', '');
  const watchPromoCode = watch('promoCode', '');
  const watchPassword = watch('password', '');

  // Funcion para calcular edad
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

  // Funcion para verificar email Duoc y aplicar descuento
  const isDuocEmail = (email) => email.endsWith('@duocuc.cl');

  // Calcular beneficios en tiempo real solo para mostrar en pantalla
  const age = watchBirthDate ? calculateAge(watchBirthDate) : 0;
  const hasSeniorDiscount = age >= 50; // requisito descuento senior a partir de 50 años
  const hasPromoDiscount = watchPromoCode === 'FELICES50'; //requisito código promocional
  const isDuocStudent = isDuocEmail(watchEmail);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    setBenefitMessages([]);

    try {
      const email = data.email.trim();
      const name = data.name.trim();
      const password = data.password.trim();

      // Verificar si el usuario ya existe
      if (allUsers.some(u => u.email === email)) {
        throw new Error('Este email ya está registrado');
      }

      // Calcular edad
      const submittedAge = calculateAge(data.birthDate);
      
      // Calcular beneficios
      const benefits = [];
      
      if (submittedAge >= 50) {
        benefits.push('>50');
      }
      
      if (data.promoCode?.trim() === 'FELICES50') {
        benefits.push('FELICES50');
      }
      
      if (isDuocEmail(email)) {
        benefits.push('DUOC');
      }

      // Crear nuevo usuario con el formato correcto del sistema
      const newUser = {
        name,
        email,
        password, // Guardamos la contraseña
        role: 'user', // Los nuevos usuarios son usuarios normales
        birthdate: data.birthDate,
        benefits: benefits,
        age: submittedAge,
        createdAt: new Date().toISOString()
      };

      // Registrar usuario usando AuthContext
      const result = registerUser(newUser);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al registrar usuario');
      }

      // Mostrar beneficios obtenidos
      let benefitMsgs = [];
      if (submittedAge >= 50) {
        benefitMsgs.push('🎉 10% de descuento en todos los productos (mayores de 50)');
      }
      if (data.promoCode?.trim() === 'FELICES50') {
        benefitMsgs.push('🎁 10% de descuento adicional con código FELICES50');
      }
      if (isDuocEmail(email)) {
        benefitMsgs.push('🎂 Torta gratis en tu cumpleaños (estudiante DUOC)');
      }

      if (benefitMsgs.length > 0) {
        setBenefitMessages(benefitMsgs);
        setTimeout(() => {
          navigate('/');
        }, 3000); // 3 segundos para ver los beneficios antes de redirigir
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
    <Container className="register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="text-center mb-4">Registro de Usuario</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {/* se muestran beneficios en tiempo real */}
          {(hasSeniorDiscount || hasPromoDiscount || isDuocStudent) && (
            <Alert variant="success" className="benefits-alert">
              <h6 className="mb-2">🎉 Beneficios activados:</h6>
              {hasSeniorDiscount && (
                <Badge bg="success" className="me-2 mb-1">10% descuento senior</Badge>
              )}
              {hasPromoDiscount && (
                <Badge bg="info" className="me-2 mb-1">10% descuento FELICES50</Badge>
              )}
              {isDuocStudent && (
                <Badge bg="warning" text="dark" className="mb-1">🎂 Torta gratis</Badge>
              )}
            </Alert>
          )}

          {/*mensajes de beneficios aplicados */}
          {benefitMessages.length > 0 && (
            <Alert variant="success" onClose={() => setBenefitMessages([])} dismissible>
              <h6 className="mb-2">🎉 Beneficios obtenidos:</h6>
              <ul className="mb-0">
                {benefitMessages.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </Alert>
          )}
          {/*apartado del nombre*/}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control type="text" placeholder="Juan Pérez"
                {...register('name', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres'
                  },
                  setValueAs: (value) => value.trim()
                })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>
            {/*apartado del email*/}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="tu@email.com o estudiante@duocuc.cl"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  },
                  setValueAs: (value) => value.trim()
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
            {/*apartado de la fecha de nacimiento y codigos prmocionales*/}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="birthDate">
                  <Form.Label>Fecha de nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('birthDate', {
                      required: 'La fecha de nacimiento es obligatoria',
                      validate: {
                        notFuture: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Normalizar a medianoche
                          return selectedDate <= today || 'La fecha no puede ser futura';
                        },
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
                    {...register('promoCode', {
                      setValueAs: (value) => value?.trim() || ''
                    })}
                  />
                  {hasPromoDiscount && (
                    <Form.Text className="text-success">
                      ✓ Código válido aplicado
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {/*apartado de contraseña*/}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="••••••••"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
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

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: value =>
                    value === watchPassword || 'Las contraseñas no coinciden',
                  setValueAs: (value) => value.trim()
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