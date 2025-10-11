import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Hero(){
  return (
    <div className="hero bg-light py-5">
      <Container className="text-center">
        <h1 className="hero__title">Celebra la dulzura de la vida</h1>
        <p className="hero__subtitle">Descuentos exclusivos por nuestro 50° aniversario.</p>
        <Button as={Link} to="/catalogo" variant="primary">Ver Catálogo</Button>
      </Container>
    </div>
  )
}
