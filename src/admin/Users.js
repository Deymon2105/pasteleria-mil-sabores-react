import React from 'react'
import useAdminData from './useAdminData'

export default function Users(){
  const { users } = useAdminData()
  return (
    <div>
      <h1 className="page__title">Usuarios</h1>
      <table id="users-table" className="display" style={{width:'100%'}}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha nacimiento</th>
            <th>Beneficios</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u,i)=> (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.birthdate}</td>
              <td>{(u.benefits||[]).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
