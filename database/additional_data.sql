-- ============================================================
-- DATOS ADICIONALES PARA PRUEBAS - PASTELERÍA MIL SABORES
-- Ejecutar DESPUÉS de setup.sql
-- ============================================================

-- ============================================================
-- PRODUCTOS ADICIONALES (Más variedad)
-- ============================================================

INSERT INTO public.products (name, description, price, category, image, featured, stock) VALUES
-- Más Tortas
('Torta Red Velvet', 'Elegante torta de terciopelo rojo con frosting de queso crema', 28000, 'Tortas', '/img/red-velvet.jpg', true, 5),
('Torta de Zanahoria', 'Torta húmeda de zanahoria con nueces y frosting de queso crema', 24000, 'Tortas', '/img/torta-zanahoria.jpg', false, 8),
('Torta Selva Negra', 'Clásica torta alemana de chocolate, cerezas y crema', 26000, 'Tortas', '/img/selva-negra.jpg', true, 4),

-- Pasteles
('Mil Hojas', 'Tradicional mil hojas con manjar y crema', 16000, 'Pasteles', '/img/mil-hojas.jpg', false, 10),
('Berlín', 'Esponjosos berlínes rellenos de crema pastelera', 3500, 'Pasteles', '/img/berlin.jpg', false, 30),
('Eclair de Chocolate', 'Delicado eclair relleno de crema y cubierto con chocolate', 4500, 'Pasteles', '/img/eclair.jpg', true, 20),

-- Cupcakes
('Cupcakes de Vainilla', 'Set de 6 cupcakes de vainilla con buttercream', 7000, 'Cupcakes', '/img/cupcakes-vainilla.jpg', false, 15),
('Cupcakes de Red Velvet', 'Set de 6 cupcakes red velvet con frosting de queso', 8500, 'Cupcakes', '/img/cupcakes-red-velvet.jpg', true, 12),

-- Galletas y Brownies
('Cookies con Chips de Chocolate', 'Docena de cookies recién horneadas', 9000, 'Galletas', '/img/cookies.jpg', false, 25),
('Alfajores', 'Media docena de alfajores artesanales', 7500, 'Galletas', '/img/alfajores.jpg', true, 20),
('Brownie con Helado', 'Brownie tibio servido con helado de vainilla', 7000, 'Brownies', '/img/brownie-helado.jpg', true, 18),

-- Especialidades
('Profiteroles', 'Profiteroles rellenos de crema y bañados en chocolate', 12000, 'Especialidades', '/img/profiteroles.jpg', true, 8),
('Tarta de Frutas', 'Tarta decorada con frutas frescas de estación', 21000, 'Especialidades', '/img/tarta-frutas.jpg', true, 6),
('Pavlova', 'Merengue crujiente con crema y frutas', 17000, 'Especialidades', '/img/pavlova.jpg', false, 7)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CATEGORÍAS DE PRODUCTOS (Vista auxiliar)
-- ============================================================

-- Crear vista para facilitar consultas por categoría
CREATE OR REPLACE VIEW product_categories AS
SELECT DISTINCT category, COUNT(*) as product_count
FROM public.products
GROUP BY category
ORDER BY category;

-- ============================================================
-- FUNCIÓN PARA GENERAR CÓDIGO DE PEDIDO
-- ============================================================

CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código único: ORD-YYYYMMDD-XXXXX
    code := 'ORD-' || 
            TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
    
    -- Verificar si existe
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE orders.code = code) INTO exists;
    
    -- Si no existe, salir del loop
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER PARA AUTO-GENERAR CÓDIGO DE PEDIDO
-- ============================================================

CREATE OR REPLACE FUNCTION set_order_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_order_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_order_code
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_order_code();

-- ============================================================
-- FUNCIÓN PARA CALCULAR ESTADÍSTICAS DE VENTAS
-- ============================================================

