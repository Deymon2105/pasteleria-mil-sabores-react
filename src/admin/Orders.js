import React from 'react'
import useAdminData from './useAdminData'

export default function Orders(){
  const { orders, updateOrderStatus } = useAdminData()

  const handleChange = (code, e) => {
    updateOrderStatus(code, e.target.value)
    alert('Estado actualizado')
  }

  return (
    <div>
      <h1 className="page__title">Pedidos</h1>
      <section className="card">
        <h2 className="card__title">En curso</h2>
        <div id="admin-orders" className="order-list">
          {orders.map(o=> (
            <div className="card" key={o.code}>
              <strong>{o.code}</strong> — {o.status} — Total: {o.total}
              <div className="form__field">
                <label>Actualizar estado</label>
                <select data-code={o.code} className="form__input js-status" onChange={(e)=>handleChange(o.code,e)} value={o.status}>
                  {['Preparación','En reparto','Entregado'].map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
