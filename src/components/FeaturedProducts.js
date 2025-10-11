import React from 'react'
import products from '../data/products'
import ProductCard from './ProductCard'

export default function FeaturedProducts(){
  const featured = products.filter(p=>p.featured)
  return (
    <section className="section section--featured container my-4">
      <h2 className="section__title">Destacados</h2>
      <div className="d-flex flex-wrap">
        {featured.map(p=> <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
