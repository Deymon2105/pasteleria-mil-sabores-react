# 📦 Configuración de Supabase Storage para Imágenes de Productos

## ⚙️ Pasos para Configurar el Bucket

### 1. Acceder a Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto **pasteleria-mil-sabores**
3. En el menú lateral, haz clic en **Storage**

---

### 2. Crear el Bucket `product-images`

1. **Haz clic en "New Bucket"**
2. **Completa el formulario:**
   - **Name**: `product-images`
   - **Public bucket**: ✅ **MARCAR COMO PÚBLICO** (importante)
   - **File size limit**: `5242880` (5MB en bytes)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

3. **Haz clic en "Create Bucket"**

---

### 3. Configurar Políticas de Acceso (RLS)

Después de crear el bucket, configura las políticas:

1. **Haz clic en el bucket `product-images`**
2. **Haz clic en "Configuration"** (no "Policies")
3. **Scroll hasta "Policies" section**
4. **Haz clic en "New Policy"** para cada política

#### Política 1: Permitir Lectura Pública (SELECT)

1. Click "New Policy" → "For full customization"
2. **Policy Name**: `Public can view product images`
3. **Allowed operation**: `SELECT`
4. **Policy definition (USING)**: 
```sql
bucket_id = 'product-images'
```
5. Click "Save policy"

#### Política 2: Permitir Upload para Admins (INSERT)

1. Click "New Policy" → "For full customization"
2. **Policy Name**: `Admins can upload product images`
3. **Allowed operation**: `INSERT`
4. **Policy definition (WITH CHECK)**:
```sql
bucket_id = 'product-images' 
AND auth.uid() IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
)
```
5. Click "Save policy"

#### Política 3: Permitir Eliminación para Admins (DELETE)

1. Click "New Policy" → "For full customization"
2. **Policy Name**: `Admins can delete product images`
3. **Allowed operation**: `DELETE`
4. **Policy definition (USING)**:
```sql
bucket_id = 'product-images'
AND auth.uid() IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
)
```
5. Click "Save policy"

---

### 3B. ALTERNATIVA: Crear Políticas desde SQL Editor

Si prefieres usar SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Habilitar RLS en storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura pública
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Política 2: Upload solo admins
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Política 3: Delete solo admins
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Política 4: Update solo admins
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);
```

**IMPORTANTE:** Ejecuta todo el bloque SQL de una vez (selecciona todo y click "Run")

---

### 4. Verificar Configuración

1. **Ve a Storage → product-images**
2. **Intenta subir un archivo manualmente** (debería funcionar)
3. **Verifica que la URL pública sea accesible:**
   - Formato: `https://[proyecto].supabase.co/storage/v1/object/public/product-images/products/ejemplo.jpg`

---

## 🧪 Probar el Sistema

### Desde el Panel Admin:

1. **Login como admin** (`ana@duocuc.cl` o `admin@example.com`)
2. **Ve a Productos → ➕ Crear Nuevo Producto**
3. **Selecciona una imagen** desde tu computadora
4. **Verifica el preview** de la imagen
5. **Completa los demás campos** (nombre, precio, etc.)
6. **Haz clic en "✅ Crear Producto"**
7. **Observa la barra de progreso:**
   - `⏳ Subiendo... 30%` (subiendo imagen)
   - `⏳ Subiendo... 60%` (imagen subida)
   - `⏳ Subiendo... 80%` (creando producto)
   - `⏳ Subiendo... 100%` (completado)

---

## 📊 Estructura del Bucket

```
product-images/
└── products/
    ├── 1732567890123-abc123.jpg
    ├── 1732567891234-def456.png
    └── 1732567892345-ghi789.webp
```

Cada imagen se guarda con un nombre único que incluye:
- Timestamp (milisegundos)
- ID aleatorio (6 caracteres)
- Extensión original del archivo

---

## 🔒 Seguridad Implementada

✅ **Solo admins pueden subir** (verificación via `requireAdmin()`)
✅ **Validación de tipo de archivo** (solo imágenes)
✅ **Validación de tamaño** (máximo 5MB)
✅ **Nombres únicos** (evita sobrescritura)
✅ **Bucket público** (las imágenes son accesibles para todos los usuarios)

---

## 🎯 Funcionalidades Disponibles

### 1. **Subir Imagen desde Archivo**
- Selecciona imagen desde tu PC
- Preview en tiempo real
- Barra de progreso durante upload
- Validación automática de formato y tamaño

### 2. **Usar URL Externa (Alternativa)**
- Si no subes archivo, puedes usar una URL
- Útil para imágenes ya hosteadas en otro lugar
- El campo de URL se deshabilita si subes un archivo

### 3. **Eliminar Preview**
- Botón "🗑️ Eliminar" bajo el preview
- Resetea la selección de archivo
- Permite elegir otra imagen

---

## 🐛 Solución de Problemas

### Error: "Error al subir imagen"
**Causas posibles:**
- El bucket no está creado
- El bucket no es público
- Faltan políticas de acceso
- Usuario no es admin

**Solución:**
1. Verifica que el bucket `product-images` existe
2. Confirma que está marcado como público
3. Revisa que las políticas estén creadas
4. Confirma que el usuario tiene role='admin'

---

### Error: "La imagen no debe superar los 5MB"
**Causa:** Archivo muy grande

**Solución:** 
- Comprime la imagen usando https://tinypng.com
- O usa un formato más eficiente (WebP)

---

### Error: "El archivo debe ser una imagen"
**Causa:** Archivo no es JPG/PNG/WebP/GIF

**Solución:** Convierte el archivo a formato de imagen válido

---

## 📝 Formato de URL Generada

Las imágenes subidas generan URLs con este formato:

```
https://jmylmkmfahngbtwcryzw.supabase.co/storage/v1/object/public/product-images/products/1732567890123-abc123.jpg
```

Desglose:
- `jmylmkmfahngbtwcryzw.supabase.co` → Tu proyecto de Supabase
- `/storage/v1/object/public/` → Endpoint público de Storage
- `product-images/` → Nombre del bucket
- `products/` → Carpeta dentro del bucket
- `1732567890123-abc123.jpg` → Nombre único del archivo

---

## 🎨 Mejoras Futuras (Opcionales)

1. **Redimensionamiento automático** → Crear thumbnails
2. **Compresión automática** → Reducir tamaño sin perder calidad
3. **Múltiples imágenes** → Galería de productos
4. **Editor de imágenes** → Crop, filtros, etc.
5. **CDN** → Optimización de carga global

---

**Última actualización**: 25 de Noviembre, 2025
