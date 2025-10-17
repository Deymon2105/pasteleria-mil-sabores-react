import React, { createContext, useState, useContext, useEffect } from 'react'


const CartContext = createContext()


export function CartProvider({ children }){
  // Función para obtener la clave del carrito del usuario actual
  const getCartKey = () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return `cart_${user.id || user.email}`; // Usar ID o email como identificador único
      }
      return 'cart_guest'; // Carrito para usuarios no autenticados
    } catch {
      return 'cart_guest';
    }
  };

  const [cart, setCart] = useState(() => {
    try{
      const cartKey = getCartKey();
      const raw = localStorage.getItem(cartKey);
      return raw ? JSON.parse(raw) : []
    }catch{ return [] }
  })

  // Actualizar carrito cuando cambia la sesión del usuario
  useEffect(() => {
    const handleUserSessionChange = () => {
      try {
        const cartKey = getCartKey();
        const raw = localStorage.getItem(cartKey);
        setCart(raw ? JSON.parse(raw) : []);
      } catch {
        setCart([]);
      }
    };

    window.addEventListener('userSessionChange', handleUserSessionChange);
    return () => window.removeEventListener('userSessionChange', handleUserSessionChange);
  }, []);

  useEffect(()=>{
    try{ 
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }catch{}
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
