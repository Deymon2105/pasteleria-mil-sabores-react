import { useState, useEffect, useCallback, useRef } from 'react'
import { orderService, userService } from '../service/api'

export default function useAdminData(){
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const ordersRef = useRef([])

  // Mantener referencia actualizada de orders
  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  // Cargar datos al montar
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Cargando datos del panel admin...')
      
      const [ordersResponse, usersResponse] = await Promise.all([
        orderService.getAll().catch(err => {
          console.error('Error al cargar órdenes:', err)
          return { data: [] }
        }),
        userService.getAll().catch(err => {
          console.error('Error al cargar usuarios:', err)
          return { data: [] }
        })
      ])
      
      console.log('✅ Datos cargados:', {
        orders: ordersResponse.data?.length || 0,
        users: usersResponse.data?.length || 0
      })
      
      setOrders(ordersResponse.data || [])
      setUsers(usersResponse.data || [])
    } catch (err) {
      console.error('❌ Error al cargar datos admin:', err)
      setError('Error al cargar datos del panel de administración')
      // No bloquear la UI, permitir arrays vacíos
      setOrders([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = useCallback(async (code, status) => {
    try {
      // Encontrar el pedido por código usando la referencia actualizada
      const order = ordersRef.current.find(o => o.code === code)
      if (!order) {
        console.error('Pedido no encontrado con código:', code)
        throw new Error('Pedido no encontrado')
      }

      // Actualizar en el servidor usando el ID del pedido
      const { data: updatedOrder } = await orderService.updateStatus(order.id, status)
      if (!updatedOrder) {
        console.warn('No se pudo obtener el pedido actualizado desde Supabase')
        throw new Error('Error al actualizar el pedido')
      }

      // Actualizar localmente con la respuesta transformada
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    } catch (err) {
      console.error('Error al actualizar estado del pedido:', err)
      throw err
    }
  }, [])

  return { orders, users, updateOrderStatus, loading, error, loadData }
}
