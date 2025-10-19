# 🚀 Guía Rápida - Admin Panel

## 🔑 Login Admin
```
Email: ana@duoc.cl
o
Email: admin@example.com
```

## 📋 Módulos Disponibles

### 1. Dashboard (`/admin`)
- Ver métricas de ventas
- Pedidos activos y completados
- Total de usuarios
- Últimos 5 pedidos

### 2. Pedidos (`/admin/orders`)
- Filtrar por estado
- Cambiar estado de pedido
- Ver detalles completos
- Información de cliente y productos

### 3. Productos (`/admin/products`) ⭐
- **Ver todas las imágenes de productos**
- Crear nuevo producto
- Editar producto existente
- Eliminar producto
- Marcar como destacado
- Filtrar por categoría

### 4. Usuarios (`/admin/users`)
- Ver todos los usuarios
- Filtrar por rol (admin/user)
- Ver detalles de usuario
- Ver beneficios asignados

## 🛍️ Gestión de Productos

### Crear Producto:
1. Click en "+ Nuevo Producto"
2. Completa:
   - Categoría (requerido)
   - Nombre (requerido)
   - Precio (requerido)
   - Descripción
   - URL de imagen: `/img/nombre.jpg`
   - Destacado: checkbox
3. Ver vista previa
4. Click "Crear Producto"

### Editar Producto:
1. Click "Editar" en cualquier producto
2. Modifica los campos
3. Click "Guardar Cambios"

### Eliminar Producto:
1. Click "Eliminar"
2. Confirmar acción

### Destacar Producto:
- Toggle el switch "Destacado"
- Aparecerá en la página principal

## 📦 Gestión de Pedidos

### Cambiar Estado:
1. Selecciona nuevo estado en dropdown
2. Cambios se guardan automáticamente

### Ver Detalles:
1. Click "Ver Detalles"
2. Ver información completa
3. Lista de productos con precios

## 👥 Gestión de Usuarios

### Filtrar:
- Click en "Todos", "Administradores" o "Usuarios"

### Ver Detalles:
1. Click "Ver Detalles"
2. Ver información completa
3. Beneficios asignados

## 🎨 Categorías de Productos
- Tortas Cuadradas
- Tortas Circulares
- Postres Individuales
- Productos Sin Azúcar
- Pastelería Tradicional
- Productos Sin Gluten
- Productos Vegana
- Tortas Especiales

## 💾 Persistencia
- Productos: localStorage
- Pedidos: localStorage
- Usuarios: localStorage
- Los cambios persisten entre sesiones

## 🖼️ Imágenes
- Ubicación: `/public/img/`
- Formato: `/img/nombre.jpg`
- Fallback: 🍰 si no carga

## ⚡ Atajos
- `/admin` → Dashboard
- `/admin/orders` → Pedidos
- `/admin/products` → Productos
- `/admin/users` → Usuarios
