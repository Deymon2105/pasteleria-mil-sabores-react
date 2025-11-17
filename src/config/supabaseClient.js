import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Refresca automáticamente el JWT antes de que expire
    autoRefreshToken: true,
    // Persiste la sesión en sessionStorage (se borra al cerrar navegador)
    persistSession: true,
    // Detecta tokens en la URL (útil para magic links)
    detectSessionInUrl: true,
    // sessionStorage es más seguro que localStorage para tokens
    storage: window.sessionStorage,
  },
});
