import React from 'react'
import useAdminData from './useAdminData'

export default function Dashboard(){
  const { orders, users } = useAdminData()
  
  // Métricas
  const totalSales = orders.reduce((a,o)=> a + (Number(o.total)||0), 0)
  const activeOrders = orders.filter(o=>o.status!=='Entregado').length
  const completedOrders = orders.filter(o=>o.status==='Entregado').length
  
  // Pedidos de hoy
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.date).toDateString()
    return orderDate === today
  })
  const todaySales = todayOrders.reduce((a,o)=> a + (Number(o.total)||0), 0)
  
  // Usuarios con beneficios
  const usersWithBenefits = users.filter(u => u.benefits && u.benefits.length > 0).length

  return (
    <div>
      <h1 className="page__title">Panel de control</h1>
      
      <div className="admin-cards">
        <div className="card">
          <h3 className="card__title">Ventas totales</h3>
          <p id="kpi-sales">{totalSales.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</p>
          <small style={{color:'#666'}}>{orders.length} pedidos totales</small>
        </div>
        
        <div className="card">
          <h3 className="card__title">Ventas hoy</h3>
          <p style={{color:'#28a745'}}>{todaySales.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</p>
          <small style={{color:'#666'}}>{todayOrders.length} pedidos hoy</small>
        </div>
        
        <div className="card">
          <h3 className="card__title">Pedidos activos</h3>
          <p id="kpi-orders">{activeOrders}</p>
          <small style={{color:'#666'}}>{completedOrders} completados</small>
        </div>
        
        <div className="card">
          <h3 className="card__title">Usuarios</h3>
          <p id="kpi-users">{users.length}</p>
          <small style={{color:'#666'}}>{usersWithBenefits} con beneficios</small>
        </div>
      </div>
      
      {/* Últimos pedidos */}
      {orders.length > 0 && (
        <div className="card" style={{marginTop: '20px'}}>
          <h3 className="card__title">Últimos pedidos</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #dee2e6', textAlign:'left'}}>
                <th style={{padding:'10px'}}>Código</th>
                <th style={{padding:'10px'}}>Cliente</th>
                <th style={{padding:'10px'}}>Total</th>
                <th style={{padding:'10px'}}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order, idx) => (
                <tr key={order.code || idx} style={{borderBottom:'1px solid #dee2e6'}}>
                  <td style={{padding:'10px'}}><strong>{order.code}</strong></td>
                  <td style={{padding:'10px'}}>{order.customerName || order.name || 'N/A'}</td>
                  <td style={{padding:'10px'}}>{Number(order.total).toLocaleString('es-CL',{style:'currency',currency:'CLP'})}</td>
                  <td style={{padding:'10px'}}>
                    <span style={{
                      padding:'3px 8px',
                      borderRadius:'3px',
                      background: order.status === 'Entregado' ? '#28a745' : 
                                 order.status === 'En camino' ? '#17a2b8' : '#ffc107',
                      color:'white',
                      fontSize:'0.85em'
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
