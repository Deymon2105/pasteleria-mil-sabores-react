# 📐 Arquitectura y Diagramas - Pastelería Mil Sabores

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages      │  │  Components  │  │   Context    │    │
│  │              │  │              │  │              │    │
│  │ - Home       │  │ - Header     │  │ - Auth       │    │
│  │ - Catalogo   │  │ - Footer     │  │ - Cart       │    │
│  │ - Cart       │  │ - Product    │  │              │    │
│  │ - Compra     │  │ - Modal      │  │              │    │
│  │ - Admin      │  │              │  │              │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘    │
│         │                                    │             │
│         └────────────────┬───────────────────┘             │
│                          │                                 │
│                   ┌──────▼────────┐                        │
│                   │   Services    │                        │
│                   │               │                        │
│                   │ - api.js      │                        │
│                   │ - supabase    │                        │
│                   └──────┬────────┘                        │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           │ HTTPS / REST API / Real-time
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                   SUPABASE BACKEND                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth       │  │  Database    │  │   Storage    │    │
│  │              │  │  (Postgres)  │  │  (opcional)  │    │
│  │ - JWT        │  │              │  │              │    │
│  │ - Sessions   │  │ - profiles   │  │ - images     │    │
│  │ - OAuth      │  │ - products   │  │ - files      │    │
│  │              │  │ - orders     │  │              │    │
│  │              │  │ - items      │  │              │    │
│  └──────────────┘  └──────┬───────┘  └──────────────┘    │
│                           │                                │
│                    ┌──────▼────────┐                       │
│                    │      RLS      │                       │
│                    │   Policies    │                       │
│                    └───────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Datos Relacional

```
┌─────────────────────────────────────┐
│          auth.users                 │
│         (Supabase Auth)             │
├─────────────────────────────────────┤
│ • id: UUID [PK]                     │
│ • email: TEXT                       │
│ • encrypted_password: TEXT          │
│ • email_confirmed_at: TIMESTAMP     │
│ • created_at: TIMESTAMP             │
│ • updated_at: TIMESTAMP             │
└──────────────┬──────────────────────┘
               │
               │ 1:1
               │
┌──────────────▼──────────────────────┐
│           profiles                  │
├─────────────────────────────────────┤
│ • id: UUID [PK] [FK → auth.users]   │
│ • email: TEXT [UNIQUE]              │
│ • name: TEXT                        │
│ • phone: TEXT                       │
│ • role: TEXT (user | admin)         │
│ • benefits: JSONB                   │
│ • created_at: TIMESTAMP             │
│ • updated_at: TIMESTAMP             │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
┌──────────────▼──────────────────────┐
│            orders                   │
├─────────────────────────────────────┤
│ • id: UUID [PK]                     │
│ • user_id: UUID [FK → profiles]     │
│ • code: TEXT [UNIQUE]               │
│ • status: TEXT                      │
│   (pending|processing|shipped|      │
│    delivered|cancelled)             │
│ • total: DECIMAL(10,2)              │
│ • discount: DECIMAL(10,2)           │
│ • shipping_address: JSONB           │
│ • payment_info: JSONB               │
│ • notes: TEXT                       │
│ • created_at: TIMESTAMP             │
│ • updated_at: TIMESTAMP             │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
┌──────────────▼──────────────────────┐       ┌──────────────────────────┐
│         order_items                 │       │       products           │
├─────────────────────────────────────┤   N:1 ├──────────────────────────┤
│ • id: UUID [PK]                     │◄──────│ • id: UUID [PK]          │
│ • order_id: UUID [FK → orders]      │       │ • name: TEXT             │
│ • product_id: UUID [FK → products]  │───────│ • description: TEXT      │
│ • quantity: INTEGER                 │       │ • price: DECIMAL(10,2)   │
│ • price: DECIMAL(10,2)              │       │ • category: TEXT         │
│   (precio histórico)                │       │ • image: TEXT            │
│ • created_at: TIMESTAMP             │       │ • featured: BOOLEAN      │
└─────────────────────────────────────┘       │ • stock: INTEGER         │
                                              │ • created_at: TIMESTAMP  │
                                              │ • updated_at: TIMESTAMP  │
                                              └──────────────────────────┘
```

