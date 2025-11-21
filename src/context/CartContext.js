import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'

const CartContext = createContext()

export function CartProvider({ children }){
  // Carrito recuperado de sessionStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = sessionStorage.getItem('cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error al recuperar carrito:', error)
      return []
    }
  })

  // Guardar carrito en sessionStorage cuando cambia
  useEffect(() => {
    try {
      sessionStorage.setItem('cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error al guardar carrito:', error)
    }
  }, [cart])

  // Limpiar carrito cuando cambia la sesión del usuario
  useEffect(() => {
    const handleUserSessionChange = () => {
      setCart([])
      sessionStorage.removeItem('cart')
    }

    const handleUnauthorized = () => {
      setCart([])
      sessionStorage.removeItem('cart')
    }

    window.addEventListener('userSessionChange', handleUserSessionChange)
    window.addEventListener('unauthorized', handleUnauthorized)
    
    return () => {
      window.removeEventListener('userSessionChange', handleUserSessionChange)
      window.removeEventListener('unauthorized', handleUnauthorized)
    }
  }, [])


  const addToCart = useCallback((product) => {
    setCart(prev => {
      const found = prev.find(p=>p.id===product.id)
      if(found) return prev.map(p=>p.id===product.id?{...p, qty: p.qty+1}:p)
      return [...prev, {...product, qty:1}]
    })
  }, [])


  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(p=>p.id!==id)), [])
  const clearCart = useCallback(() => setCart([]), [])


  const totalCount = useMemo(() => cart.reduce((s,p)=>s+(p.qty||1),0), [cart])

  const value = useMemo(() => ({
    cart, addToCart, removeFromCart, clearCart, totalCount
  }), [cart, addToCart, removeFromCart, clearCart, totalCount])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}


export function useCart(){
  return useContext(CartContext)
}
