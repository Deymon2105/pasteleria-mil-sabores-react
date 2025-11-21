# Guía de Migración a professional_schema.sql

## ⚠️ IMPORTANTE: Cambios en la Base de Datos

Se ha actualizado el proyecto para usar el nuevo esquema profesional (`professional_schema.sql`). Este esquema incluye mejoras significativas en la gestión de inventario y estructura de datos.

## 🔄 Cambios Principales

### 1. Tablas Eliminadas
- ❌ `addresses` - Las direcciones ahora se guardan como JSONB en cada orden
- ❌ `payment_methods` - Los métodos de pago ahora se guardan como JSONB en cada orden

### 2. Nuevos Campos en `orders`
- ✅ `subtotal` (DECIMAL) - Subtotal antes de descuentos
- ✅ `shipping_cost` (DECIMAL) - Costo de envío
- ✅ `shipping_address` (JSONB) - Dirección de envío completa
- ✅ `payment_info` (JSONB) - Información de pago (solo últimos 4 dígitos)

### 3. Nueva Funcionalidad en `products`
- ✅ `stock` (INTEGER) - Control de inventario
- ✅ Triggers automáticos para validar y decrementar stock al crear órdenes
- ✅ Prevención de ventas cuando no hay stock suficiente

### 4. Archivos Eliminados
- `src/service/addressService.js`
- `src/service/paymentMethodService.js`

### 5. Archivos Actualizados
- `src/pages/Compra.js` - Simplificado, sin direcciones/métodos guardados
- `src/service/api.js` - Actualizado orderService con nuevos campos
- `src/admin/Products.js` - Agregado campo de stock
- `src/context/CartContext.js` - Optimizado con useCallback y useMemo

## 📋 Pasos para Aplicar la Migración

### 1. Ejecutar el Esquema en Supabase

1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `database/professional_schema.sql`
4. **⚠️ ADVERTENCIA**: Este script **ELIMINA TODAS LAS TABLAS** existentes
5. Haz clic en "Run" para ejecutar

### 2. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga las credenciales correctas:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Iniciar la Aplicación

```bash
npm start
```

## 🎯 Características del Nuevo Esquema

### Control de Inventario Automático

El nuevo esquema incluye triggers que:

1. **Validan stock** antes de permitir una venta
2. **Decrementan automáticamente** el stock al confirmar una orden
3. **Lanzan errores descriptivos** si no hay suficiente stock

Ejemplo de error si falta stock:
```
Stock insuficiente para "Torta de Chocolate". Disponible: 2, Solicitado: 5
```

### Políticas RLS (Row Level Security)

- ✅ Los usuarios pueden ver sus propias órdenes
- ✅ Los administradores pueden ver todas las órdenes
- ✅ Cualquiera puede crear órdenes (compra sin registro)
- ✅ Los productos son visibles para todos
- ✅ Solo administradores pueden modificar productos

### Datos de Ejemplo

El esquema incluye 8 productos de ejemplo con stock inicial:

| Producto | Stock | Precio |
|----------|-------|--------|
| Torta de Chocolate | 10 | $25,000 |
| Cheesecake de Frutilla | 8 | $22,000 |
| Cupcakes Variados | 20 | $8,000 |
| Pie de Limón | 12 | $18,000 |
| Brownies | 15 | $6,000 |
| Torta Tres Leches | 6 | $20,000 |
| Macarons | 25 | $15,000 |
| Tiramisu | 10 | $19,000 |

## 🐛 Solución de Problemas

### Error: "Usuario no autenticado"

Si ves este error al hacer login:
1. Verifica que el esquema se haya aplicado correctamente
2. Asegúrate de que el trigger `on_auth_user_created` esté activo
3. Intenta registrar un nuevo usuario de prueba

### Error: "Stock insuficiente"

Esto es esperado si intentas comprar más unidades de las disponibles:
1. Ve al panel de administración (/admin)
2. Busca el producto con stock bajo
3. Edita el producto y aumenta el stock

### Error al cargar productos

Si los productos no cargan:
1. Verifica que Supabase esté funcionando
2. Revisa las políticas RLS en la tabla `products`
3. Asegúrate de que la política "Products are viewable by everyone" esté activa

## 📊 Panel de Administración

Como administrador, ahora puedes:
- ✅ Ver el stock de cada producto (con código de colores)
- ✅ Editar el stock disponible
- ✅ Ver todas las órdenes de todos los usuarios
- ✅ Actualizar el estado de las órdenes

### Crear un Usuario Administrador

Después de registrarte, ejecuta este SQL en Supabase:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';
```

## ✅ Verificación Final

Después de la migración, verifica que:

1. ✅ Puedes ver el catálogo de productos
2. ✅ Puedes agregar productos al carrito
3. ✅ Puedes completar una compra
4. ✅ El stock se reduce automáticamente
5. ✅ No puedes comprar más de lo disponible
6. ✅ Como admin, puedes editar el stock

## 🎉 ¡Listo!

Tu aplicación ahora está usando el esquema profesional con:
- Control automático de inventario
- Estructura de datos optimizada
- Mejor seguridad con RLS
- Triggers para integridad de datos
