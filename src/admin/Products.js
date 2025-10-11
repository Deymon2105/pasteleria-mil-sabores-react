import React from 'react'
import products from '../data/products'

export default function Products(){
  return (
    <div>
      <h1 className="page__title">Productos</h1>
      <section className="card">
        <h2 className="card__title">Listado</h2>
        <div id="admin-products" className="product-grid">
          {products.map(p=> (
            <article className="product-card card" key={p.id}>
              <div className="product-card__img">🍰</div>
              <h3 className="product-card__name">{p.title}</h3>
              <div className="product-card__price">{(p.price).toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</div>
              <button className="btn">Editar</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
