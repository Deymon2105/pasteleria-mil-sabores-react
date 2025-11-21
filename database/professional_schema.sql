-- ============================================================
-- PROFESSIONAL DATABASE SCHEMA - PASTELERÍA MIL SABORES
-- Version: 2.0 (Expert Edition)
-- ============================================================

-- ⚠️ DANGER ZONE: This script wipes the entire database!
-- It drops all tables, types, functions, and triggers to ensure a clean slate.

BEGIN;

-- 1. CLEANUP ROUTINE
-- We use CASCADE to ensure all dependent objects are removed
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_stock_availability() CASCADE;
DROP FUNCTION IF EXISTS public.update_stock_after_order() CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ENUM TYPES
-- Using ENUMs ensures data integrity by restricting values at the database level
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- 4. TABLES

-- --- PROFILES TABLE ---
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.profiles IS 'Extended user profile information linked to Supabase Auth';
COMMENT ON COLUMN public.profiles.benefits IS 'JSON array of user benefits/tags (e.g., ["VIP", "Employee"])';

-- --- PRODUCTS TABLE ---
CREATE TABLE public.products (
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

COMMENT ON TABLE public.products IS 'Product catalog with inventory tracking';

-- --- ORDERS TABLE ---
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guest checkout
  code TEXT UNIQUE NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
  shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
  shipping_address JSONB NOT NULL,
  payment_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.orders IS 'Sales orders. user_id is null for guest checkouts.';

-- --- ORDER ITEMS TABLE ---
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT, -- Prevent deleting products that have sales
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.order_items IS 'Line items for each order. Snapshots price at time of purchase.';

-- 5. INDEXES
-- Optimizing query performance for common access patterns
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- 6. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());
CREATE POLICY "Enable insert for registration" ON public.profiles FOR INSERT WITH CHECK (true);

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- 7. TRIGGERS AND PROCEDURES

-- A. Automatic Timestamp Updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Automatic Profile Creation
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
    -- Parse benefits from metadata (stringified JSON) or default to empty array
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'benefits', '')::jsonb,
      '[]'::jsonb
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists on auth.users to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- C. Stock Management Logic

-- Function to check stock availability BEFORE inserting an item
CREATE OR REPLACE FUNCTION public.check_stock_availability()
RETURNS TRIGGER AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  SELECT stock, name INTO current_stock, product_name
  FROM public.products
  WHERE id = NEW.product_id;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado (ID: %)', NEW.product_id;
  END IF;

  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, Solicitado: %', product_name, current_stock, NEW.quantity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stock_before_insert
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.check_stock_availability();

-- Function to decrement stock AFTER inserting an item
CREATE OR REPLACE FUNCTION public.update_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_stock_after_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_after_order();

-- 8. SEED DATA
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

COMMIT;
