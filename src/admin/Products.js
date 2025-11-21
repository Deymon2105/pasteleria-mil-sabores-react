import React, { useState, useEffect } from 'react'
import { productService } from '../service/api'

export default function Products(){
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