CREATE OR REPLACE FUNCTION get_sales_stats(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  total_items_sold BIGINT,
  most_popular_product TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT o.id)::BIGINT as total_orders,
    COALESCE(SUM(o.total), 0)::NUMERIC as total_revenue,
    COALESCE(AVG(o.total), 0)::NUMERIC as average_order_value,
    COALESCE(SUM(oi.quantity), 0)::BIGINT as total_items_sold,
    (
      SELECT p.name 
      FROM public.order_items oi2
      JOIN public.products p ON p.id = oi2.product_id
      WHERE (start_date IS NULL OR oi2.created_at >= start_date)
        AND (end_date IS NULL OR oi2.created_at <= end_date)
      GROUP BY p.name
      ORDER BY SUM(oi2.quantity) DESC
      LIMIT 1
    ) as most_popular_product
  FROM public.orders o
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  WHERE (start_date IS NULL OR o.created_at >= start_date)
    AND (end_date IS NULL OR o.created_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM get_sales_stats(); -- Todos los tiempos
-- SELECT * FROM get_sales_stats('2024-01-01', '2024-12-31'); -- Año 2024

-- ============================================================
-- VISTA DE PEDIDOS CON INFORMACIÓN COMPLETA
-- ============================================================

CREATE OR REPLACE VIEW orders_full AS
SELECT 
  o.id,
  o.code,
  o.created_at,
  o.status,
  o.total,
  o.discount,
  o.shipping_address,
  p.name as customer_name,
  p.email as customer_email,
  p.phone as customer_phone,
  json_agg(
    json_build_object(
      'product_name', prod.name,
      'quantity', oi.quantity,
      'price', oi.price,
      'subtotal', oi.quantity * oi.price
    )
  ) as items
FROM public.orders o
JOIN public.profiles p ON p.id = o.user_id
LEFT JOIN public.order_items oi ON oi.order_id = o.id
LEFT JOIN public.products prod ON prod.id = oi.product_id
GROUP BY o.id, o.code, o.created_at, o.status, o.total, o.discount, 
         o.shipping_address, p.name, p.email, p.phone
ORDER BY o.created_at DESC;

-- ============================================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ============================================================

-- Índice para búsqueda de texto en productos
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON public.products USING gin(description gin_trgm_ops);

-- Nota: Requiere extensión pg_trgm
-- Si no está habilitada, ejecutar: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- POLÍTICA RLS ADICIONAL PARA VISTAS
-- ============================================================

-- Permitir que usuarios autenticados vean estadísticas básicas
CREATE POLICY "Usuarios pueden ver categorías de productos"
ON public.products FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- FUNCIÓN PARA VALIDAR STOCK ANTES DE CREAR PEDIDO
-- ============================================================

CREATE OR REPLACE FUNCTION check_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  -- Obtener stock disponible
  SELECT stock INTO available_stock
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- Verificar si hay suficiente stock
  IF available_stock IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', available_stock, NEW.quantity;
  END IF;
  
  -- Reducir stock
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentar este trigger si NO quieres gestión automática de stock
/*
CREATE TRIGGER validate_stock_before_order
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION check_product_stock();
*/

-- ============================================================
-- FUNCIÓN PARA RESTAURAR STOCK AL CANCELAR PEDIDO
-- ============================================================

CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si el estado cambia a 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restaurar stock de todos los items del pedido
    UPDATE public.products p
    SET stock = stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentar este trigger si NO quieres gestión automática de stock
/*
CREATE TRIGGER restore_stock_on_order_cancel
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_cancel();
*/

-- ============================================================
-- DATOS DE PRUEBA - USUARIOS ADICIONALES
-- ============================================================

-- Nota: Estos usuarios deben crearse primero en Supabase Auth
-- Luego sus perfiles se crearán automáticamente con el trigger
-- Aquí solo mostramos ejemplos de cómo actualizar benefits

-- Ejemplo: Agregar beneficios a usuarios existentes
/*
UPDATE public.profiles
SET benefits = '["DUOC"]'::jsonb
WHERE email = 'estudiante@duoc.cl';

UPDATE public.profiles
SET benefits = '["&gt;50", "FELICES50"]'::jsonb
WHERE email = 'adultomayor@example.com';
*/

-- ============================================================
-- CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- ============================================================

-- Ver todos los pedidos con sus totales
-- SELECT code, customer_name, customer_email, status, total, created_at FROM orders_full;

-- Ver productos más vendidos
/*
SELECT 
  p.name,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.quantity * oi.price) as total_revenue
FROM public.products p
JOIN public.order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY total_quantity DESC
LIMIT 10;
*/

-- Ver usuarios con más pedidos
/*
SELECT 
  p.name,
  p.email,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM public.profiles p
JOIN public.orders o ON o.user_id = p.id
GROUP BY p.id, p.name, p.email
ORDER BY total_spent DESC
LIMIT 10;
*/

-- Ver estadísticas por estado de pedido
/*
SELECT 
  status,
  COUNT(*) as count,
  SUM(total) as total_amount
FROM public.orders
GROUP BY status
ORDER BY count DESC;
*/

-- ============================================================
-- RESPALDOS Y MANTENIMIENTO
-- ============================================================

-- Crear tabla de auditoría (opcional)
/*
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- ============================================================
-- FINALIZADO
-- ============================================================
