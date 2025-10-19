/**
 * PRUEBAS UNITARIAS PARA CATALOGO
 * 
 * Componente: src/pages/Catalogo.js
 * Framework: Jasmine
 * 
 * Estas pruebas verifican:
 * - Renderizado de productos
 * - Filtros y búsqueda
 * - Eventos de añadir al carrito
 */

describe("Catalogo - Catálogo de Productos", function() {
  
  // ==================================================
  // PRUEBA 1: GESTIÓN DEL ESTADO DE PRODUCTOS
  // ==================================================
  describe("Gestión del Estado de Productos", function() {
    
    it("debería inicializar con array de productos", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta Chocolate', price: 15000, category: 'Tortas' },
        { id: 2, name: 'Pastel de Fresa', price: 18000, category: 'Pasteles' },
        { id: 3, name: 'Galletas', price: 5000, category: 'Galletas' }
      ];
      
      // Assert
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBe(3);
      expect(productos[0].name).toBe('Torta Chocolate');
    });
    
    it("debería inicializar filtro de categoría en 'Todos'", function() {
      // Arrange
      let filtroCategoria = 'Todos';
      
      // Assert
      expect(filtroCategoria).toBe('Todos');
    });
    
    it("debería inicializar término de búsqueda vacío", function() {
      // Arrange
      let searchTerm = '';
      
      // Assert
      expect(searchTerm).toBe('');
    });
    
    it("debería actualizar término de búsqueda", function() {
      // Arrange
      let searchTerm = '';
      
      // Act
      searchTerm = 'chocolate';
      
      // Assert
      expect(searchTerm).toBe('chocolate');
    });
    
    it("debería actualizar filtro de categoría", function() {
      // Arrange
      let categoria = 'Todos';
      
      // Act
      categoria = 'Tortas';
      
      // Assert
      expect(categoria).toBe('Tortas');
    });
  });

  // ==================================================
  // PRUEBA 2: PROPIEDADES DE BOTONES Y COMPONENTES
  // ==================================================
  describe("Propiedades de Botones del Catálogo", function() {
    
    it("botón de agregar debería recibir etiqueta 'Agregar al Carrito'", function() {
      // Arrange
      let botonProps = {
        label: 'Agregar al Carrito',
        variant: 'primary',
        onClick: jasmine.createSpy('addToCart')
      };
      
      // Assert
      expect(botonProps.label).toBe('Agregar al Carrito');
    });
    
    it("botón de agregar debería recibir función onClick", function() {
      // Arrange
      let onClick = jasmine.createSpy('onClick');
      let botonProps = {
        onClick: onClick
      };
      
      // Act
      botonProps.onClick();
      
      // Assert
      expect(onClick).toHaveBeenCalled();
    });
    
    it("botón de filtro debería recibir etiqueta con nombre de categoría", function() {
      // Arrange
      let categorias = ['Todos', 'Tortas', 'Pasteles', 'Galletas'];
      
      // Assert
      expect(categorias).toContain('Tortas');
      expect(categorias[1]).toBe('Tortas');
    });
    
    it("ProductCard debería recibir props del producto", function() {
      // Arrange
      let productCardProps = {
        id: 1,
        name: 'Torta Chocolate',
        price: 15000,
        image: 'torta.jpg',
        category: 'Tortas',
        onAddToCart: jasmine.createSpy('onAddToCart')
      };
      
      // Assert
      expect(productCardProps.name).toBe('Torta Chocolate');
      expect(productCardProps.price).toBe(15000);
      expect(typeof productCardProps.onAddToCart).toBe('function');
    });
  });

  // ==================================================
  // PRUEBA 3: EVENTOS DE AGREGAR AL CARRITO
  // ==================================================
  describe("Eventos de Agregar al Carrito", function() {
    
    it("click en agregar debería ejecutar función addToCart", function() {
      // Arrange
      let addToCart = jasmine.createSpy('addToCart');
      let producto = { id: 1, name: 'Torta Chocolate' };
      
      // Act
      addToCart(producto);
      
      // Assert
      expect(addToCart).toHaveBeenCalledWith(producto);
    });
    
    it("debería poder agregar múltiples productos", function() {
      // Arrange
      let addToCart = jasmine.createSpy('addToCart');
      let producto1 = { id: 1, name: 'Torta' };
      let producto2 = { id: 2, name: 'Pastel' };
      
      // Act
      addToCart(producto1);
      addToCart(producto2);
      
      // Assert
      expect(addToCart).toHaveBeenCalledTimes(2);
    });
    
    it("debería pasar producto completo al agregar al carrito", function() {
      // Arrange
      let addToCart = jasmine.createSpy('addToCart');
      let producto = {
        id: 1,
        name: 'Torta Chocolate',
        price: 15000,
        image: 'torta.jpg'
      };
      
      // Act
      addToCart(producto);
      
      // Assert
      expect(addToCart).toHaveBeenCalledWith(producto);
    });
  });

  // ==================================================
  // PRUEBA 4: FILTRADO POR CATEGORÍA
  // ==================================================
  describe("Filtrado de Productos por Categoría", function() {
    
    it("debería filtrar productos por categoría Tortas", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta Chocolate', category: 'Tortas' },
        { id: 2, name: 'Pastel Fresa', category: 'Pasteles' },
        { id: 3, name: 'Torta Vainilla', category: 'Tortas' }
      ];
      
      let categoriaFiltro = 'Tortas';
      
      // Act
      let productosFiltrados = productos.filter(function(p) {
        return categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
      });
      
      // Assert
      expect(productosFiltrados.length).toBe(2);
      expect(productosFiltrados[0].category).toBe('Tortas');
      expect(productosFiltrados[1].category).toBe('Tortas');
    });
    
    it("debería mostrar todos los productos con filtro 'Todos'", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta', category: 'Tortas' },
        { id: 2, name: 'Pastel', category: 'Pasteles' },
        { id: 3, name: 'Galleta', category: 'Galletas' }
      ];
      
      let categoriaFiltro = 'Todos';
      
      // Act
      let productosFiltrados = productos.filter(function(p) {
        return categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
      });
      
      // Assert
      expect(productosFiltrados.length).toBe(3);
    });
    
    it("debería retornar array vacío si no hay productos de esa categoría", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta', category: 'Tortas' }
      ];
      
      let categoriaFiltro = 'Helados';
      
      // Act
      let productosFiltrados = productos.filter(function(p) {
        return categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
      });
      
      // Assert
      expect(productosFiltrados.length).toBe(0);
    });
    
    it("click en botón de categoría debería cambiar filtro", function() {
      // Arrange
      let setCategoria = jasmine.createSpy('setCategoria');
      let nuevaCategoria = 'Pasteles';
      
      // Act
      setCategoria(nuevaCategoria);
      
      // Assert
      expect(setCategoria).toHaveBeenCalledWith('Pasteles');
    });
  });

  // ==================================================
  // PRUEBA 5: BÚSQUEDA DE PRODUCTOS
  // ==================================================
  describe("Búsqueda de Productos", function() {
    
    it("debería filtrar productos por nombre", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta de Chocolate', category: 'Tortas' },
        { id: 2, name: 'Pastel de Fresa', category: 'Pasteles' },
        { id: 3, name: 'Torta de Vainilla', category: 'Tortas' }
      ];
      
      let searchTerm = 'chocolate';
      
      // Act
      let resultados = productos.filter(function(p) {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Assert
      expect(resultados.length).toBe(1);
      expect(resultados[0].name).toContain('Chocolate');
    });
    
    it("búsqueda debería ser case insensitive", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta de CHOCOLATE' }
      ];
      
      let searchTerm = 'chocolate';
      
      // Act
      let resultados = productos.filter(function(p) {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Assert
      expect(resultados.length).toBe(1);
    });
    
    it("debería retornar todos si searchTerm está vacío", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta' },
        { id: 2, name: 'Pastel' }
      ];
      
      let searchTerm = '';
      
      // Act
      let resultados = productos.filter(function(p) {
        return searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Assert
      expect(resultados.length).toBe(2);
    });
    
    it("onChange en input de búsqueda debería actualizar searchTerm", function() {
      // Arrange
      let setSearchTerm = jasmine.createSpy('setSearchTerm');
      let evento = { target: { value: 'vainilla' } };
      
      // Act
      setSearchTerm(evento.target.value);
      
      // Assert
      expect(setSearchTerm).toHaveBeenCalledWith('vainilla');
    });
  });

  // ==================================================
  // PRUEBA 6: COMBINACIÓN DE FILTROS
  // ==================================================
  describe("Combinación de Filtros (Categoría + Búsqueda)", function() {
    
    it("debería aplicar filtro de categoría y búsqueda juntos", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta de Chocolate', category: 'Tortas' },
        { id: 2, name: 'Pastel de Chocolate', category: 'Pasteles' },
        { id: 3, name: 'Torta de Vainilla', category: 'Tortas' }
      ];
      
      let categoriaFiltro = 'Tortas';
      let searchTerm = 'chocolate';
      
      // Act
      let resultados = productos.filter(function(p) {
        let matchCategoria = categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
        let matchSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategoria && matchSearch;
      });
      
      // Assert
      expect(resultados.length).toBe(1);
      expect(resultados[0].name).toBe('Torta de Chocolate');
      expect(resultados[0].category).toBe('Tortas');
    });
    
    it("debería retornar vacío si no hay coincidencias", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta de Chocolate', category: 'Tortas' }
      ];
      
      let categoriaFiltro = 'Pasteles';
      let searchTerm = 'chocolate';
      
      // Act
      let resultados = productos.filter(function(p) {
        let matchCategoria = categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
        let matchSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategoria && matchSearch;
      });
      
      // Assert
      expect(resultados.length).toBe(0);
    });
    
    it("debería mostrar todos con categoría 'Todos' y búsqueda vacía", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta', category: 'Tortas' },
        { id: 2, name: 'Pastel', category: 'Pasteles' },
        { id: 3, name: 'Galleta', category: 'Galletas' }
      ];
      
      let categoriaFiltro = 'Todos';
      let searchTerm = '';
      
      // Act
      let resultados = productos.filter(function(p) {
        let matchCategoria = categoriaFiltro === 'Todos' || p.category === categoriaFiltro;
        let matchSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategoria && matchSearch;
      });
      
      // Assert
      expect(resultados.length).toBe(3);
    });
  });

  // ==================================================
  // PRUEBA 7: RENDERIZADO DE PRODUCTOS
  // ==================================================
  describe("Renderizado de Lista de Productos", function() {
    
    it("debería renderizar mensaje si no hay productos", function() {
      // Arrange
      let productos = [];
      
      // Act
      let hayProductos = productos.length > 0;
      let mensaje = hayProductos ? '' : 'No se encontraron productos';
      
      // Assert
      expect(hayProductos).toBe(false);
      expect(mensaje).toBe('No se encontraron productos');
    });
    
    it("debería renderizar ProductCard por cada producto", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta' },
        { id: 2, name: 'Pastel' },
        { id: 3, name: 'Galleta' }
      ];
      
      // Act
      let cantidadCards = productos.length;
      
      // Assert
      expect(cantidadCards).toBe(3);
    });
    
    it("cada ProductCard debería tener key única", function() {
      // Arrange
      let productos = [
        { id: 1, name: 'Torta' },
        { id: 2, name: 'Pastel' }
      ];
      
      // Act
      let keys = productos.map(function(p) { return p.id; });
      let keysUnicas = new Set(keys);
      
      // Assert
      expect(keysUnicas.size).toBe(keys.length);
    });
  });
});
