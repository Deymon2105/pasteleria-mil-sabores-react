# 🚀 Guía de Despliegue - Pastelería Mil Sabores

## 📋 Requisitos Previos

- ✅ Cuenta de Supabase configurada
- ✅ Base de datos creada y poblada
- ✅ Variables de entorno configuradas
- ✅ Aplicación funcionando en desarrollo

---

## 🌐 Opciones de Despliegue

### Opción 1: Vercel (Recomendado) ⭐

**Ventajas:**
- Despliegue automático desde Git
- Preview URLs para cada PR
- CDN global
- SSL automático
- Integración nativa con React

**Pasos:**

1. **Crear cuenta en Vercel**
   ```bash
   # Instalar Vercel CLI (opcional)
   npm install -g vercel
   ```

2. **Conectar repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto

3. **Configurar variables de entorno**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega:
     ```
     REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
     ```

4. **Desplegar**
   ```bash
   # Desde CLI (opcional)
   vercel
   
   # O simplemente hacer push a main/master
   git push origin main
   ```

5. **URL de producción**
   - Tu app estará en: `https://tu-proyecto.vercel.app`

---

### Opción 2: Netlify

**Pasos:**

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)

2. **Deploy desde Git**
   - Click en "Add new site"
   - Conecta tu repositorio
   - Configura build:
     ```
     Build command: npm run build
     Publish directory: build
     ```

3. **Variables de entorno**
   - Site settings > Build & deploy > Environment
   - Agrega:
     ```
     REACT_APP_SUPABASE_URL
     REACT_APP_SUPABASE_ANON_KEY
     ```

4. **Configurar redirects** (para SPA)
   - Crea archivo `public/_redirects`:
     ```
     /*    /index.html   200
     ```

---

### Opción 3: GitHub Pages

**Pasos:**

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Actualizar package.json**
   ```json
   {
     "homepage": "https://tu-usuario.github.io/pasteleria-mil-sabores-react",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Configurar variables de entorno**
   - Crear `.env.production`:
     ```env
     REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
     ```
   
   ⚠️ **IMPORTANTE**: Agrega `.env.production` a `.gitignore` si contiene claves sensibles

4. **Desplegar**
   ```bash
   npm run deploy
   ```

---

### Opción 4: AWS Amplify

**Pasos:**

1. **Crear app en AWS Amplify**
   - Ve a AWS Console > Amplify
   - "New app" > "Host web app"
   - Conecta repositorio

2. **Configurar build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Variables de entorno**
   - App settings > Environment variables
   - Agrega credenciales de Supabase

---

## 🔒 Configuración de Seguridad

### 1. Variables de Entorno

**Nunca commits tus credenciales:**

`.gitignore` debe incluir:
```
.env
.env.local
.env.production
.env.development
```

**Para producción, usa:**
- Variables de entorno del hosting (Vercel, Netlify, etc.)
- NO incluyas `.env.production` en el repositorio

### 2. Supabase - Configuración de Producción

En el dashboard de Supabase:

1. **Configurar dominios permitidos**
   - Authentication > URL Configuration
   - Agrega tu dominio de producción
   - Ejemplo: `https://mi-pasteleria.vercel.app`

2. **Habilitar Email Confirmación**
   - Authentication > Settings
   - Enable email confirmations
   - Configura templates de email

3. **Configurar Rate Limiting**
   - Project Settings > API
   - Configura límites de requests

4. **Revisar políticas RLS**
   - Asegúrate de que todas las políticas estén activas
   - Verifica permisos de administrador

### 3. CORS y Headers de Seguridad

Para Vercel, crea `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 📊 Optimización para Producción

### 1. Build Optimizado

```bash
# Crear build de producción
npm run build

# Analizar bundle size
npm install --save-dev webpack-bundle-analyzer
```

### 2. Lazy Loading de Componentes

```javascript
// App.js
import React, { lazy, Suspense } from 'react';

const Admin = lazy(() => import('./admin/AdminLayout'));
const Catalogo = lazy(() => import('./pages/Catalogo'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Optimizar Imágenes

- Usa formatos modernos (WebP)
- Implementa lazy loading
- Considera CDN para imágenes

```javascript
<img 
  src="/img/producto.jpg" 
  loading="lazy" 
  alt="Producto"
/>
```

### 4. Caché de Supabase

```javascript
// Implementar caché simple
const cache = new Map();

export const getCachedProducts = async () => {
  const cacheKey = 'products';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < 300000) {
    return cachedData.data;
  }
  
  const { data } = await supabase.from('products').select('*');
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};
```

---

## 🔍 Monitoreo y Analytics

### 1. Configurar Google Analytics

```bash
npm install react-ga4
```

```javascript
// index.js
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

### 2. Supabase Analytics

- En Supabase Dashboard > Reports
- Monitorea:
  - API requests
  - Database performance
  - Auth events

### 3. Error Tracking con Sentry

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "tu-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## ✅ Checklist Pre-Deployment

- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos poblada con datos de producción
- [ ] Usuario admin creado
- [ ] RLS policies verificadas
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Tests pasando (`npm test`)
- [ ] Sin warnings en consola
- [ ] Optimización de imágenes
- [ ] SEO configurado (meta tags)
- [ ] Favicon agregado
- [ ] manifest.json configurado
- [ ] Dominio configurado en Supabase
- [ ] SSL/HTTPS habilitado
- [ ] Analytics configurado
- [ ] Error tracking configurado

---

## 🐛 Troubleshooting en Producción

### Error: "Failed to fetch"

**Causa**: CORS o URL incorrecta

**Solución**:
```javascript
// Verifica que las URLs estén correctas
console.log('Supabase URL dev:', process.env.REACT_APP_SUPABASE_URL);
```

### Error: "Invalid JWT"

**Causa**: Token expirado o inválido

**Solución**:
```javascript
// En AuthContext, implementa refresh automático
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

### Productos no se cargan

**Causa**: RLS bloqueando consulta

**Solución**:
```sql
-- Verifica política en Supabase
SELECT * FROM pg_policies 
WHERE tablename = 'products';
```

---

## 📈 Post-Deployment

### 1. Verificar funcionalidad
- [ ] Login/Registro funciona
- [ ] Catálogo se carga
- [ ] Carrito funciona
- [ ] Checkout completo funciona
- [ ] Panel admin accesible (solo admin)
- [ ] Todos los enlaces funcionan

### 2. Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s

### 3. SEO
- [ ] Titles y meta descriptions
- [ ] Open Graph tags
- [ ] sitemap.xml
- [ ] robots.txt

---

## 🎉 ¡Deployment Exitoso!

Tu aplicación ahora está en producción. Recuerda:

1. **Monitorear errores** regularmente
2. **Hacer backups** de la base de datos
3. **Mantener dependencias** actualizadas
4. **Revisar logs** de Supabase
5. **Optimizar** basado en métricas reales

**URL de ejemplo:**
- Producción: `https://pasteleria-mil-sabores.vercel.app`
- Admin: `https://pasteleria-mil-sabores.vercel.app/admin`

---

## 📞 Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [React Documentation](https://react.dev)
