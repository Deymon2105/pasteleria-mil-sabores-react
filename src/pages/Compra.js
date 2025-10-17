import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, ListGroup, Badge } from "react-bootstrap";
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Compra() {
    const { cart, clearCart } = useCart();
    const navegar = useNavigate();
    
    const [mostrarAlertaCompraAnulada, setMostrarAlertaCompraAnulada] = useState(false);
    const [mostrarAlertaCompraExitosa, setMostrarAlertaCompraExitosa] = useState(false);
    const [datosFormulario, setDatosFormulario] = useState({
        nombre: '', 
        correo: '', 
        calle: '', 
        depto: '', 
        region: '', 
        comuna: '', 
        mensaje: '',
        numeroTarjeta: '',
        nombreTarjeta: '',
        fechaVencimiento: '',
        cvv: ''
    });
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [descuentosUsuario, setDescuentosUsuario] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [carritoInicial, setCarritoInicial] = useState([]);

    //funcion para obtener usuario y descuentos al cargar la página
    useEffect(() => {
        const usuarioStr = localStorage.getItem('currentUser');
        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);
                setUsuarioActual(usuario);
                setDescuentosUsuario(usuario.discounts);
                // Pre-llenar nombre y correo
                setDatosFormulario(prev => ({
                    ...prev,
                    nombre: usuario.name || '',
                    correo: usuario.email || ''
                }));
            } catch (error) {
                console.error('Error al cargar usuario:', error);
            }
        }
        if (carritoInicial.length === 0 && cart.length > 0) {
            setCarritoInicial([...cart]);
        }
        if (cart.length === 0 && carritoInicial.length === 0 && !mostrarAlertaCompraExitosa) {
            navegar('/cart');
        }
    }, [cart, navegar, carritoInicial.length, mostrarAlertaCompraExitosa]);

    const carritoParaCalcular = cart.length > 0 ? cart : carritoInicial;
    const subtotal = carritoParaCalcular.reduce((s, p) => s + (p.price * (p.qty || 1)), 0);
    
    let descuentoTotal = 0;
    let detallesDescuento = [];
    
    if (descuentosUsuario) {
        if (descuentosUsuario.senior > 0) {
            descuentoTotal += descuentosUsuario.senior;
            detallesDescuento.push({ etiqueta: 'Descuento senior', valor: descuentosUsuario.senior });
        }
        if (descuentosUsuario.promoCode > 0) {
            descuentoTotal += descuentosUsuario.promoCode;
            detallesDescuento.push({ etiqueta: 'Código FELICES50', valor: descuentosUsuario.promoCode });
        }
    }
    
    const montoDescuento = subtotal * (descuentoTotal / 100);
    const total = subtotal - montoDescuento;

    const manejarEnvio = (e) => {
        e.preventDefault();
        setCargando(true);
        
        //validar campos de dirección
        if (!datosFormulario.nombre || !datosFormulario.correo || 
            !datosFormulario.calle || !datosFormulario.region || !datosFormulario.comuna) {
            alert('Por favor completa todos los campos de envío obligatorios');
            setCargando(false);
            return;
        }
        
        //validar campos de pago
        if (!datosFormulario.numeroTarjeta || !datosFormulario.nombreTarjeta || 
            !datosFormulario.fechaVencimiento || !datosFormulario.cvv) {
            setMostrarAlertaCompraAnulada(true);
            setCargando(false);
            // Scroll hacia arriba para ver la alerta
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        //validar formato de número de tarjeta
        const numeroLimpio = datosFormulario.numeroTarjeta.replace(/\s/g, '');
        if (numeroLimpio.length !== 16) {
            alert('El número de tarjeta debe tener 16 dígitos');
            setCargando(false);
            return;
        }
        
        //validar formato de fecha de vencimiento
        if (!/^\d{2}\/\d{2}$/.test(datosFormulario.fechaVencimiento)) {
            alert('La fecha de vencimiento debe tener formato MM/AA');
            setCargando(false);
            return;
        }
        
        //validar que la tarjeta no esté vencida
        const [mes, anio] = datosFormulario.fechaVencimiento.split('/');
        const fechaVencimiento = new Date(2000 + parseInt(anio), parseInt(mes) - 1);
        const fechaActual = new Date();
        if (fechaVencimiento < fechaActual) {
            alert('La tarjeta está vencida');
            setCargando(false);
            return;
        }
        
        //validar CVV
        if (datosFormulario.cvv.length < 3 || datosFormulario.cvv.length > 4) {
            alert('El CVV debe tener 3 o 4 dígitos');
            setCargando(false);
            return;
        }
        const pagoExitoso = Math.random() > 0.2; // 80% de éxito

        if (pagoExitoso) {
            try {
                // Crear objeto de compra
                const compra = {
                    id: Date.now(),
                    idUsuario: usuarioActual?.id || 'invitado',
                    nombreUsuario: datosFormulario.nombre,
                    correoUsuario: datosFormulario.correo,
                    productos: carritoInicial.map(item => ({
                        id: item.id,
                        titulo: item.title,
                        precio: item.price,
                        cantidad: item.qty || 1,
                        subtotal: item.price * (item.qty || 1)
                    })),
                    direccion: {
                        calle: datosFormulario.calle,
                        depto: datosFormulario.depto,
                        region: datosFormulario.region,
                        comuna: datosFormulario.comuna,
                        indicaciones: datosFormulario.mensaje
                    },
                    subtotal: subtotal,
                    descuentos: detallesDescuento,
                    totalDescuento: montoDescuento,
                    total: total,
                    fecha: new Date().toISOString(),
                    estado: 'completado'
                };

                // Guardar en localStorage
                let compras = [];
                try {
                    compras = JSON.parse(localStorage.getItem('compras') || '[]');
                    if (!Array.isArray(compras)) compras = [];
                } catch (error) {
                    compras = [];
                }

                compras.push(compra);
                localStorage.setItem('compras', JSON.stringify(compras));

                clearCart();
                setMostrarAlertaCompraExitosa(true);
                setCargando(false);
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Resetear formulario
                setDatosFormulario({
                    nombre: usuarioActual?.name || '', 
                    correo: usuarioActual?.email || '', 
                    calle: '', 
                    depto: '', 
                    region: '', 
                    comuna: '', 
                    mensaje: '',
                    numeroTarjeta: '',
                    nombreTarjeta: '',
                    fechaVencimiento: '',
                    cvv: ''
                });
                setTimeout(() => {
                    navegar('/');
                }, 4000);

            } catch (error) {
                console.error('Error al procesar compra:', error);
                setMostrarAlertaCompraAnulada(true);
                setCargando(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Pago rechazado
            setMostrarAlertaCompraAnulada(true);
            setCargando(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        
        //agregar espacios cada 4 dígitos)
        if (name === 'numeroTarjeta') {
            const onlyNumbers = value.replace(/\D/g, '');
            const formatted = onlyNumbers.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19); // Máximo 16 dígitos + 3 espacios
            setDatosFormulario({
                ...datosFormulario,
                [name]: formatted
            });
            return;
        }
        
        if (name === 'fechaVencimiento') {
            const cleaned = value.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 2) {
                formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
            }
            setDatosFormulario({
                ...datosFormulario,
                [name]: formatted
            });
            return;
        }
        
        if (name === 'cvv') {
            const onlyNumbers = value.replace(/\D/g, '').slice(0, 4);
            setDatosFormulario({
                ...datosFormulario,
                [name]: onlyNumbers
            });
            return;
        }

        setDatosFormulario({
            ...datosFormulario,
            [name]: value
        });
    };

    return (
        <Container className="compra-container my-4">
            <h2 className="text-center mb-4">Finalizar Compra</h2>
            {mostrarAlertaCompraExitosa && (
                <Alert variant="success" className="mb-4">
                    <Alert.Heading>✅ ¡Compra exitosa!</Alert.Heading>
                    <p className="mb-0">Tu compra ha sido realizada con éxito. ¡Gracias por preferirnos!</p>
                    <hr />
                    <p className="mb-0 small">Serás redirigido al inicio en unos segundos...</p>
                </Alert>
            )}
            
            {mostrarAlertaCompraAnulada && (
                <Alert variant="danger" dismissible onClose={() => setMostrarAlertaCompraAnulada(false)} className="mb-4">
                    <Alert.Heading>❌ Error en el pago</Alert.Heading>
                    <p className="mb-0">No se ha podido concretar la compra. Verifica los datos de pago e inténtalo nuevamente.</p>
                </Alert>
            )}
            <div className="row">
                {/* Formulario de compra */}
                <div className="col-md-7">
                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">Información del cliente</h5>
                            <Form onSubmit={manejarEnvio}>
                                <Form.Group className="mb-3" controlId="nombre">
                                    <Form.Label>Nombre completo</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="nombre"
                                        placeholder="Juan Pérez" 
                                        value={datosFormulario.nombre}
                                        onChange={manejarCambio}
                                        disabled={!!usuarioActual}
                                        required 
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="correo">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        name="correo"
                                        placeholder="tu@email.com"
                                        value={datosFormulario.correo}
                                        onChange={manejarCambio}
                                        disabled={!!usuarioActual}
                                        required
                                    />
                                </Form.Group>

                                <h5 className="mb-3 mt-4">Dirección de envío</h5>
                                
                                <Form.Group className="mb-3" controlId="calle">
                                    <Form.Label>Calle y número</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="calle"
                                        placeholder="Los Crisantemos 1234, Edificio Norte" 
                                        value={datosFormulario.calle}
                                        onChange={manejarCambio}
                                        required 
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="depto">
                                    <Form.Label>Departamento/Casa (opcional)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="depto"
                                        placeholder="Depto 603"
                                        value={datosFormulario.depto}
                                        onChange={manejarCambio}
                                    />
                                </Form.Group>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="region">
                                            <Form.Label>Región</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="region"
                                                placeholder="Región Metropolitana" 
                                                value={datosFormulario.region}
                                                onChange={manejarCambio}
                                                required 
                                            />
                                        </Form.Group>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="comuna">
                                            <Form.Label>Comuna</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="comuna"
                                                placeholder="Peñalolén" 
                                                value={datosFormulario.comuna}
                                                onChange={manejarCambio}
                                                required 
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                                
                                <Form.Group className="mb-3" controlId="mensaje">
                                    <Form.Label>Indicaciones para la entrega (opcional)</Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={2}
                                        name="mensaje"
                                        placeholder="Ej: Tocar el timbre 2 veces"
                                        value={datosFormulario.mensaje}
                                        onChange={manejarCambio}
                                    />
                                </Form.Group>

                                <h5 className="mb-3 mt-4">Datos de pago</h5>
                                
                                <Form.Group className="mb-3" controlId="numeroTarjeta">
                                    <Form.Label>Número de tarjeta</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="numeroTarjeta"
                                        placeholder="1234 5678 9012 3456"
                                        value={datosFormulario.numeroTarjeta}
                                        onChange={manejarCambio}
                                        maxLength="19"
                                        required 
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="nombreTarjeta">
                                    <Form.Label>Nombre en la tarjeta</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="nombreTarjeta"
                                        placeholder="JUAN PEREZ"
                                        value={datosFormulario.nombreTarjeta}
                                        onChange={manejarCambio}
                                        required 
                                    />
                                </Form.Group>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="fechaVencimiento">
                                            <Form.Label>Fecha de vencimiento</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="fechaVencimiento"
                                                placeholder="MM/AA"
                                                value={datosFormulario.fechaVencimiento}
                                                onChange={manejarCambio}
                                                maxLength="5"
                                                required 
                                            />
                                        </Form.Group>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="cvv">
                                            <Form.Label>CVV</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="cvv"
                                                placeholder="123"
                                                value={datosFormulario.cvv}
                                                onChange={manejarCambio}
                                                maxLength="4"
                                                required 
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <Button 
                                    variant="success" 
                                    type="submit" 
                                    className="w-100 mt-3"
                                    disabled={cargando || mostrarAlertaCompraExitosa}
                                >
                                    {cargando ? 'Procesando...' : 'Realizar Compra'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Resumen de compra */}
                <div className="col-md-5">
                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">Resumen de compra</h5>
                            
                            <ListGroup variant="flush" className="mb-3">
                                {carritoParaCalcular.map(item => (
                                    <ListGroup.Item key={item.id} className="px-0">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <strong>{item.title}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Cantidad: {item.qty || 1} × ${item.price.toLocaleString('es-CL')}
                                                </small>
                                            </div>
                                            <span className="fw-bold">
                                                ${(item.price * (item.qty || 1)).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <hr />
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                            </div>

                            {detallesDescuento.length > 0 && (
                                <>
                                    <div className="mb-2">
                                        <strong className="text-success">Descuentos:</strong>
                                        {detallesDescuento.map((desc, idx) => (
                                            <div key={idx} className="d-flex justify-content-between align-items-center">
                                                <span className="text-success">
                                                    <Badge bg="success" className="me-2">{desc.valor}%</Badge>
                                                    {desc.etiqueta}
                                                </span>
                                                <span className="text-success">
                                                    -${(subtotal * (desc.valor / 100)).toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {descuentosUsuario?.duocStudent && (
                                <Alert variant="info" className="mt-2 mb-2 py-2">
                                    <small>🎂 <strong>Beneficio activo:</strong> Torta gratis en tu cumpleaños</small>
                                </Alert>
                            )}

                            <hr />
                            
                            <div className="d-flex justify-content-between">
                                <h4>Total:</h4>
                                <h4 className="text-success">${total.toLocaleString('es-CL')}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}
