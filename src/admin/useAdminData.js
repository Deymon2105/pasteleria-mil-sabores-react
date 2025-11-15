import { useState, useEffect, useCallback } from 'react'
import { orderService, userService } from '../service/api'

export default function useAdminData(){
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos al montar
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [ordersResponse, usersResponse] = await Promise.all([
        orderService.getAll(),
        userService.getAll()
      ])
      
      setOrders(ordersResponse.data || [])
      setUsers(usersResponse.data || [])
    } catch (err) {
      console.error('Error al cargar datos admin:', err)
      setError('Error al cargar datos del panel de administración')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = useCallback(async (code, status) => {
    try {
      // Encontrar el pedido por código
      const order = orders.find(o => o.code === code)
      if (!order) {
        console.error('Pedido no encontrado con código:', code)
        return
      }

      // Actualizar en el servidor usando el ID del pedido
      const { data: updatedOrder } = await orderService.updateStatus(order.id, status)
      if (!updatedOrder) {
        console.warn('No se pudo obtener el pedido actualizado desde Supabase')
        return
      }

      // Actualizar localmente con la respuesta transformada
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    } catch (err) {
      console.error('Error al actualizar estado del pedido:', err)
      throw err
    }
  }, [orders])

  return { orders, users, updateOrderStatus, loading, error, loadData }
}
