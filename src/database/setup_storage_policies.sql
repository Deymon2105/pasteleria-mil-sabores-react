-- ============================================
-- Script de Configuración de Storage
-- Para el Bucket: product-images
-- ============================================

-- NOTA: Este script debe ejecutarse en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New Query → Pegar TODO este código → Run

-- IMPORTANTE: Primero crea el bucket manualmente en la UI:
-- Storage → New Bucket → Name: product-images → Public: ✅

-- ============================================
-- 1. HABILITAR RLS EN STORAGE.OBJECTS
-- ============================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Política 1: Permitir LECTURA PÚBLICA de imágenes
-- Cualquiera puede ver las imágenes de productos
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Política 2: Solo ADMINS pueden SUBIR imágenes
-- Requiere que el usuario tenga role='admin' en la tabla profiles
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Política 3: Solo ADMINS pueden ACTUALIZAR imágenes
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Política 4: Solo ADMINS pueden ELIMINAR imágenes
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- ============================================
-- 3. VERIFICACIÓN
-- ============================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%product images%';

-- Verificar permisos del bucket (ejecutar después de crear el bucket)
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'product-images';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Deberías ver:
-- ✅ 4 políticas creadas (view, upload, update, delete)
-- ✅ 1 bucket 'product-images' con public=true
-- ✅ file_size_limit = 5242880 (5MB)
-- ============================================
