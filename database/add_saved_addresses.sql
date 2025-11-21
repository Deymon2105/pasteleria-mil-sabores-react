-- ========================================
-- Tabla para guardar direcciones de usuarios
-- ========================================
-- Esta tabla permite a usuarios autenticados guardar sus direcciones
-- para reutilizarlas en futuras compras

-- 1. Crear tabla de direcciones guardadas
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL, -- Ej: "Casa", "Trabajo", "Oficina"
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  calle VARCHAR(255) NOT NULL,
  depto VARCHAR(100),
  codigo_postal VARCHAR(20),
  region VARCHAR(100) NOT NULL,
  comuna VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices para mejorar rendimiento
CREATE INDEX idx_saved_addresses_user_id ON public.saved_addresses(user_id);
CREATE INDEX idx_saved_addresses_default ON public.saved_addresses(user_id, is_default) WHERE is_default = true;

-- 3. Habilitar RLS
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Los usuarios solo pueden ver, crear, actualizar y eliminar sus propias direcciones
CREATE POLICY "Users can view own addresses" 
ON public.saved_addresses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses" 
ON public.saved_addresses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" 
ON public.saved_addresses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" 
ON public.saved_addresses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Los admins pueden ver todas las direcciones
CREATE POLICY "Admins can view all addresses" 
ON public.saved_addresses 
FOR SELECT 
USING (public.is_admin());

-- 5. Trigger para actualizar updated_at
CREATE TRIGGER set_updated_at_saved_addresses 
BEFORE UPDATE ON public.saved_addresses 
FOR EACH ROW 
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Función para asegurar solo una dirección por defecto por usuario
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Desmarcar todas las otras direcciones del mismo usuario
    UPDATE public.saved_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default 
BEFORE INSERT OR UPDATE ON public.saved_addresses 
FOR EACH ROW 
WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.ensure_single_default_address();
