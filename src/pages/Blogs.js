import React from 'react'
import {Container, Card} from 'react-bootstrap'

export default function Blogs(){
  return (
    <Container className="blog-container">
      <h1>Blogs y Comunidad</h1>
      <Card className="blog-card">
        <Card.Title className="blog-title">Receta clásica: Torta de manjar</Card.Title>
        <Card.Text className="blog-meta">Por estudiantes de gastronomia DUOC</Card.Text>
        <Card.Text className="blog-content">Consejos, recetas y la historia de nuestras preparaciones.</Card.Text>
      </Card>
      <Card className="blog-card">
        <Card.Title className="blog-title">Logros de Pastelería Mil Sabores</Card.Title>
        <Card.Text className="blog-meta">Record Guinness 1995</Card.Text>
        <Card.Text className="blog-content">Creación de la torta más grande del mundo.</Card.Text>
      </Card>
    </Container>
  )
}