---

## 🔐 Row Level Security (RLS) - Flujo

### Ejemplo: Usuario consultando productos

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │
       │ SELECT * FROM products
       │
┌──────▼──────────────────────────────────────────┐
│              Supabase API                       │
│                                                 │
│  1. Recibe solicitud                            │
│  2. Extrae JWT del header                       │
│  3. Valida JWT                                  │
│  4. Obtiene user_id del token                   │
└──────┬──────────────────────────────────────────┘
       │
       │ Ejecuta consulta con contexto de usuario
       │
┌──────▼──────────────────────────────────────────┐
│           PostgreSQL + RLS                      │
│                                                 │
│  5. Ejecuta: SELECT * FROM products             │
│  6. Aplica política RLS:                        │
│     ✓ "Todos pueden ver productos"              │
│       USING (true)                              │
│  7. Filtra resultados según política            │
│  8. Retorna filas autorizadas                   │
└──────┬──────────────────────────────────────────┘
       │
       │ Resultados filtrados
       │
┌──────▼──────┐
│   Usuario   │
│  (Frontend) │
└─────────────┘
```

### Ejemplo: Admin actualizando pedido

```
┌─────────────┐
│    Admin    │
│  (Frontend) │
└──────┬──────┘
       │
       │ UPDATE orders SET status = 'shipped'
       │
┌──────▼──────────────────────────────────────────┐
│              Supabase API                       │
│                                                 │
│  1. Recibe solicitud                            │
│  2. Valida JWT                                  │
│  3. user_id = abc-123 (admin)                   │
└──────┬──────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────┐
│           PostgreSQL + RLS                      │
│                                                 │
│  4. Verifica política:                          │
│     "Los admins pueden actualizar pedidos"      │
│     USING (                                     │
│       EXISTS (                                  │
│         SELECT 1 FROM profiles                  │
│         WHERE id = auth.uid()                   │
│         AND role = 'admin'                      │
│       )                                         │
│     )                                           │
│                                                 │
│  5. Consulta profiles:                          │
│     WHERE id = 'abc-123'                        │
│     → role = 'admin' ✓                          │
│                                                 │
│  6. Política cumplida → UPDATE permitido        │
└──────┬──────────────────────────────────────────┘
       │
       │ Éxito
       │
┌──────▼──────┐
│    Admin    │
└─────────────┘
```

---

## 🔄 Flujo de Autenticación

```
┌──────────────────────────────────────────────────────────────┐
│                    REGISTRO DE USUARIO                       │
└──────────────────────────────────────────────────────────────┘

Frontend                 Supabase Auth            Database
    │                         │                       │
    │  signUp(email, pass)    │                       │
    ├────────────────────────►│                       │
    │                         │                       │
    │                         │ Crea usuario          │
    │                         │ en auth.users         │
    │                         ├──────────────────────►│
    │                         │                       │
    │                         │◄──────────────────────┤
    │                         │ Usuario creado        │
    │                         │ id: abc-123           │
    │                         │                       │
    │                         │  TRIGGER              │
    │                         │  on_auth_user_created │
    │                         ├──────────────────────►│
    │                         │                       │
    │                         │ INSERT INTO profiles  │
    │                         │ (id, email, name...)  │
    │                         │                       │
    │                         │◄──────────────────────┤
    │                         │ Perfil creado         │
    │                         │                       │
    │◄────────────────────────┤                       │
    │  { user, session }      │                       │
    │                         │                       │
    │  Guardar en             │                       │
    │  sessionStorage         │                       │
    │                         │                       │

┌──────────────────────────────────────────────────────────────┐
│                      LOGIN DE USUARIO                        │
└──────────────────────────────────────────────────────────────┘

