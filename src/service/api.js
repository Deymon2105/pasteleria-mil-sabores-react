import { supabase } from '../config/supabaseClient';

// Helper para manejar errores de Supabase
const handleSupabaseError = (error, customMessage = 'Error en la operación') => {
  console.error(customMessage, error);
  throw new Error(error.message || customMessage);
};

/**
 * ✅ Helper para reintentar peticiones fallidas por problemas de red
 * Implementa backoff exponencial para evitar saturar el servidor
 * 
 * @param {Function} fn - Función async que retorna una promesa
 * @param {number} maxRetries - Número máximo de reintentos (default: 3)
 * @returns {Promise} - Resultado de la función o error después de todos los reintentos
 * 
 * Ejemplo de uso:
 * const data = await retryRequest(async () => {
 *   return await supabase.from('products').select('*');
 * });
 */
const retryRequest = async (fn, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Solo reintentar si es un error de red/timeout, no errores de validación
      const isNetworkError = 
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('timeout');
      
      if (!isNetworkError || i === maxRetries - 1) {
        // Si no es error de red o ya agotamos reintentos, lanzar error
        throw lastError;
      }
      
      // Backoff exponencial: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      console.warn(`Reintento ${i + 1}/${maxRetries} después de ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

//Helper para verificar autenticación
const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.dispatchEvent(new Event('unauthorized'));
    throw new Error('Usuario no autenticado - se requiere JWT válido'); //Valida que existe una sesión activa con JWT válido
  }
  return session;
};

const requireAdmin = async () => {
  const session = await checkAuth();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error) handleSupabaseError(error, 'Error al validar permisos');
  if (!profile || profile.role !== 'admin') {
    window.dispatchEvent(new Event('forbidden'));
    throw new Error('Acceso restringido: se requiere rol de administrador');
  }

  return session;
};

// Helper para transformar productos de Supabase al formato del frontend
const transformProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    title: product.name,        // name -> title
    desc: product.description,  // description -> desc
    img: product.image          // mantener image pero agregar img
  };
};

// Helper para transformar productos del frontend al formato de Supabase
const transformProductToSupabase = (product) => {
  const { title, desc, img, ...rest } = product;
  return {
    ...rest,
    name: title || product.name,
    description: desc || product.description,
    image: img || product.image
  };
};

export const ORDER_STATUS_MAP = {
  pending: { label: 'Pendiente', badgeColor: '#ffc107' },
  processing: { label: 'Procesando', badgeColor: '#0d6efd' },
  shipped: { label: 'En camino', badgeColor: '#17a2b8' },
  delivered: { label: 'Entregado', badgeColor: '#28a745' },
  cancelled: { label: 'Cancelado', badgeColor: '#dc3545' },
};

const getStatusLabel = (status) => ORDER_STATUS_MAP[status]?.label || status;

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const transformOrderItem = (item) => {
  if (!item) return null;
  const product = item.product || item.products || {};
  const name = product.name || item.name || product.title || '';

  return {
    ...item,
    price: toNumber(item.price),
    quantity: Number(item.quantity) || 0,
    product,
    name,
    title: product.name || item.title || name,
  };
};

const transformOrder = (order) => {
  if (!order) return null;

  const userInfo = order.user || order.profiles || {};
  const shippingAddress = typeof order.shipping_address === 'object' && order.shipping_address !== null
    ? order.shipping_address
    : {};
  const paymentInfo = typeof order.payment_info === 'object' && order.payment_info !== null
    ? order.payment_info
    : order.payment_info;
  const items = Array.isArray(order.order_items)
    ? order.order_items.map(transformOrderItem).filter(Boolean)
    : [];

  return {
    ...order,
    total: toNumber(order.total),
    discount: toNumber(order.discount),
    shipping_address: shippingAddress,
    shippingAddress,
    payment_info: paymentInfo,
    paymentInfo,
    user: userInfo,
    items,
    date: order.created_at,
    customerName: userInfo.name || shippingAddress?.nombre || userInfo.email || '',
    name: userInfo.name || shippingAddress?.nombre || userInfo.email || '',
    statusLabel: getStatusLabel(order.status),
  };
};

