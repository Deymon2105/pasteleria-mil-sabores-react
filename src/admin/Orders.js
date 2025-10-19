import React, { useState } from 'react'
import useAdminData from './useAdminData'

export default function Orders(){
  const { orders, updateOrderStatus } = useAdminData()
  const [expandedOrder, setExpandedOrder] = useState(null)

  const handleChange = (code, e) => {
    updateOrderStatus(code, e.target.value)
  }

  const toggleExpand = (code) => {
    setExpandedOrder(expandedOrder === code ? null : code)
  }

  return (
    <div>
      <h1 className="page__title">Pedidos</h1>
      <section className="card">
        <h2 className="card__title">En curso</h2>
        <div id="admin-orders" className="order-list">
          {orders.map(o=> (
            <div className="card" key={o.code}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong>{o.code}</strong> — {o.status} — Total: {o.total.toLocaleString('es-CL',{style:'currency',currency:'CLP'})}
                  <br />
                  <small>Cliente: {o.customerName || o.name || 'N/A'}</small>
                  {' | '}
                  <small>Fecha: {new Date(o.date).toLocaleDateString('es-CL')}</small>
                </div>
                <button className="btn" onClick={() => toggleExpand(o.code)}>
                  {expandedOrder === o.code ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>

              {expandedOrder === o.code && o.items && (
                <div style={{marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px'}}>
                  <h4>Productos del pedido:</h4>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid #dee2e6'}}>
                        <th style={{padding: '8px', textAlign: 'left'}}>Producto</th>
                        <th style={{padding: '8px', textAlign: 'center'}}>Cantidad</th>
                        <th style={{padding: '8px', textAlign: 'right'}}>Precio</th>
                        <th style={{padding: '8px', textAlign: 'right'}}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items.map((item, idx) => (
                        <tr key={idx} style={{borderBottom: '1px solid #dee2e6'}}>
                          <td style={{padding: '8px'}}>{item.name || item.title}</td>
                          <td style={{padding: '8px', textAlign: 'center'}}>{item.quantity}</td>
                          <td style={{padding: '8px', textAlign: 'right'}}>
                            {Number(item.price).toLocaleString('es-CL',{style:'currency',currency:'CLP'})}
                          </td>
                          <td style={{padding: '8px', textAlign: 'right'}}>
                            {(item.quantity * item.price).toLocaleString('es-CL',{style:'currency',currency:'CLP'})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form__field" style={{marginTop: '10px'}}>
                <label>Actualizar estado</label>
                <select data-code={o.code} className="form__input js-status" onChange={(e)=>handleChange(o.code,e)} value={o.status}>
                  <option value="Preparación">Preparación</option>
                  <option value="En camino">En camino</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
