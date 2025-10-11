import React from 'react'
import useAdminData from './useAdminData'

export default function Dashboard(){
  const { orders, users } = useAdminData()
  const totalSales = orders.reduce((a,o)=> a + (Number(o.total)||0), 0)
  const activeOrders = orders.filter(o=>o.status!=='Entregado').length

  return (
    <div>
      <h1 className="page__title">Panel de control</h1>
      <div className="admin-cards">
        <div className="card"><h3 className="card__title">Ventas hoy</h3><p id="kpi-sales">{totalSales.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</p></div>
        <div className="card"><h3 className="card__title">Pedidos activos</h3><p id="kpi-orders">{activeOrders}</p></div>
        <div className="card"><h3 className="card__title">Usuarios</h3><p id="kpi-users">{users.length}</p></div>
      </div>
    </div>
  )
}
