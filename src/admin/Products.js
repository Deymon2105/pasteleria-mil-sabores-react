import React, { useState, useEffect } from 'react'
import { productService, uploadService } from '../service/api'

export default function Products(){
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Tortas',
    description: '',
    image: '',
    stock: 10,
    featured: false
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productService.getAll()
      setProducts(response.data)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('❌ Por favor selecciona un archivo de imagen')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen no debe superar los 5MB')
        return
      }
      
      setImageFile(file)
      
      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setEditForm(product)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const updatedProduct = { ...editForm, price: Number(editForm.price) }
      await productService.update(editingId, updatedProduct)
      await loadProducts() // Recargar la lista actualizada
      setEditingId(null)
      setEditForm({})
      alert('Producto actualizado exitosamente')
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      alert('Error al actualizar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        setLoading(true)
        await productService.delete(productId)
        await loadProducts() // Recargar la lista actualizada
        alert('Producto eliminado exitosamente')
      } catch (err) {
        console.error('Error al eliminar producto:', err)
        alert('Error al eliminar el producto')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleFeatured = async (productId) => {
    try {
      const product = products.find(p => p.id === productId)
      if (product) {
        const updatedProduct = { ...product, featured: !product.featured }
        await productService.update(productId, updatedProduct)
        await loadProducts() // Recargar la lista actualizada
      }
    } catch (err) {
      console.error('Error al actualizar destacado:', err)
      alert('Error al actualizar el producto')
    }
  }

  const handleCreateProduct = async () => {
    try {
      // Validar campos obligatorios
      if (!newProduct.title.trim()) {
        alert('El nombre del producto es obligatorio')
        return
      }
      
      // Validar que haya imagen (archivo o URL)
      if (!imageFile && !newProduct.image.trim()) {
        alert('Debes subir una imagen o proporcionar una URL')
        return
      }
      
      if (!newProduct.price || Number(newProduct.price) <= 0) {
        alert('El precio debe ser mayor a 0')
        return
      }

      setLoading(true)
      setUploadProgress(10)
      
      // Subir imagen a Supabase Storage si hay archivo seleccionado
      let imageUrl = newProduct.image
      if (imageFile) {
        console.log('📤 Subiendo imagen a Supabase Storage...')
        setUploadProgress(30)
        imageUrl = await uploadService.uploadImage(imageFile)
        setUploadProgress(60)
        console.log('✅ Imagen subida:', imageUrl)
      }
      
      // Preparar datos del producto (usar solo los campos que acepta Supabase)
      const productData = {
        name: newProduct.title,
        price: Number(newProduct.price),
        category: newProduct.category,
        description: newProduct.description || `Delicioso ${newProduct.title}`,
        image: imageUrl,
        stock: Number(newProduct.stock) || 10,
        featured: newProduct.featured || false
      }

      setUploadProgress(80)
      console.log('🔵 Creando producto:', productData)
      await productService.create(productData)
      setUploadProgress(100)
      
      // Recargar productos y resetear formulario
      await loadProducts()
      setShowCreateForm(false)
      setNewProduct({
        title: '',
        price: '',
        category: 'Tortas',
        description: '',
        image: '',
        stock: 10,
        featured: false
      })
      setImageFile(null)
      setImagePreview(null)
      setUploadProgress(0)
      
      alert('✅ Producto creado exitosamente')
    } catch (err) {
      console.error('Error al crear producto:', err)
      alert(`❌ Error al crear producto: ${err.message}`)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const categories = [...new Set(products.map(p => p.category))]
  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter)

  if (loading && products.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '50px'}}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{padding: '20px'}}>
        <div className="alert alert-danger">{error}</div>
        <button className="btn" onClick={loadProducts}>Reintentar</button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page__title">Productos</h1>
      {loading && (
        <div style={{position: 'fixed', top: '10px', right: '10px', background: '#007bff', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 9999}}>
          Guardando cambios...
        </div>
      )}
      
      {/* Botón para crear nuevo producto */}
      <div style={{marginBottom: '20px'}}>
        <button 
          className="btn" 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{background: '#28a745', color: 'white', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold'}}
        >
          {showCreateForm ? '❌ Cancelar' : '➕ Crear Nuevo Producto'}
        </button>
      </div>

      {/* Formulario de creación de producto */}
      {showCreateForm && (
        <div style={{marginBottom: '30px', padding: '20px', background: '#e7f3ff', border: '2px solid #007bff', borderRadius: '8px'}}>
          <h3 style={{marginBottom: '15px', color: '#007bff'}}>➕ Nuevo Producto</h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Nombre del producto *</label>
              <input 
                className="form__input"
                type="text"
                placeholder="Ej: Torta de Chocolate"
                value={newProduct.title}
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                style={{width: '100%'}}
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Categoría *</label>
              <select 
                className="form__input"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                style={{width: '100%'}}
              >
                <option value="Tortas">Tortas</option>
                <option value="Pasteles">Pasteles</option>
                <option value="Cupcakes">Cupcakes</option>
                <option value="Galletas">Galletas</option>
                <option value="Postres">Postres</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Precio (CLP) *</label>
              <input 
                className="form__input"
                type="number"
                placeholder="15000"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                style={{width: '100%'}}
                min="0"
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Stock inicial</label>
              <input 
                className="form__input"
                type="number"
                placeholder="10"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                style={{width: '100%'}}
                min="0"
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Imagen del producto *</label>
              
              {/* Input de archivo */}
              <div style={{marginBottom: '10px'}}>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{
                    display: 'block',
                    padding: '10px',
                    border: '2px dashed #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                />
                <small style={{color: '#666', display: 'block', marginTop: '5px'}}>
                  📁 Selecciona una imagen (máx 5MB) - JPG, PNG, WebP
                </small>
              </div>

              {/* Preview de la imagen */}
              {imagePreview && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  textAlign: 'center'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '5px',
                      objectFit: 'contain'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '5px 15px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}

              {/* Divider */}
              <div style={{
                margin: '15px 0',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}>- O -</div>

              {/* Input de URL (alternativa) */}
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>URL de imagen (opcional)</label>
                <input 
                  className="form__input"
                  type="text"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  style={{width: '100%'}}
                  disabled={!!imageFile}
                />
                <small style={{color: '#666'}}>Solo si no subes archivo</small>
              </div>
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Descripción</label>
              <textarea 
                className="form__input"
                placeholder="Descripción del producto (opcional)"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                style={{width: '100%', minHeight: '80px'}}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <input 
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                  style={{marginRight: '10px', width: '20px', height: '20px'}}
                />
                <span style={{fontWeight: 'bold'}}>⭐ Marcar como producto destacado</span>
              </label>
            </div>
          </div>

          <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button 
              className="btn" 
              onClick={handleCreateProduct}
              disabled={loading}
              style={{background: '#28a745', color: 'white', flex: 1, padding: '12px', fontSize: '16px', fontWeight: 'bold'}}
            >
              {loading ? (
                uploadProgress > 0 ? `⏳ Subiendo... ${uploadProgress}%` : '⏳ Procesando...'
              ) : '✅ Crear Producto'}
            </button>
            <button 
              className="btn" 
              onClick={() => setShowCreateForm(false)}
              disabled={loading}
              style={{background: '#6c757d', color: 'white', flex: 1, padding: '12px', fontSize: '16px'}}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      <div style={{marginBottom: '15px', padding:'15px', background:'#f8f9fa', borderRadius:'5px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <label style={{marginRight: '10px', fontWeight: 'bold'}}>Filtrar por categoría:</label>
            <select className="form__input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{width: '250px', display: 'inline-block'}}>
              <option value="all">Todas las categorías ({products.length} productos)</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} ({products.filter(p => p.category === cat).length})</option>
              ))}
            </select>
          </div>
          <div>
            <strong>Total productos: {filteredProducts.length}</strong>
            {' | '}
            <span>Destacados: {filteredProducts.filter(p => p.featured).length}</span>
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="card__title">Listado de Productos ({filteredProducts.length})</h2>
        <div id="admin-products" className="product-grid">
          {filteredProducts.map(p=> (
            <article className="product-card card" key={p.id}>
              {editingId === p.id ? (
                // Modo edición
                <div style={{padding: '15px', background:'#fff3cd', borderRadius:'5px'}}>
                  <h4 style={{marginBottom:'10px'}}>Editando producto</h4>
                  <div style={{marginBottom:'10px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Nombre:</label>
                    <input 
                      className="form__input" 
                      value={editForm.title} 
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Nombre del producto"
                      style={{width:'100%'}}
                    />
                  </div>
                  <div style={{marginBottom:'10px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Precio (CLP):</label>
                    <input 
                      className="form__input" 
                      type="number"
                      value={editForm.price} 
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      placeholder="Precio"
                      style={{width:'100%'}}
                    />
                  </div>
                  <div style={{marginBottom:'10px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Stock disponible:</label>
                    <input 
                      className="form__input" 
                      type="number"
                      min="0"
                      value={editForm.stock || 0} 
                      onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                      placeholder="Unidades disponibles"
                      style={{width:'100%'}}
                    />
                  </div>
                  <div style={{marginBottom:'10px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>URL Imagen:</label>
                    <input 
                      className="form__input" 
                      value={editForm.image} 
                      onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                      placeholder="/img/producto.jpg"
                      style={{width:'100%'}}
                    />
                  </div>
                  <div style={{marginTop: '15px', display:'flex', gap:'10px'}}>
                    <button className="btn" onClick={handleSave} style={{background:'#28a745', color:'white', flex:1}}>Guardar cambios</button>
                    <button className="btn" onClick={handleCancel} style={{background:'#6c757d', color:'white', flex:1}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <>
                  <div className="product-card__img">
                    {p.image ? (
                      <img src={p.image} alt={p.title} style={{width:'100%', height:'150px', objectFit:'cover'}} 
                        onError={(e) => {e.target.style.display = 'none'}} />
                    ) : <div style={{height:'150px', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center'}}>Sin imagen</div>}
                  </div>
                  <h3 className="product-card__name">{p.title}</h3>
                  <div className="product-card__price">{(p.price).toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div>
                  <small style={{display:'block', margin:'5px 0', color:'#666'}}>{p.category}</small>
                  <div style={{margin:'5px 0'}}>
                    <strong>Stock:</strong> <span style={{color: p.stock > 5 ? '#28a745' : p.stock > 0 ? '#ffc107' : '#dc3545'}}>{p.stock || 0} unidades</span>
                  </div>
                  {p.featured && <span style={{background:'#ffc107', padding:'2px 6px', borderRadius:'3px', fontSize:'0.8em'}}>DESTACADO</span>}
                  <div style={{marginTop: '10px'}}>
                    <button className="btn" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="btn" onClick={() => handleToggleFeatured(p.id)} style={{marginLeft: '5px'}}>
                      {p.featured ? 'No destacar' : 'Destacar'}
                    </button>
                    <button className="btn" onClick={() => handleDelete(p.id)} style={{marginLeft: '5px', background: '#dc3545', color:'white'}}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
