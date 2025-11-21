import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, ListGroup } from "react-bootstrap";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, savedAddressService } from '../service/api';
import { sendOrderConfirmationEmail } from '../service/emailService';
import { useNavigate, Link } from 'react-router-dom';

export default function Compra() {
    const { cart, clearCart } = useCart();
    const { currentUser, isLoggedIn } = useAuth();
    const navegar = useNavigate();
    
    const [mostrarAlertaCompraAnulada, setMostrarAlertaCompraAnulada] = useState(false);
    const [datosFormulario, setDatosFormulario] = useState({
        nombre: '', 
        correo: '', 
        telefono: '',
        calle: '', 
        depto: '', 
        codigoPostal: '',
        region: '', 
        comuna: '', 
        mensaje: '',
        numeroTarjeta: '',
        nombreTarjeta: '',
        fechaVencimiento: '',
        cvv: ''
    });
    const [userBenefits, setUserBenefits] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [carritoInicial, setCarritoInicial] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [labelDireccion, setLabelDireccion] = useState('');

    // Cargar direcciones guardadas si el usuario está autenticado
    useEffect(() => {
        const loadSavedAddresses = async () => {
            if (isLoggedIn() && currentUser) {
                try {
                    const { data } = await savedAddressService.getAll();
                    setSavedAddresses(data || []);
                    
                    // Si hay una dirección por defecto, seleccionarla
                    const defaultAddress = data?.find(addr => addr.is_default);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                        cargarDireccion(defaultAddress);
                    }
                } catch (error) {
                    console.error('Error al cargar direcciones:', error);
                }
            }
        };
        loadSavedAddresses();
    }, [currentUser, isLoggedIn]);

    // Función para cargar datos de una dirección al formulario
    const cargarDireccion = (address) => {
        setDatosFormulario(prev => ({
            ...prev,
            nombre: address.nombre,
            correo: address.correo,
            telefono: address.telefono || '',
            calle: address.calle,
            depto: address.depto || '',
            codigoPostal: address.codigo_postal || '',
            region: address.region,
            comuna: address.comuna
        }));
    };

    // Manejar cambio de dirección seleccionada
    const manejarCambioDireccion = (e) => {
        const addressId = e.target.value;
        setSelectedAddressId(addressId);
        
        if (addressId === 'nueva') {
            // Limpiar formulario para nueva dirección
            setDatosFormulario(prev => ({
                ...prev,
                calle: '',
                depto: '',
                codigoPostal: '',
                region: '',
                comuna: ''
            }));
        } else if (addressId) {
            // Cargar dirección seleccionada
            const address = savedAddresses.find(addr => addr.id === addressId);
            if (address) {
                cargarDireccion(address);
            }
        }
    };

    // Cargar datos del usuario autenticado
    useEffect(() => {
        if (isLoggedIn() && currentUser) {
            setDatosFormulario(prev => ({
                ...prev,
                nombre: currentUser.name || '',
                correo: currentUser.email || '',
                telefono: currentUser.phone || ''
            }));
            
            // Asegurarse de que benefits sea siempre un array
            const benefits = currentUser.benefits;
            if (typeof benefits === 'string') {
                try {
                    const parsed = JSON.parse(benefits);
                    setUserBenefits(Array.isArray(parsed) ? parsed : []);
                } catch {
                    setUserBenefits([]);
                }
            } else if (Array.isArray(benefits)) {
                setUserBenefits(benefits);
            } else {
                setUserBenefits([]);
            }
        } else {
            setUserBenefits([]);
        }
    }, [currentUser, isLoggedIn]);

    // Guardar carrito inicial
    useEffect(() => {
        if (carritoInicial.length === 0 && cart.length > 0) {
            setCarritoInicial([...cart]);
        }
        if (cart.length === 0 && carritoInicial.length === 0) {
            navegar('/cart');
        }
    }, [cart, navegar, carritoInicial.length]);

    const carritoParaCalcular = cart.length > 0 ? cart : carritoInicial;
    const subtotal = carritoParaCalcular.reduce((s, p) => s + (p.price * (p.qty || 1)), 0);

    // Calcular descuentos
    let descuentoTotal = 0;
    let detallesDescuento = [];
    
    if (userBenefits.includes('>50')) {
        descuentoTotal += 50;
        detallesDescuento.push({ etiqueta: 'Descuento mayores de 50 años', valor: 50 });
    }
    
    if (userBenefits.includes('FELICES50')) {
        descuentoTotal += 10;
        detallesDescuento.push({ etiqueta: 'Código FELICES50', valor: 10 });
    }
    
    const hasDuocBenefit = userBenefits.includes('DUOC');
    const montoDescuento = subtotal * (descuentoTotal / 100);
    const total = subtotal - montoDescuento;

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        
        // Validar campos de dirección
        if (!datosFormulario.nombre || !datosFormulario.correo || 
            !datosFormulario.calle || !datosFormulario.region || !datosFormulario.comuna) {
            alert('Por favor completa todos los campos de envío obligatorios');
            setCargando(false);
            return;
        }
        
        // Validar campos de pago
        if (!datosFormulario.numeroTarjeta || !datosFormulario.nombreTarjeta || 
            !datosFormulario.fechaVencimiento || !datosFormulario.cvv) {
            setMostrarAlertaCompraAnulada(true);
            setCargando(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // Validar formato de número de tarjeta
        const numeroLimpio = datosFormulario.numeroTarjeta.replace(/\s/g, '').replace(/\*/g, '');
        if (numeroLimpio.length !== 16) {
            alert('El número de tarjeta debe tener 16 dígitos');
            setCargando(false);
            return;
        }
        
        // Validar formato de fecha de vencimiento
        if (!/^\d{2}\/\d{2}$/.test(datosFormulario.fechaVencimiento)) {
            alert('La fecha de vencimiento debe tener formato MM/AA');
            setCargando(false);
            return;
        }
        
        // Validar que la tarjeta no esté vencida
        const [mes, anio] = datosFormulario.fechaVencimiento.split('/');
        const fechaVencimiento = new Date(2000 + parseInt(anio), parseInt(mes) - 1);
        const fechaActual = new Date();
        if (fechaVencimiento < fechaActual) {
            alert('La tarjeta está vencida');
            setCargando(false);
            return;
        }
        
        // Validar CVV
        if (datosFormulario.cvv.length !== 3) {
            alert('El CVV debe tener 3 dígitos');
            setCargando(false);
            return;
        }
        
        // Preparar información de envío
        const shippingAddress = {
            nombre: datosFormulario.nombre,
            correo: datosFormulario.correo,
            calle: datosFormulario.calle,
            depto: datosFormulario.depto,
            codigo_postal: datosFormulario.codigoPostal,
            telefono: datosFormulario.telefono,
            region: datosFormulario.region,
            comuna: datosFormulario.comuna,
            indicaciones: datosFormulario.mensaje
        };

        // Preparar información de pago (sin datos sensibles)
        const paymentInfo = {
            method: 'credit_card',
            lastFourDigits: numeroLimpio.slice(-4),
            cardHolderName: datosFormulario.nombreTarjeta
        };

        // Validar que haya items en el carrito
        const itemsToOrder = carritoParaCalcular.length > 0 ? carritoParaCalcular : cart;
        
        if (!itemsToOrder || itemsToOrder.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de continuar.');
            setCargando(false);
            return;
        }

        // Crear objeto de pedido
        const orderData = {
            code: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
            total: total,
            subtotal: subtotal,
            shipping_cost: 0,
            discount: montoDescuento,
            shippingAddress: shippingAddress,
            paymentInfo: paymentInfo,
            notes: datosFormulario.mensaje || '',
            items: itemsToOrder.map(item => ({
                productId: item.id,
                quantity: item.qty || 1,
                price: item.price
            }))
        };

        try {
            // Enviar al backend (Supabase)
            const orderResponse = await orderService.create(orderData);
            const createdOrder = orderResponse.data;
            
            // Guardar dirección si el usuario lo solicitó y está autenticado
            if (guardarDireccion && isLoggedIn() && labelDireccion.trim()) {
                try {
                    await savedAddressService.create({
                        label: labelDireccion,
                        nombre: datosFormulario.nombre,
                        correo: datosFormulario.correo,
                        telefono: datosFormulario.telefono,
                        calle: datosFormulario.calle,
                        depto: datosFormulario.depto,
                        codigoPostal: datosFormulario.codigoPostal,
                        region: datosFormulario.region,
                        comuna: datosFormulario.comuna,
                        isDefault: savedAddresses.length === 0 // Primera dirección es por defecto
                    });
                    console.log('Dirección guardada exitosamente');
                } catch (addrError) {
                    console.error('Error al guardar dirección (no crítico):', addrError);
                }
            }
            
            // Preparar datos completos de la orden para el email
            const orderForEmail = {
                ...createdOrder,
                code: orderData.code,
                total: total,
                discount: montoDescuento,
                subtotal: subtotal,
                shippingAddress: shippingAddress,
                paymentInfo: paymentInfo,
                items: itemsToOrder.map(item => ({
                    title: item.title,
                    name: item.title,
                    quantity: item.qty || 1,
                    price: item.price
                })),
                created_at: new Date().toISOString()
            };
            
            // Enviar email de confirmación (no bloquea la compra si falla)
            try {
                const emailSent = await sendOrderConfirmationEmail(orderForEmail);
                if (emailSent) {
                    console.log('Email de confirmación enviado exitosamente');
                }
            } catch (emailError) {
                console.error('Error al enviar email (no crítico):', emailError);
            }

            // Preparar datos para la página de confirmación
            const confirmationData = {
                ...orderForEmail,
                guest_email: shippingAddress.correo,
                guest_name: shippingAddress.nombre
            };

            // Limpiar estado antes de redirigir
            clearCart();
            setCargando(false);

            // Resetear formulario
            setDatosFormulario({
                nombre: currentUser?.name || '',
                correo: currentUser?.email || '',
                telefono: currentUser?.phone || '',
                calle: '',
                depto: '',
                codigoPostal: '',
                region: '',
                comuna: '',
                mensaje: '',
                numeroTarjeta: '',
                nombreTarjeta: '',
                fechaVencimiento: '',
                cvv: ''
            });

            // Redirigir a la página de confirmación
            navegar('/order-confirmation', {
                state: { orderData: confirmationData }
            });

        } catch (error) {
            console.error('Error al procesar compra:', error);
            const errorMessage = error.message || 'Error desconocido al procesar la compra';
            
            // Detectar error de stock insuficiente
            if (errorMessage.includes('Stock insuficiente') || errorMessage.includes('Disponible:')) {
                alert(`❌ ${errorMessage}\n\nPor favor ajusta las cantidades en tu carrito.`);
            } else {
                alert(`Error: ${errorMessage}\n\nRevisa la consola para más detalles.`);
            }

            setMostrarAlertaCompraAnulada(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setCargando(false);
        }
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;

        // Formatear número de tarjeta
        if (name === 'numeroTarjeta') {
            const onlyNumbers = value.replace(/\D/g, '');
            const formatted = onlyNumbers.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
            setDatosFormulario({ ...datosFormulario, [name]: formatted });
            return;
        }

        if (name === 'fechaVencimiento') {
            const cleaned = value.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 2) {
                formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
            }
            setDatosFormulario({ ...datosFormulario, [name]: formatted });
            return;
        }

        if (name === 'cvv') {
            const onlyNumbers = value.replace(/\D/g, '').slice(0, 3);
            setDatosFormulario({ ...datosFormulario, [name]: onlyNumbers });
            return;
        }

        setDatosFormulario({ ...datosFormulario, [name]: value });
    };

    return (
        <Container className="compra-container my-4">
            <h2 className="text-center mb-4">Finalizar Compra</h2>

            {!isLoggedIn() && (
                <Alert variant="info" className="mb-4">
                    <Alert.Heading>Compra sin registro</Alert.Heading>
                    <p className="mb-0">
                        Estás realizando una compra como invitado. Completa todos los datos requeridos para continuar.
                        {' '}<Link to="/login">Inicia sesión</Link> para acceder a beneficios exclusivos.
                    </p>
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre completo *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        placeholder="Ingresa tu nombre completo"
                                        value={datosFormulario.nombre}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="correo"
                                        placeholder="tu@email.com"
                                        value={datosFormulario.correo}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="telefono"
                                        placeholder="+56 9 1234 5678"
                                        value={datosFormulario.telefono}
                                        onChange={manejarCambio}
                                    />
                                </Form.Group>

                                <h5 className="mb-3 mt-4">Dirección de envío</h5>

                                {/* Selector de direcciones guardadas (solo para usuarios autenticados) */}
                                {isLoggedIn() && savedAddresses.length > 0 && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Seleccionar dirección guardada</Form.Label>
                                        <Form.Select
                                            value={selectedAddressId}
                                            onChange={manejarCambioDireccion}
                                        >
                                            <option value="nueva">➕ Nueva dirección</option>
                                            {savedAddresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.label} - {addr.calle}, {addr.comuna}
                                                    {addr.is_default ? ' (Predeterminada)' : ''}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Calle y número *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="calle"
                                        placeholder="Los Crisantemos 1234"
                                        value={datosFormulario.calle}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
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
                                        <Form.Group className="mb-3">
                                            <Form.Label>Región *</Form.Label>
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
                                        <Form.Group className="mb-3">
                                            <Form.Label>Comuna *</Form.Label>
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Código Postal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="codigoPostal"
                                        placeholder="7500000"
                                        value={datosFormulario.codigoPostal}
                                        onChange={manejarCambio}
                                    />
                                </Form.Group>

                                {/* Opción para guardar dirección (solo usuarios autenticados y dirección nueva) */}
                                {isLoggedIn() && selectedAddressId === 'nueva' && (
                                    <div className="mb-3 p-3 bg-light rounded">
                                        <Form.Check
                                            type="checkbox"
                                            id="guardar-direccion"
                                            label="💾 Guardar esta dirección para futuras compras"
                                            checked={guardarDireccion}
                                            onChange={(e) => setGuardarDireccion(e.target.checked)}
                                        />
                                        {guardarDireccion && (
                                            <Form.Group className="mt-2">
                                                <Form.Label>Nombre para esta dirección *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Ej: Casa, Trabajo, Oficina"
                                                    value={labelDireccion}
                                                    onChange={(e) => setLabelDireccion(e.target.value)}
                                                    required={guardarDireccion}
                                                />
                                                <Form.Text className="text-muted">
                                                    Dale un nombre para identificar fácilmente esta dirección
                                                </Form.Text>
                                            </Form.Group>
                                        )}
                                    </div>
                                )}

                                <Form.Group className="mb-3">
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Número de tarjeta *</Form.Label>
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre en la tarjeta *</Form.Label>
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
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fecha de vencimiento *</Form.Label>
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
                                        <Form.Group className="mb-3">
                                            <Form.Label>CVV *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cvv"
                                                placeholder="123"
                                                value={datosFormulario.cvv}
                                                onChange={manejarCambio}
                                                maxLength="3"
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <Alert variant="secondary" className="mt-3 mb-4">
                                    <small>🔒 Transacción segura. No almacenamos información completa de tarjetas.</small>
                                </Alert>

                                <Button type="submit" variant="success" className="w-100 py-3" disabled={cargando}>
                                    {cargando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Procesando compra...
                                        </>
                                    ) : (
                                        <>
                                            🛒 Confirmar y Pagar ${total.toLocaleString('es-CL')}
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Resumen del pedido */}
                <div className="col-md-5">
                    <Card className="mb-4 sticky-top" style={{ top: '20px' }}>
                        <Card.Body>
                            <h5 className="mb-3">Resumen del pedido</h5>
                            <ListGroup variant="flush">
                                {carritoParaCalcular.map(p => (
                                    <ListGroup.Item key={p.id} className="px-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{p.title}</strong>
                                                <div className="text-muted small">Cantidad: {p.qty || 1}</div>
                                            </div>
                                            <span>${(p.price * (p.qty || 1)).toLocaleString('es-CL')}</span>
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
                                    {detallesDescuento.map((desc, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-2 text-success">
                                            <span>{desc.etiqueta} (-{desc.valor}%):</span>
                                            <span>-${(subtotal * (desc.valor / 100)).toLocaleString('es-CL')}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {hasDuocBenefit && (
                                <Alert variant="info" className="mt-3 mb-2 py-2 small">
                                    🎂 Beneficio DUOC: Torta gratis en tu cumpleaños
                                </Alert>
                            )}

                            <hr />

                            <div className="d-flex justify-content-between mb-3">
                                <strong className="fs-5">Total:</strong>
                                <strong className="fs-5 text-success">${total.toLocaleString('es-CL')}</strong>
                            </div>

                            <div className="text-muted small">
                                <p className="mb-1">✓ Envío gratis</p>
                                <p className="mb-0">✓ Satisfacción garantizada</p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}