Frontend                 Supabase Auth            Database
    │                         │                       │
    │  login(email, pass)     │                       │
    ├────────────────────────►│                       │
    │                         │                       │
    │                         │ Valida credenciales   │
    │                         │                       │
    │                         │ SELECT FROM auth.users│
    │                         ├──────────────────────►│
    │                         │                       │
    │                         │◄──────────────────────┤
    │                         │ Usuario válido        │
    │                         │                       │
    │                         │ Genera JWT            │
    │                         │                       │
    │◄────────────────────────┤                       │
    │  { session, user }      │                       │
    │  JWT token              │                       │
    │                         │                       │
    │  Obtener perfil completo│                       │
    ├────────────────────────►│                       │
    │                         │ SELECT FROM profiles  │
    │                         ├──────────────────────►│
    │                         │ WHERE id = user_id    │
    │                         │                       │
    │                         │◄──────────────────────┤
    │◄────────────────────────┤ Datos completos       │
    │  { name, role,          │                       │
    │    benefits, ... }      │                       │
    │                         │                       │
    │  Guardar en context     │                       │
    │  y sessionStorage       │                       │
    │                         │                       │
```

---

## 🛒 Flujo de Compra

```
┌───────────────────────────────────────────────────────────┐
│               PROCESO DE COMPRA COMPLETO                  │
└───────────────────────────────────────────────────────────┘

Usuario → Catálogo → Carrito → Checkout → Confirmación

1. SELECCIÓN DE PRODUCTOS
   │
   ├─► Usuario ve productos (GET /products)
   ├─► Agrega al carrito (sessionStorage)
   └─► Continúa navegando

2. REVISIÓN DEL CARRITO
   │
   ├─► Usuario ve carrito
   ├─► Calcula totales (frontend)
   ├─► Aplica descuentos según benefits
   └─► Click "Proceder al Pago"

3. CHECKOUT (Requiere autenticación)
   │
   ├─► Verifica autenticación
   ├─► Pre-llena datos del usuario
   ├─► Usuario completa:
   │   ├─► Dirección de envío
   │   └─► Información de pago
   └─► Click "Finalizar Compra"

4. PROCESAMIENTO
   │
   ├─► Valida formulario (frontend)
   ├─► Simula procesamiento de pago (80% éxito)
   └─► Si éxito:
       │
       ├─► Construye orderData:
       │   {
       │     code: "ORD-20231115-ABC123",
       │     status: "pending",
       │     total: 45000,
       │     discount: 5000,
       │     shippingAddress: {...},
       │     paymentInfo: {...},
       │     items: [...]
       │   }
       │
       ├─► POST a orderService.create()
       │   │
       │   ├─► Supabase valida JWT
       │   ├─► RLS verifica permisos
       │   ├─► INSERT INTO orders
       │   ├─► INSERT INTO order_items (batch)
       │   └─► Retorna pedido creado
       │
       ├─► Limpia carrito (clearCart)
       ├─► Muestra mensaje de éxito
       └─► Redirige a home (4 segundos)

5. CONFIRMACIÓN
   │
   ├─► Usuario ve mensaje de éxito
   ├─► Recibe código de pedido
   └─► Puede ver estado en su perfil
