import { useState, useEffect, useCallback } from 'react'
import { orders as seedOrders, users as seedUsers } from '../data/adminData'

export default function useAdminData(){
  const [orders, setOrders] = useState(()=>{
    try{ 
      const ls = localStorage.getItem('orders');
      return ls ? JSON.parse(ls) : seedOrders;
    }catch{return seedOrders}
  })
  
  // eslint-disable-next-line no-unused-vars
  const [users, setUsers] = useState(()=>{
    try{ 
      const ls = localStorage.getItem('users');
      return ls ? JSON.parse(ls) : seedUsers;
    }catch{return seedUsers}
  })


  useEffect(()=>{ try{ localStorage.setItem('orders', JSON.stringify(orders)); }catch{} }, [orders])
  useEffect(()=>{ try{ localStorage.setItem('users', JSON.stringify(users)); }catch{} }, [users])


  const updateOrderStatus = useCallback((code, status) => {
    setOrders(prev => prev.map(o => o.code===code ? {...o, status} : o))
  }, [])


  return { orders, users, updateOrderStatus }
}
