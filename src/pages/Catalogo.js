import React from 'react'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Catalogo(){
  return (
    <div className="container my-4">
      <h2>Catálogo</h2>
      <div className="d-flex flex-wrap">
        {products.map(p=> <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