```

---

## 🔍 Políticas RLS por Rol

### Usuario Normal (role = 'user')

```
┌─────────────────────────────────────────────────┐
│              PERMISOS DE USUARIO                │
├─────────────────────────────────────────────────┤
│ Tabla: profiles                                 │
│ ✓ SELECT - Solo su propio perfil                │
│ ✓ UPDATE - Solo su propio perfil                │
│ ✗ DELETE - No puede eliminar                    │
│ ✗ INSERT - Solo al registrarse (via Auth)       │
├─────────────────────────────────────────────────┤
│ Tabla: products                                 │
│ ✓ SELECT - Todos los productos                  │
│ ✗ INSERT - No puede crear                       │
│ ✗ UPDATE - No puede modificar                   │
│ ✗ DELETE - No puede eliminar                    │
├─────────────────────────────────────────────────┤
│ Tabla: orders                                   │
│ ✓ SELECT - Solo sus propios pedidos             │
│ ✓ INSERT - Solo con su user_id                  │
│ ✗ UPDATE - No puede modificar                   │
│ ✗ DELETE - No puede eliminar                    │
├─────────────────────────────────────────────────┤
│ Tabla: order_items                              │
│ ✓ SELECT - Solo items de sus pedidos            │
│ ✓ INSERT - Solo en sus pedidos                  │
│ ✗ UPDATE - No puede modificar                   │
│ ✗ DELETE - No puede eliminar                    │
└─────────────────────────────────────────────────┘
```

### Administrador (role = 'admin')

```
┌─────────────────────────────────────────────────┐
│            PERMISOS DE ADMINISTRADOR            │
├─────────────────────────────────────────────────┤
│ Tabla: profiles                                 │
│ ✓ SELECT - Todos los perfiles                   │
│ ✓ UPDATE - Todos los perfiles                   │
│ ✓ DELETE - Puede eliminar perfiles              │
│ ✓ INSERT - Puede crear perfiles                 │
├─────────────────────────────────────────────────┤
│ Tabla: products                                 │
│ ✓ SELECT - Todos los productos                  │
│ ✓ INSERT - Puede crear productos                │
│ ✓ UPDATE - Puede modificar productos            │
│ ✓ DELETE - Puede eliminar productos             │
├─────────────────────────────────────────────────┤
│ Tabla: orders                                   │
│ ✓ SELECT - Todos los pedidos                    │
│ ✓ UPDATE - Puede cambiar estados                │
│ ✗ INSERT - No crea pedidos directamente         │
│ ✗ DELETE - No elimina (puede cancelar)          │
├─────────────────────────────────────────────────┤
│ Tabla: order_items                              │
│ ✓ SELECT - Todos los items                      │
│ ✗ UPDATE - No modifica items                    │
│ ✗ DELETE - No elimina items                     │
└─────────────────────────────────────────────────┘
```

---

## 📊 Estructura JSONB

### profiles.benefits
```json
["DUOC", ">50", "FELICES50"]
```

### orders.shipping_address
```json
{
  "nombre": "Juan Pérez",
  "calle": "Av. Principal 123",
  "depto": "Depto 45",
  "region": "Metropolitana",
  "comuna": "Santiago",
  "indicaciones": "Timbre 45, edificio azul"
}
```

### orders.payment_info
```json
{
  "method": "credit_card",
  "lastFourDigits": "1234",
  "cardHolderName": "JUAN PEREZ"
}
```

---

## 🚀 Optimizaciones Implementadas

### Índices
- `profiles`: email, role
- `products`: category, featured, created_at
- `orders`: user_id, code, status, created_at
- `order_items`: order_id, product_id

### Triggers
- Auto-actualización de `updated_at`
- Creación automática de perfil al registrarse
- Generación automática de código de pedido (opcional)

### Vistas
- `orders_full`: Pedidos con información completa
- `product_categories`: Resumen de categorías

### Funciones
- `get_sales_stats()`: Estadísticas de ventas
- `generate_order_code()`: Códigos únicos de pedido

---

## 📈 Escalabilidad

La arquitectura actual soporta:

- ✅ Múltiples usuarios concurrentes
- ✅ Crecimiento de catálogo de productos
- ✅ Alto volumen de pedidos
- ✅ Consultas complejas optimizadas
- ✅ Real-time updates (Supabase)
- ✅ CDN para assets estáticos
- ✅ Caché de consultas frecuentes

### Próximas mejoras opcionales:

- 🔄 Implementar Redis para caché
- 📊 Analytics y métricas
- 📧 Sistema de notificaciones
- 🖼️ Supabase Storage para imágenes
- 🌐 Internacionalización (i18n)
- 📱 PWA (Progressive Web App)
