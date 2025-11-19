import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Blogs from './pages/Blogs'
import About from './pages/About'
import Contacto from './pages/Contacto'
import Login from './pages/Login'
import Cart from './pages/Cart'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import OrdersAdmin from './admin/Orders'
import ProductsAdmin from './admin/Products'
import UsersAdmin from './admin/Users'
import Register from './pages/Register';
import Compra from './pages/Compra';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/catalogo" element={<Catalogo/>} />
              <Route path="/blogs" element={<Blogs/>} />
              <Route path="/about" element={<About/>} />
              <Route path="/contacto" element={<Contacto/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>}/>
              <Route path="/cart" element={<Cart/>} />
              <Route path="/compra" element={<Compra/>} />
              
              {/* ✅ Ruta protegida para historial de pedidos del usuario */}
              <Route path="/my-orders" element={
                <ProtectedRoute requireAdmin={false}>
                  <MyOrders />
                </ProtectedRoute>
              } />
              
              {/*rutas de admin protegidas */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="users" element={<UsersAdmin />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