// ==================== AUTENTICACIÓN ====================
export const authService = {
  // Login con email y contraseña
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) handleSupabaseError(error, 'Error al iniciar sesión');
    
    // Obtener datos completos del usuario desde la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) handleSupabaseError(profileError, 'Error al obtener perfil');
    
    return {
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          ...profile,
        },
        session: data.session,
      }
    };
  },

  // Registro de nuevo usuario
  register: async (userData) => {
    const { email, password, name, phone, benefits = [] } = userData;
    
    // Crear usuario en Supabase Auth
    // El trigger on_auth_user_created creará automáticamente el perfil
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          benefits: JSON.stringify(benefits), // Pasar benefits al trigger
        },
        emailRedirectTo: window.location.origin
      }
    });
    
    if (authError) handleSupabaseError(authError, 'Error al registrar usuario');
    
    // ✅ MEJORADO: Reintentar con backoff exponencial en lugar de un timeout fijo
    // Esto maneja mejor la race condition con el trigger de base de datos
    let profile = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!profile && attempts < maxAttempts) {
      // Backoff exponencial: 200ms, 400ms, 800ms, 1600ms, 3200ms
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 200));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (!error && data) {
        profile = data;
        break;
      }
      attempts++;
    }
    
    // Si después de 5 intentos no existe, crear manualmente
    let finalProfile = profile;
    if (!profile) {
      console.warn('Trigger no creó el perfil después de 5 intentos, creando manualmente...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email,
          name,
          phone: phone || '',
          role: 'user',
          benefits: benefits,
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error crítico al crear perfil:', createError);
        // Último intento: verificar si existe
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (!retryProfile) {
          throw new Error('No se pudo crear el perfil del usuario');
        }
        finalProfile = retryProfile;
      } else {
        finalProfile = newProfile;
      }
    }
    
    return {
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          ...finalProfile,
        },
        session: authData.session,
      }
    };
  },

  // Cerrar sesión
  logout: async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) handleSupabaseError(error, 'Error al cerrar sesión');
    
    // Limpiar localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  },

  // Obtener sesión actual
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) handleSupabaseError(error, 'Error al obtener sesión');
    return data.session;
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) handleSupabaseError(error, 'Error al obtener usuario');
    
    if (!user) return null;
    
    // Obtener perfil completo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) return { id: user.id, email: user.email };
    
    return {
      id: user.id,
      email: user.email,
      ...profile,
    };
  },
};

// ==================== PRODUCTOS ====================
export const productService = {
  /**
   * ✅ Obtener todos los productos con paginación opcional
   * @param {number} page - Número de página (default: null para todos)
   * @param {number} pageSize - Tamaño de página (default: null para todos)
   * @returns {Object} { data: [], total, page, pageSize, totalPages } o { data: [] }
   */
  getAll: async (page = null, pageSize = null) => {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Solo aplicar paginación si se especifican ambos parámetros
    if (page !== null && pageSize !== null) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }
    
    const { data, error, count } = await query;
    
    if (error) handleSupabaseError(error, 'Error al obtener productos');
    
    // Transformar productos al formato del frontend
    const transformedData = data ? data.map(transformProduct) : [];
    
    // Si hay paginación, retornar metadata
    if (page !== null && pageSize !== null) {
      return { 
        data: transformedData,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
    
    // Sin paginación, retornar solo los datos
    return { data: transformedData };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error, 'Error al obtener producto');
    
    // Transformar producto al formato del frontend
    return { data: transformProduct(data) };
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'Error al obtener productos destacados');
    
    // Transformar productos al formato del frontend
    const transformedData = data ? data.map(transformProduct) : [];
    return { data: transformedData };
  },

  create: async (product) => {
    await requireAdmin();
    
    // Transformar producto al formato de Supabase
    const productData = transformProductToSupabase(product);
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'Error al crear producto');
    
    return { data: transformProduct(data) };
  },

  update: async (id, product) => {
    await requireAdmin();
    
    // Transformar producto al formato de Supabase
    const productData = transformProductToSupabase(product);
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'Error al actualizar producto');
    
    return { data: transformProduct(data) };
  },

  delete: async (id) => {
    await requireAdmin();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error, 'Error al eliminar producto');
    return { success: true };
  },

  /**
   * ✅ NUEVO - Buscar productos por nombre o descripción
   * @param {string} query - Texto a buscar
   * @returns {Object} { data: [] } - Productos que coinciden con la búsqueda
   */
  search: async (query) => {
    if (!query || query.trim() === '') {
      // Si no hay query, retornar todos los productos
      return productService.getAll();
    }

    const searchTerm = `%${query.trim()}%`;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'Error al buscar productos');
    
    const transformedData = data ? data.map(transformProduct) : [];
    return { data: transformedData };
  },
};

