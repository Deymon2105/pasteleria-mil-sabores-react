import React from 'react'
import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'

export default function Home(){
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <section className="section section--story container my-4">
        <h2>Nuestra historia</h2>
        <p>De tradición familiar a referente nacional. Apoyamos a estudiantes de gastronomía y la comunidad.</p>
      </section>
    </div>
  )
}
