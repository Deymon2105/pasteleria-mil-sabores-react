import React, { createContext, useState, useContext, useEffect } from 'react'


const CartContext = createContext()


export function CartProvider({ children }){
  const [cart, setCart] = useState(() => {
    try{
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    }catch{ return [] }
  })


  useEffect(()=>{
    try{ localStorage.setItem('cart', JSON.stringify(cart)) }catch{}
  },[cart])


  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(p=>p.id===product.id)
      if(found) return prev.map(p=>p.id===product.id?{...p, qty: p.qty+1}:p)
      return [...prev, {...product, qty:1}]
    })
  }


  const removeFromCart = (id) => setCart(prev => prev.filter(p=>p.id!==id))
  const clearCart = () => setCart([])


  const totalCount = cart.reduce((s,p)=>s+(p.qty||1),0)


  return (
    <CartContext.Provider value={{cart, addToCart, removeFromCart, clearCart, totalCount}}>
      {children}
    </CartContext.Provider>
  )
}


export function useCart(){
  return useContext(CartContext)
}