// ==================== USUARIOS ====================
export const userService = {
  // Login - redirige a authService
  login: async (credentials) => {
    return await authService.login(credentials.email, credentials.password);
  },

  // Register - redirige a authService
  register: async (userData) => {
    return await authService.register(userData);
  },

  getAll: async () => {
    await requireAdmin();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'Error al obtener usuarios');
    return { data };
  },

  getById: async (id) => {
    await requireAdmin();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error, 'Error al obtener usuario');
    return { data };
  },

  update: async (id, userData) => {
    await requireAdmin();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'Error al actualizar usuario');
    return { data };
  },

  delete: async (id) => {
    await requireAdmin();
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error, 'Error al eliminar usuario');
    return { data: { success: true } };
  },
};

// ==================== PEDIDOS ====================
export const orderService = {
  /**
   * ✅ Obtener todos los pedidos (solo admin) con paginación
   * @param {number} page - Número de página (default: 1)
   * @param {number} pageSize - Tamaño de página (default: 20)
   * @returns {Object} { data: [], total, page, pageSize, totalPages }
   */
  getAll: async (page = 1, pageSize = 20) => {
    await requireAdmin();
    
    // Calcular rango para paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, name, email),
        order_items(
          id,
          order_id,
          product_id,
          quantity,
          price,
          product:products(id, name, price, image)
        )
      `, { count: 'exact' }) // ✅ Obtener conteo total
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'Error al obtener pedidos');
    const transformed = Array.isArray(data) ? data.map(transformOrder) : [];
    
    return { 
      data: transformed,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  getById: async (id) => {
    await requireAdmin();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, name, email),
        order_items(
          id,
          order_id,
          product_id,
          quantity,
          price,
          product:products(id, name, price, image)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error, 'Error al obtener pedido');
    return { data: transformOrder(data) };
  },

  create: async (orderData) => {
    await checkAuth();
    
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        code: orderData.code,
        status: orderData.status || 'pending',
        total: orderData.total,
        discount: orderData.discount || 0,
        shipping_address: orderData.shippingAddress,
        payment_info: orderData.paymentInfo,
        notes: orderData.notes,
      }])
      .select()
      .single();
    
    if (orderError) handleSupabaseError(orderError, 'Error al crear pedido');
    
    // Crear los items del pedido
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId || item.id,
        quantity: item.quantity || item.qty,
        price: item.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) handleSupabaseError(itemsError, 'Error al crear items del pedido');
    }
    
    return orderService.getById(order.id);
  },

  updateStatus: async (id, status) => {
    await requireAdmin();
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'Error al actualizar estado del pedido');
    // Recuperar el pedido completo para mantener estructura consistente
    return orderService.getById(id);
  },

  /**
   * ✅ NUEVO - Obtener pedidos del usuario actual
   * Permite a los usuarios ver su historial de compras
   * @returns {Object} { data: [] } - Lista de pedidos del usuario autenticado
   */
  getMyOrders: async () => {
    const session = await checkAuth();
    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          product:products(id, name, image, price)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'Error al obtener mis pedidos');
    
    const transformed = Array.isArray(data) ? data.map(transformOrder) : [];
    return { data: transformed };
  },
};

// Mantener compatibilidad con código legacy
export const setAuthToken = () => {
  console.warn('setAuthToken ya no es necesario con Supabase');
};

export const getAuthToken = async () => {
  const session = await supabase.auth.getSession();
  return session.data.session?.access_token || null;
};

export const clearAuthToken = async () => {
  await authService.logout();
};

export default supabase;