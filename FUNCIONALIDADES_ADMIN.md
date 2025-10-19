# Funcionalidades del Panel Admin

## Sistema de Autenticacion
- **Login**: Conectado con AuthContext
- **Registro**: Usuarios registrados aparecen automaticamente en admin
- **Proteccion de rutas**: Solo admins acceden a /admin/*
- **Sesion persistente**: Se mantiene en localStorage

## Usuarios Admin de Prueba
```
Email: ana@duoc.cl (admin)
Email: admin@example.com (admin)
```

---

## 1. DASHBOARD (/admin)
### Funcionalidades:
- Ver ventas totales (suma de todos los pedidos)
- Ver pedidos activos (no entregados)
- Ver total de usuarios registrados
- Datos conectados desde useAdminData hook

---

## 2. PRODUCTOS (/admin/products)
### Funcionalidades:
- **Ver productos**: Grid con imagen, nombre, precio, categoria
- **Filtrar por categoria**: Dropdown con conteo de productos
- **Editar producto**: Click en "Editar"
  - Formulario inline para cambiar nombre, precio e imagen
  - Boton "Guardar" aplica cambios
  - Boton "Cancelar" descarta cambios
- **Destacar/No destacar**: Toggle para marcar productos destacados
- **Eliminar producto**: Con confirmacion
- **Persistencia**: Cambios se guardan en localStorage automaticamente
- **Imagenes**: Muestra imagen del producto o placeholder si no existe

### Datos conectados:
- Lee desde localStorage o productsData inicial
- Guarda cambios automaticamente en localStorage
- FeaturedProducts en Home lee productos destacados del mismo localStorage

---

## 3. PEDIDOS (/admin/orders)
### Funcionalidades:
- **Ver pedidos**: Lista con codigo, estado, total, cliente y fecha
- **Ver detalles**: Click en "Ver detalles"
  - Muestra tabla con productos del pedido
  - Cantidad, precio unitario y subtotal de cada producto
  - Total del pedido
- **Cambiar estado**: Dropdown con 3 estados
  - Preparacion
  - En camino
  - Entregado
- **Persistencia**: Estados se guardan en localStorage

### Datos conectados:
- Lee desde useAdminData hook
- updateOrderStatus actualiza localStorage
- Muestra productos completos de cada pedido (items array)

---

## 4. USUARIOS (/admin/users)
### Funcionalidades:
- **Ver usuarios**: Tabla con todos los usuarios registrados
- **Filtrar por rol**: Botones para filtrar
  - Todos (muestra cantidad total)
  - Admins (muestra cantidad de admins)
  - Usuarios (muestra cantidad de usuarios normales)
- **Destacar admins**: Fila con fondo amarillo para admins
- **Ver rol**: Badge con color (rojo=admin, verde=usuario)
- **Ver beneficios**: Tags con beneficios del usuario
  - >50 (mayor de 50 anos)
  - DUOC (estudiante DUOC)
  - FELICES50 (codigo promocional)

### Datos conectados:
- Lee desde AuthContext (allUsers)
- Incluye usuarios seed + usuarios registrados
- Calcula y muestra beneficios automaticamente

---

## Conexiones Clave

### localStorage Keys:
- `users`: Array de todos los usuarios
- `currentUser`: Usuario actual logueado
- `products`: Array de productos (editable desde admin)
- `orders`: Array de pedidos con estados

### Context API:
- **AuthContext**: Manejo de usuarios y autenticacion
  - currentUser: Usuario logueado
  - allUsers: Todos los usuarios
  - login(), logout(), register()
  - isAdmin(), isLoggedIn()

- **CartContext**: Manejo del carrito (para usuarios)
  - cart, addToCart(), removeFromCart()
  - totalCount, totalPrice

### Custom Hooks:
- **useAdminData**: Hook para datos de admin
  - orders: Lista de pedidos
  - users: Lista de usuarios
  - updateOrderStatus(): Actualizar estado de pedido

---

## Flujo de Datos

### Registro de Usuario:
1. Usuario llena formulario en /register
2. AuthContext.register() guarda en localStorage
3. Usuario inicia sesion automaticamente
4. Aparece inmediatamente en /admin/users

### Gestion de Productos:
1. Admin edita producto en /admin/products
2. Cambios se guardan en localStorage
3. FeaturedProducts en Home lee del mismo localStorage
4. Cambios visibles inmediatamente en la pagina publica

### Gestion de Pedidos:
1. Cliente hace pedido (funcionalidad a implementar)
2. Pedido se guarda en localStorage
3. Aparece en /admin/orders
4. Admin puede cambiar estado
5. Estado se actualiza en localStorage

---

## Notas Tecnicas

### Persistencia:
- Todo se guarda en localStorage
- No hay backend (demo/prototype)
- Para produccion: conectar a API REST

### Validaciones:
- Confirmacion antes de eliminar productos
- Formularios con validaciones basicas
- Control de acceso por rol

### Responsive:
- Diseño funcional en desktop
- Compatible con Bootstrap
- CSS personalizado en styles.css

---

## Proximos Pasos Sugeridos

1. **Conectar con backend real**
   - API REST para productos, pedidos, usuarios
   - Base de datos (MongoDB, PostgreSQL, etc)

2. **Mejorar validaciones**
   - Validacion de imagenes
   - Validacion de precios
   - Validacion de formularios

3. **Agregar mas funcionalidades**
   - Crear nuevos productos desde admin
   - Exportar reportes
   - Graficos de ventas
   - Busqueda de productos

4. **Seguridad**
   - Hash de contrasenas
   - JWT tokens
   - Rate limiting
   - HTTPS

---

## Comandos Utiles

```bash
# Iniciar aplicacion
npm start

# Ver en navegador
http://localhost:3000

# Panel admin
http://localhost:3000/admin

# Login
http://localhost:3000/login
```

---

## Estructura de Datos

### Usuario:
```javascript
{
  name: "Juan Perez",
  email: "juan@email.com",
  password: "123456",
  role: "user", // "user" o "admin"
  birthdate: "1990-05-15",
  benefits: [">50", "DUOC", "FELICES50"],
  age: 35,
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

### Producto:
```javascript
{
  id: "TC001",
  category: "Tortas Cuadradas",
  title: "Torta de Chocolate",
  price: 45000,
  desc: "Deliciosa torta de chocolate",
  image: "/img/torta-chocolate.jpg",
  featured: true
}
```

### Pedido:
```javascript
{
  id: 1,
  code: "PED-0001",
  customerName: "Juan Perez",
  date: "2024-01-15T10:30:00.000Z",
  status: "Preparacion", // "Preparacion", "En camino", "Entregado"
  items: [
    {
      name: "Torta de Chocolate",
      quantity: 1,
      price: 45000
    }
  ],
  total: 45000
}
```
