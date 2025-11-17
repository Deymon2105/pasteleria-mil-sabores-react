# 🔐 Documentación JWT en Pastelería Mil Sabores

## 📋 Resumen Ejecutivo

**Tu aplicación YA está usando JWT correctamente** gracias a Supabase. No necesitas implementar código adicional.

## ❓ Respuestas a tus Preguntas

### 1. ¿Supabase maneja JWT automáticamente?

**SÍ**, completamente automático. Cuando un usuario hace login:

```javascript
// En Login.js o Register.js
const result = await login(email, password);
```

**Supabase automáticamente:**
1. ✅ Genera un JWT (access_token) con duración de 1 hora
2. ✅ Genera un refresh_token para renovar el JWT
3. ✅ Almacena ambos tokens en `sessionStorage`
4. ✅ Incluye el JWT en TODAS las peticiones subsiguientes
5. ✅ Refresca el JWT automáticamente antes de que expire

### 2. ¿Cómo accedo al JWT en React?

**Raramente lo necesitas**, pero si es necesario:

```javascript
import { useAuth } from '../context/AuthContext';

function MiComponente() {
  const { session, getAccessToken } = useAuth();
  
  // Opción 1: Desde la sesión
  const jwt = session?.access_token;
  
  // Opción 2: Usando el helper
  const token = getAccessToken();
  
  console.log('JWT:', token);
}
```

**Ejemplo del contenido del JWT:**
```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@example.com",
  "role": "authenticated",
  "exp": 1700000000,
  "iat": 1699996400
}
```

### 3. ¿Dónde incluir el token en requests?

**NO necesitas hacerlo manualmente**. Supabase lo hace automáticamente:

```javascript
// ❌ NO HAGAS ESTO (innecesario):
const token = await getAccessToken();
fetch('https://api.com', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ HAZ ESTO (Supabase lo maneja):
const { data, error } = await supabase
  .from('products')
  .select('*');
// El JWT ya está incluido en el header Authorization
```

**Supabase incluye automáticamente:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. ¿Necesito manejar refresh token manualmente?

**NO**. Supabase lo hace automáticamente:

```javascript
// En supabaseClient.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,  // ✅ Refresco automático
  },
});
```

**Proceso automático:**
- JWT expira en 1 hora
- Supabase detecta cuando faltan ~5 minutos para expirar
- Usa el refresh_token para obtener un nuevo JWT
- Actualiza sessionStorage automáticamente
- Dispara evento `TOKEN_REFRESHED` en AuthContext

## 🔄 Flujo Completo de JWT

### 1. Login (Generación de JWT)

```javascript
// src/pages/Login.js
const onSubmit = async (data) => {
  const result = await login(data.email, data.password);
  // Supabase generó JWT y refresh_token automáticamente
};
```

**Lo que sucede internamente:**
```javascript
// src/context/AuthContext.js
const login = async (email, password) => {
  // Llama a Supabase
  const response = await authService.login(email, password);
  
  // authService usa Supabase internamente:
  // const { data } = await supabase.auth.signInWithPassword({email, password})
  
  // Supabase devuelve:
  // {
  //   session: {
  //     access_token: "eyJhbG...",  // JWT
  //     refresh_token: "xyz...",
  //     expires_at: 1700000000
  //   },
  //   user: { ... }
  // }
  
  setCurrentUser(response.data.user);
  setSession(response.data.session);
};
```

### 2. Almacenamiento del JWT

```javascript
// src/config/supabaseClient.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage,  // Almacena JWT aquí
  },
});
```

**En sessionStorage:**
```json
{
  "supabase.auth.token": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "v1.MRjxFMZt...",
    "expires_at": 1700000000
  }
}
```

### 3. Uso del JWT en Peticiones

```javascript
// src/service/api.js - Ejemplo con productos
export const productService = {
  getAll: async () => {
    // Supabase lee el JWT de sessionStorage automáticamente
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    // La petición incluye:
    // Headers: {
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    //   'apikey': 'tu-anon-key'
    // }
    
    return { data };
  }
};
```

### 4. Validación del JWT (Backend Supabase)

```
┌─────────────────┐
│  React Frontend │
│  Envía petición │
└────────┬────────┘
         │ Authorization: Bearer <JWT>
         ▼
┌─────────────────┐
│ Supabase Backend│
│ 1. Lee JWT      │
│ 2. Verifica firma
│ 3. Valida exp   │
│ 4. Extrae user  │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Base de│
    │  Datos │
    └────────┘
```

### 5. Renovación Automática del JWT

