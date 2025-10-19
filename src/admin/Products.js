import React, { useState, useEffect } from 'react'
import productsData from '../data/products'

export default function Products(){
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const stored = localStorage.getItem('products')
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(productsData)
        localStorage.setItem('products', JSON.stringify(productsData))
      }
    } else {
      setProducts(productsData)
      localStorage.setItem('products', JSON.stringify(productsData))
    }
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products))
    }
  }, [products])

  const handleEdit = (product) => {
    setEditingId(product.id)
    setEditForm(product)
  }

  const handleSave = () => {
    setProducts(prev => prev.map(p => 
      p.id === editingId ? { ...editForm, price: Number(editForm.price) } : p
    ))
    setEditingId(null)
    setEditForm({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  const handleToggleFeatured = (productId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, featured: !p.featured } : p
    ))
  }

  const categories = [...new Set(products.map(p => p.category))]
  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter)

  return (
    <div>
      <h1 className="page__title">Productos</h1>
      
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
