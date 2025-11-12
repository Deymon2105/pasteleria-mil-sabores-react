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

  const fondoLogin = process.env.PUBLIC_URL + '/img/fondoLogin.png';
  const logoPasteleria = process.env.PUBLIC_URL + '/img/logoPasteleria.png';

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
        password,
        role: 'user',
        birthdate: data.birthDate,
        benefits: benefits,
        age: submittedAge,
        createdAt: new Date().toISOString()
      };

      // Registrar usuario usando AuthContext (ahora es async)
      const result = await registerUser(newUser);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al registrar usuario');
      }

      // Mostrar beneficios obtenidos
      let benefitMsgs = [];
      if (submittedAge >= 50) {
        benefitMsgs.push('🎉 50% de descuento en todos los productos (mayores de 50)');
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
    <div className="register-page" style={{
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
      <Container className="register-container">
        <Card className="register-card-modern">
          <Card.Body className="register-card-body">
            <div className="register-header">
              <div className="register-icon">
                <img src={logoPasteleria} alt="Logo Pastelería Mil Sabores" style={{width: '100px'}} />
              </div>
              <h2 className="register-title">Crear Cuenta</h2>
              <p className="register-subtitle">Únete a la familia Mil Sabores</p>
            </div>

            {error && (
              <Alert variant="danger" className="register-alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            {/* se muestran beneficios en tiempo real */}
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

            {/*mensajes de beneficios aplicados */}
            {benefitMessages.length > 0 && (
              <Alert variant="success" onClose={() => setBenefitMessages([])} dismissible>
                <h6 className="mb-2">🎉 Beneficios obtenidos:</h6>
                <ul className="mb-0">
                  {benefitMessages.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)} className="register-form">
              <Form.Group className="mb-3" controlId="name">
                <Form.Label className="register-label">
                  <i className="bi bi-person me-2"></i>
                  Nombre completo
                </Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Juan Pérez"
                  className="register-input"
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

              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="register-label">
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="tu@email.com o estudiante@duocuc.cl"
                  className="register-input"
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="birthDate">
                  <Form.Label className="register-label">
                    <i className="bi bi-calendar me-2"></i>
                    Fecha de nacimiento
                  </Form.Label>
                  <Form.Control
                    type="date"
                    className="register-input"
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
                  <Form.Label className="register-label">
                    <i className="bi bi-gift me-2"></i>
                    Código promocional (opcional)
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="FELICES50"
                    className="register-input"
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

            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="register-label">
                <i className="bi bi-lock me-2"></i>
                Contraseña
              </Form.Label>
              <Form.Control 
                type="password" 
                placeholder="••••••••"
                className="register-input"
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
              <Form.Label className="register-label">
                <i className="bi bi-shield-check me-2"></i>
                Confirmar contraseña
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                className="register-input"
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

            <Button type="submit" className="register-button w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Crear Cuenta
                </>
              )}
            </Button>
          </Form>

          <div className="register-footer">
            <p className="register-footer-text">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="register-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
}