import React from 'react'
import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import About from './About'

export default function Home(){
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <section className="section section--story container my-4">
        <About />
      </section>
    </div>
  )
}
