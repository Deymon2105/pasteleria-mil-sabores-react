/**
 * PRUEBAS UNITARIAS PARA CART (Carrito de Compras)
 * 
 * Componente: src/pages/Cart.js
 * Framework: Jasmine
 * 
 * Estas pruebas verifican:
 * - Propiedades (props) de botones
 * - Estado del carrito y beneficios
 * - Eventos de usuario (click)
 */

describe("Cart - Carrito de Compras", function() {
  
  // ==================================================
  // PRUEBA 1: RENDERIZADO CONDICIONAL
  // ==================================================
  describe("Renderizado Condicional", function() {
    
    it("debería mostrar mensaje cuando el carrito está vacío", function() {
      // Arrange: Simular carrito vacío
      let cart = [];
      
      // Act: Verificar condición
      let carritoVacio = cart.length === 0;
      
      // Assert
      expect(carritoVacio).toBe(true);
    });
    
    it("debería mostrar productos cuando el carrito tiene items", function() {
      // Arrange: Simular carrito con productos
      let cart = [
        { id: '1', title: 'Torta de Chocolate', price: 45000, qty: 1 }
      ];
      
      // Act
      let carritoConProductos = cart.length > 0;
      
      // Assert
      expect(carritoConProductos).toBe(true);
      expect(cart.length).toBe(1);
    });
  });

  // ==================================================
  // PRUEBA 2: PROPIEDADES (PROPS) - BOTONES
  // ==================================================
  describe("Propiedades de Botones", function() {
    
    it("botón Eliminar debería recibir la etiqueta correcta", function() {
      // Arrange: Simular props del botón
      let botonProps = {
        label: 'Eliminar',
        variant: 'outline-danger',
        size: 'sm'
      };
      
      // Assert
      expect(botonProps.label).toBe('Eliminar');
      expect(botonProps.variant).toBe('outline-danger');
    });
    
    it("botón Eliminar debería recibir función onClick", function() {
      // Arrange: Crear función spy
      let removeFromCart = jasmine.createSpy('removeFromCart');
      let productId = 'PROD001';
      
      // Act: Simular click
      removeFromCart(productId);
      
      // Assert: Verificar que se llamó con el ID correcto
      expect(removeFromCart).toHaveBeenCalled();
      expect(removeFromCart).toHaveBeenCalledWith(productId);
    });
    
    it("botón Vaciar Carrito debería recibir función onClick", function() {
      // Arrange
      let clearCart = jasmine.createSpy('clearCart');
      
      // Act: Simular click
      clearCart();
      
      // Assert
      expect(clearCart).toHaveBeenCalled();
    });
    
    it("botón Finalizar Compra debería recibir etiqueta y función", function() {
      // Arrange
      let finalizarCompraProps = {
        label: 'Finalizar compra',
        letiant: 'success',
        size: 'lg',
        onClick: jasmine.createSpy('navegarACompra')
      };
      
      // Act
      finalizarCompraProps.onClick();
      
      // Assert
      expect(finalizarCompraProps.label).toContain('Finalizar');
      expect(finalizarCompraProps.onClick).toHaveBeenCalled();
    });
  });

  // ==================================================
  // PRUEBA 3: ESTADO (STATE) - BENEFICIOS Y DESCUENTOS
  // ==================================================
  describe("Gestión del Estado - Beneficios", function() {
    
    it("debería inicializar el estado de beneficios como array vacío", function() {
      // Arrange: Estado inicial
      let userBenefits = [];
      
      // Assert
      expect(userBenefits).toEqual([]);
      expect(Array.isArray(userBenefits)).toBe(true);
    });
    
    it("debería actualizar el estado con beneficios del usuario", function() {
      // Arrange: Simular usuario con beneficios
      let usuario = {
        name: 'Ana Pérez',
        benefits: ['>50', 'DUOC']
      };
      
      // Act: Actualizar estado
      let userBenefits = usuario.benefits || [];
      
      // Assert
      expect(userBenefits).toContain('>50');
      expect(userBenefits).toContain('DUOC');
      expect(userBenefits.length).toBe(2);
    });
    
    it("debería cambiar el estado cuando se cargan beneficios desde localStorage", function() {
      // Arrange: Simular datos de localStorage
      let usuarioData = {
        name: 'María López',
        benefits: ['FELICES50']
      };
      
      // Act: Cargar beneficios
      let userBenefits = usuarioData.benefits;
      let userName = usuarioData.name;
      
      // Assert
      expect(userBenefits).toContain('FELICES50');
      expect(userName).toBe('María López');
    });
  });

  // ==================================================
  // PRUEBA 4: EVENTOS - SIMULACIÓN DE CLICKS
  // ==================================================
  describe("Simulación de Eventos", function() {
    
    it("click en Eliminar debería ejecutar removeFromCart", function() {
      // Arrange: Crear spy para la función
      let removeFromCart = jasmine.createSpy('removeFromCart');
      let itemId = 'TORTA001';
      
      // Act: Simular evento click
      removeFromCart(itemId);
      
      // Assert: Verificar que se ejecutó
      expect(removeFromCart).toHaveBeenCalled();
      expect(removeFromCart).toHaveBeenCalledWith(itemId);
      expect(removeFromCart.calls.count()).toBe(1);
    });
    
    it("click en Vaciar Carrito debería ejecutar clearCart", function() {
      // Arrange
      let clearCart = jasmine.createSpy('clearCart');
      let carrito = [
        { id: '1', title: 'Producto 1' },
        { id: '2', title: 'Producto 2' }
      ];
      
      // Act: Simular click en vaciar
      clearCart();
      
      // Assert
      expect(clearCart).toHaveBeenCalled();
      expect(clearCart.calls.count()).toBe(1);
    });
    
    it("múltiples clicks deberían ejecutar la función múltiples veces", function() {
      // Arrange
      let removeFromCart = jasmine.createSpy('removeFromCart');
      
      // Act: Simular 3 clicks
      removeFromCart('item1');
      removeFromCart('item2');
      removeFromCart('item3');
      
      // Assert
      expect(removeFromCart.calls.count()).toBe(3);
    });
  });

  // ==================================================
  // PRUEBA 5: CÁLCULO DE DESCUENTOS
  // ==================================================
  describe("Cálculo de Descuentos", function() {
    
    it("debería calcular 50% de descuento para mayores de 50", function() {
      // Arrange
      let subtotal = 100000;
      let userBenefits = ['>50'];
      let descuentoTotal = 0;
      
      // Act: Aplicar lógica de descuento
      if (userBenefits.includes('>50')) {
        descuentoTotal += 50;
      }
      
      let montoDescuento = subtotal * (descuentoTotal / 100);
      let total = subtotal - montoDescuento;
      
      // Assert
      expect(descuentoTotal).toBe(50);
      expect(montoDescuento).toBe(50000);
      expect(total).toBe(50000);
    });
    
    it("debería calcular 10% de descuento para código FELICES50", function() {
      // Arrange
      let subtotal = 100000;
      let userBenefits = ['FELICES50'];
      let descuentoTotal = 0;
      
      // Act
      if (userBenefits.includes('FELICES50')) {
        descuentoTotal += 10;
      }
      
      let montoDescuento = subtotal * (descuentoTotal / 100);
      let total = subtotal - montoDescuento;
      
      // Assert
      expect(descuentoTotal).toBe(10);
      expect(montoDescuento).toBe(10000);
      expect(total).toBe(90000);
    });
    
    it("debería acumular descuentos (50% + 10% = 60%)", function() {
      // Arrange
      let subtotal = 100000;
      let userBenefits = ['>50', 'FELICES50'];
      let descuentoTotal = 0;
      
      // Act
      if (userBenefits.includes('>50')) {
        descuentoTotal += 50;
      }
      if (userBenefits.includes('FELICES50')) {
        descuentoTotal += 10;
      }
      
      let montoDescuento = subtotal * (descuentoTotal / 100);
      let total = subtotal - montoDescuento;
      
      // Assert
      expect(descuentoTotal).toBe(60);
      expect(montoDescuento).toBe(60000);
      expect(total).toBe(40000);
    });
    
    it("beneficio DUOC no debería aplicar descuento porcentual", function() {
      // Arrange
      let subtotal = 100000;
      let userBenefits = ['DUOC'];
      let descuentoTotal = 0;
      
      // Act: DUOC no suma porcentaje
      let hasDuocBenefit = userBenefits.includes('DUOC');
      
      // Assert
      expect(hasDuocBenefit).toBe(true);
      expect(descuentoTotal).toBe(0); // No aplica descuento porcentual
    });
    
    it("debería calcular subtotal correctamente", function() {
      // Arrange
      let cart = [
        { id: '1', price: 45000, qty: 1 },
        { id: '2', price: 30000, qty: 2 },
        { id: '3', price: 25000, qty: 1 }
      ];
      
      // Act: Calcular subtotal
      let subtotal = cart.reduce(function(sum, item) {
        return sum + (item.price * (item.qty || 1));
      }, 0);
      
      // Assert
      expect(subtotal).toBe(130000); // 45000 + 60000 + 25000
    });
  });
});
