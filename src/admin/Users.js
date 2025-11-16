import React, { useState } from 'react'
import useAdminData from './useAdminData'

export default function Users(){
  const { users, loading, error } = useAdminData()
  const [filterRole, setFilterRole] = useState('all')

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(u => u.role === filterRole)

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '50px'}}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{padding: '20px'}}>
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page__title">Usuarios ({users.length})</h1>
      
      {/* Filtros simples */}
      <div style={{marginBottom: '20px'}}>
        <label style={{marginRight: '10px'}}>Filtrar por rol:</label>
        <button 
          className={filterRole === 'all' ? 'btn' : 'btn'} 
          onClick={() => setFilterRole('all')}
          style={{marginRight: '5px', background: filterRole === 'all' ? '#007bff' : '#6c757d'}}
        >
          Todos ({users.length})
        </button>
        <button 
          className="btn" 
          onClick={() => setFilterRole('admin')}
          style={{marginRight: '5px', background: filterRole === 'admin' ? '#dc3545' : '#6c757d'}}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
        <button 
          className="btn" 
          onClick={() => setFilterRole('user')}
          style={{background: filterRole === 'user' ? '#28a745' : '#6c757d'}}
        >
          Usuarios ({users.filter(u => u.role === 'user').length})
        </button>
      </div>

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
          {filteredUsers.map((u,i)=> (
            <tr key={i} style={{background: u.role === 'admin' ? '#fff3cd' : 'transparent'}}>
              <td><strong>{u.name}</strong></td>
              <td>{u.email}</td>
              <td>
                <span style={{
                  padding: '3px 8px', 
                  borderRadius: '3px', 
                  background: u.role === 'admin' ? '#dc3545' : '#28a745',
                  color: 'white',
                  fontSize: '0.85em'
                }}>
                  {u.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                </span>
              </td>
              <td>{u.birthdate || 'N/A'}</td>
              <td>
                {(u.benefits||[]).length > 0 ? (
                  (u.benefits||[]).map((b, idx) => (
                    <span key={idx} style={{
                      padding: '2px 6px',
                      margin: '2px',
                      borderRadius: '3px',
                      background: '#17a2b8',
                      color: 'white',
                      fontSize: '0.8em',
                      display: 'inline-block'
                    }}>
                      {b}
                    </span>
                  ))
                ) : (
                  <span style={{color: '#6c757d'}}>Sin beneficios</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
