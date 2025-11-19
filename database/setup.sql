-- ============================================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA - PASTELERÍA MIL SABORES
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PASO 1: EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PASO 2: CREAR TABLAS
-- ============================================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con información adicional';
COMMENT ON COLUMN public.profiles.id IS 'UUID del usuario, referencia a auth.users';
COMMENT ON COLUMN public.profiles.email IS 'Correo electrónico del usuario';
COMMENT ON COLUMN public.profiles.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.profiles.phone IS 'Número de teléfono del usuario';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: user o admin';
COMMENT ON COLUMN public.profiles.benefits IS 'Array de beneficios del usuario (DUOC, >50, FELICES50, etc.)';

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.products IS 'Catálogo de productos disponibles';
COMMENT ON COLUMN public.products.featured IS 'Indica si el producto es destacado en la página principal';
COMMENT ON COLUMN public.products.stock IS 'Cantidad disponible en inventario';

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
  shipping_address JSONB NOT NULL,
  payment_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.orders IS 'Pedidos realizados por los usuarios';
COMMENT ON COLUMN public.orders.code IS 'Código único del pedido para seguimiento';
COMMENT ON COLUMN public.orders.status IS 'Estado actual del pedido';
COMMENT ON COLUMN public.orders.shipping_address IS 'Dirección de envío en formato JSON';
COMMENT ON COLUMN public.orders.payment_info IS 'Información de pago (sin datos sensibles)';

-- Tabla de items de pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.order_items IS 'Items individuales de cada pedido';
COMMENT ON COLUMN public.order_items.price IS 'Precio del producto al momento de la compra';

-- ============================================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASO 4: CREAR FUNCIÓN HELPER PARA VERIFICAR ADMIN
-- ============================================================

-- Función que verifica si el usuario actual es admin
-- Usa SECURITY DEFINER para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'Verifica si el usuario actual tiene rol de administrador';

-- ============================================================
-- PASO 5: CREAR POLÍTICAS RLS - PROFILES
-- ============================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles (sin recursión)
CREATE POLICY "Los admins pueden ver todos los perfiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Los admins pueden actualizar todos los perfiles (sin recursión)
CREATE POLICY "Los admins pueden actualizar todos los perfiles"
ON public.profiles FOR UPDATE
USING (public.is_admin());

-- Los admins pueden eliminar perfiles (sin recursión)
CREATE POLICY "Los admins pueden eliminar perfiles"
ON public.profiles FOR DELETE
USING (public.is_admin());

-- Permitir inserción de perfiles (para registro)
CREATE POLICY "Permitir inserción de perfiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- ============================================================
-- PASO 6: CREAR POLÍTICAS RLS - PRODUCTS
-- ============================================================

-- Todos pueden ver los productos
CREATE POLICY "Todos pueden ver los productos"
ON public.products FOR SELECT
USING (true);

-- Solo admins pueden insertar productos (sin recursión)
CREATE POLICY "Solo admins pueden insertar productos"
ON public.products FOR INSERT
WITH CHECK (public.is_admin());

-- Solo admins pueden actualizar productos (sin recursión)
CREATE POLICY "Solo admins pueden actualizar productos"
ON public.products FOR UPDATE
USING (public.is_admin());

-- Solo admins pueden eliminar productos (sin recursión)
CREATE POLICY "Solo admins pueden eliminar productos"
ON public.products FOR DELETE
USING (public.is_admin());

-- ============================================================
-- PASO 6: CREAR POLÍTICAS RLS - ORDERS
-- ============================================================

-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Los usuarios pueden ver sus propios pedidos"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios pedidos
CREATE POLICY "Los usuarios pueden crear sus propios pedidos"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todos los pedidos (sin recursión)
CREATE POLICY "Los admins pueden ver todos los pedidos"
ON public.orders FOR SELECT
USING (public.is_admin());

-- Los admins pueden actualizar todos los pedidos (sin recursión)
CREATE POLICY "Los admins pueden actualizar todos los pedidos"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- ============================================================
-- PASO 7: CREAR POLÍTICAS RLS - ORDER_ITEMS
-- ============================================================

-- Los usuarios pueden ver los items de sus propios pedidos
CREATE POLICY "Los usuarios pueden ver los items de sus propios pedidos"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Los usuarios pueden insertar items en sus propios pedidos
CREATE POLICY "Los usuarios pueden insertar items en sus propios pedidos"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Los admins pueden ver todos los items (sin recursión)
CREATE POLICY "Los admins pueden ver todos los items"
ON public.order_items FOR SELECT
USING (public.is_admin());

-- ============================================================
-- PASO 8: CREAR FUNCIONES
-- ============================================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, benefits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.raw_user_meta_data->>'phone',
    'user',
    '[]'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PASO 9: CREAR TRIGGERS
-- ============================================================

-- Triggers para actualizar updated_at
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_orders
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PASO 10: CREAR ÍNDICES
-- ============================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================
-- PASO 11: INSERTAR DATOS DE PRUEBA - PRODUCTOS
-- ============================================================

INSERT INTO public.products (name, description, price, category, image, featured, stock) VALUES
('Torta de Chocolate', 'Deliciosa torta de chocolate con ganache', 25000, 'Tortas', '/img/torta-chocolate.jpg', true, 10),
('Cheesecake de Frutilla', 'Suave cheesecake con mermelada de frutilla', 22000, 'Tortas', '/img/cheesecake.jpg', true, 8),
('Cupcakes Variados', 'Set de 6 cupcakes con diferentes sabores', 8000, 'Cupcakes', '/img/cupcakes.jpg', false, 20),
('Pie de Limón', 'Tradicional pie de limón con merengue', 18000, 'Pasteles', '/img/pie-limon.jpg', true, 12),
('Brownies', 'Brownies de chocolate con nueces', 6000, 'Brownies', '/img/brownies.jpg', false, 15),
('Torta Tres Leches', 'Esponjosa torta bañada en tres leches', 20000, 'Tortas', '/img/tres-leches.jpg', true, 6),
('Macarons', 'Set de 12 macarons franceses', 15000, 'Macarons', '/img/macarons.jpg', false, 25),
('Tiramisu', 'Clásico postre italiano', 19000, 'Pasteles', '/img/tiramisu.jpg', true, 10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FINALIZADO
-- ============================================================
-- Ahora crea un usuario admin manualmente en el panel de Supabase Auth
-- y luego ejecuta esto reemplazando el email:
-- 
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'tu-email-admin@ejemplo.com';
-- ============================================================