```javascript
// src/context/AuthContext.js
useEffect(() => {
  // Escuchar eventos de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // JWT renovado automáticamente
        setSession(session);
        console.log('JWT renovado:', session.access_token);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

## 🛡️ Seguridad del JWT

### Variables de Entorno (.env)

```bash
# NUNCA expongas estas variables en el código
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ NO necesitas JWT_SECRET en el frontend
# Supabase lo maneja en el backend
```

### Configuración Row Level Security (RLS)

En Supabase Dashboard, tus tablas deben tener políticas RLS:

```sql
-- Ejemplo: Solo el usuario puede ver sus propios pedidos
CREATE POLICY "Users can view own orders" 
ON orders
FOR SELECT
USING (auth.uid() = user_id);

-- El JWT contiene auth.uid() automáticamente
```

### Almacenamiento Seguro

```javascript
// ✅ BUENO: sessionStorage (se borra al cerrar navegador)
storage: window.sessionStorage

// ⚠️ MENOS SEGURO: localStorage (persiste indefinidamente)
storage: window.localStorage
```

## 🧪 Helpers Útiles para Debugging

### Ver información del JWT actual

```javascript
import { getTokenPayload } from '../config/supabaseClient';

const MiComponente = () => {
  const verJWT = async () => {
    const payload = await getTokenPayload();
    console.log('Info del JWT:', payload);
    // {
    //   userId: "uuid...",
    //   email: "user@example.com",
    //   role: "authenticated",
    //   expiresAt: Date(...)
    // }
  };
  
  return <button onClick={verJWT}>Ver JWT</button>;
};
```

### Verificar si el JWT es válido

```javascript
import { useAuth } from '../context/AuthContext';

const MiComponente = () => {
  const { isTokenValid } = useAuth();
  
  if (!isTokenValid()) {
    console.warn('JWT expirado o inválido');
  }
};
```

## 📝 Casos de Uso Especiales

### 1. Llamar a una API Externa (NO Supabase)

```javascript
import { getAccessToken } from '../config/supabaseClient';

const llamarAPIExterna = async () => {
  // Solo aquí necesitas obtener el JWT manualmente
  const token = await getAccessToken();
  
  const response = await fetch('https://api-externa.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
};
```

### 2. Subir Archivos con JWT

```javascript
const subirImagen = async (file) => {
  // JWT incluido automáticamente
  const { data, error } = await supabase.storage
    .from('imagenes')
    .upload(`productos/${file.name}`, file);
  
  // No necesitas agregar header Authorization
};
```

### 3. Verificar Permisos de Admin

```javascript
// src/service/api.js
const requireAdmin = async () => {
  const session = await checkAuth(); // Verifica JWT
  
  // Obtener rol del usuario usando JWT
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (profile.role !== 'admin') {
    throw new Error('No autorizado - se requiere rol admin');
  }
};
```

## 🚨 Errores Comunes y Soluciones

### Error: "JWT expired"

```javascript
// ❌ PROBLEMA: JWT expiró y no se renovó
// ✅ SOLUCIÓN: Verificar autoRefreshToken está habilitado

// src/config/supabaseClient.js
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,  // ✅ Debe estar en true
  },
});
```

### Error: "No session found"

```javascript
// ❌ PROBLEMA: Usuario no autenticado
// ✅ SOLUCIÓN: Redirigir a login

const { session } = useAuth();

if (!session) {
  navigate('/login');
}
```

### Error: "Invalid JWT"

```javascript
// ❌ PROBLEMA: JWT corrupto o inválido
// ✅ SOLUCIÓN: Cerrar sesión y volver a autenticar

const { logout } = useAuth();

try {
  // Intentar operación
} catch (error) {
  if (error.message.includes('JWT')) {
    await logout();
    navigate('/login');
  }
}
```

## 📊 Monitoreo del JWT

### Ver JWT en DevTools

1. Abre DevTools (F12)
2. Ve a Application > Session Storage
3. Busca la clave `supabase.auth.token`

### Decodificar JWT Online

Copia tu access_token y pégalo en: https://jwt.io

Verás algo como:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "aud": "authenticated",
    "exp": 1700000000,
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "authenticated"
  }
}
```

## 🎯 Checklist de Implementación

- [x] Variables de entorno configuradas (.env)
- [x] supabaseClient.js con autoRefreshToken: true
- [x] AuthContext escuchando eventos de sesión
- [x] sessionStorage para almacenar tokens
- [x] Peticiones usando cliente Supabase (no fetch manual)
- [x] Manejo de errores de autenticación
- [x] RLS habilitado en Supabase (opcional pero recomendado)

## 🔗 Referencias Útiles

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT.io - Decodificador de JWT](https://jwt.io)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## 📞 Soporte

Si tienes dudas sobre JWT en tu aplicación:
1. Verifica que `autoRefreshToken: true` esté activo
2. Revisa la consola del navegador para errores
3. Usa los helpers de debugging incluidos
4. Verifica sessionStorage en DevTools

---

**Conclusión:** Tu aplicación ya maneja JWT correctamente. Supabase hace todo el trabajo pesado automáticamente. Solo necesitas usar los servicios normalmente y el JWT se incluye en cada petición.
