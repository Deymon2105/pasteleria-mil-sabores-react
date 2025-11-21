import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { savedAddressService } from '../service/api';
import { useNavigate } from 'react-router-dom';

export default function MyAddresses() {
    const { currentUser, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        label: '',
        nombre: '',
        correo: '',
        telefono: '',
        calle: '',
        depto: '',
        codigoPostal: '',
        region: '',
        comuna: '',
        isDefault: false
    });

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        loadAddresses();
    }, [isLoggedIn, navigate]);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const { data } = await savedAddressService.getAll();
            setAddresses(data || []);
            setError('');
        } catch (err) {
            setError('Error al cargar direcciones: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                label: address.label,
                nombre: address.nombre,
                correo: address.correo,
                telefono: address.telefono || '',
                calle: address.calle,
                depto: address.depto || '',
                codigoPostal: address.codigo_postal || '',
                region: address.region,
                comuna: address.comuna,
                isDefault: address.is_default
            });
        } else {
            setEditingAddress(null);
            setFormData({
                label: '',
                nombre: currentUser?.name || '',
                correo: currentUser?.email || '',
                telefono: currentUser?.phone || '',
                calle: '',
                depto: '',
                codigoPostal: '',
                region: '',
                comuna: '',
                isDefault: addresses.length === 0
            });
        }
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAddress(null);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingAddress) {
                await savedAddressService.update(editingAddress.id, formData);
                setSuccess('✅ Dirección actualizada correctamente');
            } else {
                await savedAddressService.create(formData);
                setSuccess('✅ Dirección guardada correctamente');
            }
            await loadAddresses();
            setTimeout(() => {
                handleCloseModal();
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError('Error: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) {
            return;
        }

        try {
            await savedAddressService.delete(id);
            setSuccess('✅ Dirección eliminada');
            await loadAddresses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al eliminar: ' + err.message);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await savedAddressService.setAsDefault(id);
            setSuccess('✅ Dirección establecida como predeterminada');
            await loadAddresses();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error: ' + err.message);
        }
    };

    if (loading) {
        return (
            <Container className="my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>📍 Mis Direcciones</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    ➕ Nueva Dirección
                </Button>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            {addresses.length === 0 ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <h4>No tienes direcciones guardadas</h4>
                        <p className="text-muted">Agrega una dirección para agilizar tus futuras compras</p>
                        <Button variant="primary" onClick={() => handleOpenModal()}>
                            Agregar primera dirección
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <div className="row">
                    {addresses.map(address => (
                        <div key={address.id} className="col-md-6 mb-3">
                            <Card className={address.is_default ? 'border-primary' : ''}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="mb-0">
                                            {address.label}
                                            {address.is_default && (
                                                <Badge bg="primary" className="ms-2">Predeterminada</Badge>
                                            )}
                                        </h5>
                                    </div>
                                    
                                    <p className="mb-1"><strong>{address.nombre}</strong></p>
                                    <p className="mb-1 text-muted">{address.correo}</p>
                                    {address.telefono && <p className="mb-1 text-muted">📞 {address.telefono}</p>}
                                    
                                    <hr />
                                    
                                    <p className="mb-1">{address.calle}</p>
                                    {address.depto && <p className="mb-1">{address.depto}</p>}
                                    <p className="mb-1">{address.comuna}, {address.region}</p>
                                    {address.codigo_postal && <p className="mb-0 text-muted">CP: {address.codigo_postal}</p>}
                                    
                                    <div className="mt-3 d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleOpenModal(address)}
                                        >
                                            ✏️ Editar
                                        </Button>
                                        {!address.is_default && (
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                ⭐ Predeterminada
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(address.id)}
                                        >
                                            🗑️ Eliminar
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para crear/editar dirección */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingAddress ? '✏️ Editar Dirección' : '➕ Nueva Dirección'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre para esta dirección *</Form.Label>
                            <Form.Control
                                type="text"
                                name="label"
                                placeholder="Ej: Casa, Trabajo, Oficina"
                                value={formData.label}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre completo *</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="telefono"
                                        placeholder="+56 9 1234 5678"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Calle y número *</Form.Label>
                            <Form.Control
                                type="text"
                                name="calle"
                                placeholder="Los Crisantemos 1234"
                                value={formData.calle}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Departamento/Casa</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="depto"
                                        placeholder="Depto 603"
                                        value={formData.depto}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Código Postal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="codigoPostal"
                                        placeholder="7500000"
                                        value={formData.codigoPostal}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Región *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="region"
                                        placeholder="Región Metropolitana"
                                        value={formData.region}
                                        onChange={handleChange}
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
                                        value={formData.comuna}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isDefault"
                                label="⭐ Establecer como dirección predeterminada"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingAddress ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}
