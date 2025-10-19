# 🎯 Guía de Acceso - Demo Pastelería Mil Sabores

## 🚀 Acceso Rápido al Panel de Administración

### 👤 Credenciales de Admin

Para acceder al **Panel de Administración**, usa cualquiera de estos emails:

```
📧 Email: ana@duocuc.cl
📧 Email: admin@example.com
```

**⚡ Importante:** Para la demo, **NO necesitas contraseña**. Solo ingresa el email y deja el campo de contraseña vacío o escribe cualquier cosa.

---

## 📋 Instrucciones Paso a Paso

### 1️⃣ Acceder a la Aplicación

```bash
# Clonar el repositorio (si no lo tienes)
git clone https://github.com/Deymon2105/pasteleria-mil-sabores-react.git

# Entrar al proyecto
cd pasteleria-mil-sabores-react

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

La aplicación se abrirá en: `http://localhost:3000`

---

### 2️⃣ Iniciar Sesión como Admin

1. Ve a la página de **Login**: `http://localhost:3000/login`
2. En el campo **Email**, ingresa: `ana@duocuc.cl` o `admin@example.com`
3. El campo **Contraseña** es **opcional** - puedes dejarlo vacío
4. Click en **"Iniciar Sesión"**
5. Serás redirigido automáticamente al **Panel de Administración** → `/admin`

---

## 👥 Todos los Usuarios de Demo

### 🔐 Administradores (Acceso al Panel Admin)

| Email | Rol | Beneficios |
|-------|-----|------------|
| `ana@duocuc.cl` | Admin | DUOC, >50 |
| `admin@example.com` | Admin | FELICES50 |

### 👤 Usuarios Normales

| Email | Rol | Beneficios |
|-------|-----|------------|
| `luis@example.com` | User | Ninguno |
| `maria@duocuc.cl` | User | DUOC |
| `carlos@example.com` | User | >50 |

---

## 🎨 Características del Panel Admin

Una vez dentro del panel de administración, podrás:

- ✅ **Dashboard**: Ver estadísticas generales
- 📦 **Gestión de Pedidos**: Ver, editar y cambiar estados
- 🎂 **Gestión de Productos**: CRUD completo
- 👥 **Gestión de Usuarios**: Ver todos los usuarios registrados

---

## 🧪 Ejecutar Tests

Para verificar que todo funciona correctamente:

```bash
# Ver tests en el navegador
npm start
# Luego abre: http://localhost:3000/test-runner.html
```

Deberías ver **121 tests pasando** ✅

---

## 🐛 Solución de Problemas

### ❌ "No puedo acceder al panel de admin"

**Solución:**
1. Asegúrate de usar uno de los emails de admin: `ana@duocuc.cl` o `admin@example.com`
2. La contraseña es **opcional** para demo
3. Si ya iniciaste sesión como usuario normal, haz **logout** primero

### ❌ "La página no carga"

**Solución:**
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
npm start
```

### ❌ "localStorage no guarda los datos"

**Solución:**
- Abre DevTools (F12)
- Ve a Application → Local Storage → `http://localhost:3000`
- Click derecho → Clear
- Recarga la página (F5)

---

## 📞 Contacto

Si tienes problemas, verifica:

1. ✅ Node.js instalado (versión 16+): `node --version`
2. ✅ npm instalado: `npm --version`
3. ✅ Puerto 3000 disponible (no usado por otra app)
4. ✅ Email correcto de admin
5. ✅ Navegador actualizado (Chrome, Edge, Firefox)

---

## 🎓 Notas para la Demo

- **LocalStorage**: Los usuarios están pre-cargados desde `src/data/adminData.js`
- **Sin Backend**: Todo funciona en el navegador (ideal para demo)
- **Persistencia**: Los datos se guardan en localStorage del navegador
- **Reset**: Para resetear todo, limpia el localStorage o recarga con Ctrl+F5

---

## 🔗 URLs Importantes

- **Home**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Panel Admin**: http://localhost:3000/admin
- **Tests**: http://localhost:3000/test-runner.html

---

¡Listo! Ahora todos tus compañeros pueden acceder al panel de administración sin problemas 🎉
