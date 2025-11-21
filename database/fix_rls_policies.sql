-- ========================================
-- FIX: Políticas RLS para permitir compras de invitados
-- ========================================
-- Este script elimina y recrea las políticas RLS para permitir
-- que cualquier usuario (autenticado o invitado) pueda crear órdenes

-- 1. Eliminar políticas existentes de orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- 2. Eliminar políticas existentes de order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- 3. Recrear políticas de ORDERS
-- Permitir a usuarios autenticados ver sus propias órdenes
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- ⭐ CRÍTICO: Permitir a CUALQUIERA crear órdenes (invitados y autenticados)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Permitir a admins ver todas las órdenes
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_admin());

-- Permitir a admins actualizar todas las órdenes
CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (public.is_admin());

-- 4. Recrear políticas de ORDER_ITEMS
-- Permitir a usuarios ver los items de sus propias órdenes
CREATE POLICY "Users can view own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- ⭐ CRÍTICO: Permitir a CUALQUIERA crear items de órdenes
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Permitir a admins ver todos los items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_admin());

-- 5. Verificar que RLS esté habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICACIÓN: Ejecuta esta query para ver las políticas activas
-- ========================================
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
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
