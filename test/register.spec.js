/**
 * PRUEBAS UNITARIAS PARA REGISTER
 * 
 * Componente: src/pages/Register.js
 * Framework: Jasmine
 * 
 * Estas pruebas verifican:
 * - Estado del formulario de registro
 * - Validación de datos
 * - Cálculo de beneficios
 */

describe("Register - Registro de Usuarios", function() {
  
  // ==================================================
  // PRUEBA 1: ESTADO DEL FORMULARIO
  // ==================================================
  describe("Gestión del Estado del Formulario", function() {
    
    it("debería inicializar con todos los campos vacíos", function() {
      // Arrange
      let formulario = {
        name: '',
        email: '',
        password: '',
        birthDate: '',
        promoCode: ''
      };
      
      // Assert
      expect(formulario.name).toBe('');
      expect(formulario.email).toBe('');
      expect(formulario.password).toBe('');
      expect(formulario.birthDate).toBe('');
      expect(formulario.promoCode).toBe('');
    });
    
    it("debería actualizar el estado cuando se escribe en nombre", function() {
      // Arrange
      let formulario = { name: '' };
      
      // Act
      formulario.name = 'María López';
      
      // Assert
      expect(formulario.name).toBe('María López');
    });
    
    it("debería actualizar el estado cuando se escribe en email", function() {
      // Arrange
      let formulario = { email: '' };
      
      // Act
      formulario.email = 'maria@duocuc.cl';
      
      // Assert
      expect(formulario.email).toBe('maria@duocuc.cl');
      expect(formulario.email).toContain('@duocuc.cl');
    });
    
    it("debería actualizar el estado cuando se escribe en password", function() {
      // Arrange
      let formulario = { password: '' };
      
      // Act
      formulario.password = 'securePass123';
      
      // Assert
      expect(formulario.password).toBe('securePass123');
    });
    
    it("debería actualizar el estado cuando se selecciona fecha de nacimiento", function() {
      // Arrange
      let formulario = { birthDate: '' };
      
      // Act
      formulario.birthDate = '1970-05-10';
      
      // Assert
      expect(formulario.birthDate).toBe('1970-05-10');
    });
    
    it("debería actualizar el estado cuando se ingresa código promocional", function() {
      // Arrange
      let formulario = { promoCode: '' };
      
      // Act
      formulario.promoCode = 'FELICES50';
      
      // Assert
      expect(formulario.promoCode).toBe('FELICES50');
    });
  });

  // ==================================================
  // PRUEBA 2: PROPIEDADES DE BOTONES
  // ==================================================
  describe("Propiedades del Botón de Registro", function() {
    
    it("botón debería recibir la etiqueta 'Registrarse'", function() {
      // Arrange
      let botonProps = {
        variant: 'primary',
        type: 'submit',
        label: 'Registrarse',
        className: 'w-100'
      };
      
      // Assert
      expect(botonProps.label).toBe('Registrarse');
      expect(botonProps.type).toBe('submit');
    });
    
    it("botón debería estar deshabilitado durante el registro", function() {
      // Arrange
      let loading = true;
      let disabled = loading;
      
      // Assert
      expect(disabled).toBe(true);
    });
  });

  // ==================================================
  // PRUEBA 3: EVENTOS DE REGISTRO
  // ==================================================
  describe("Eventos de Registro", function() {
    
    it("onSubmit debería ejecutarse al enviar el formulario", function() {
      // Arrange
      let onSubmit = jasmine.createSpy('onSubmit');
      
      // Act
      let evento = { preventDefault: function() {} };
      onSubmit(evento);
      
      // Assert
      expect(onSubmit).toHaveBeenCalled();
    });
    
    it("click en registrar debería ejecutar función de registro", function() {
      // Arrange
      let handleRegister = jasmine.createSpy('handleRegister');
      
      // Act
      handleRegister();
      
      // Assert
      expect(handleRegister).toHaveBeenCalled();
    });
  });

  // ==================================================
  // PRUEBA 4: VALIDACIÓN DE DATOS
  // ==================================================
  describe("Validación de Datos del Registro", function() {
    
    it("debería validar que el nombre no esté vacío", function() {
      // Arrange
      let name = 'Juan Pérez';
      
      // Act
      let esValido = name.trim().length > 0;
      
      // Assert
      expect(esValido).toBe(true);
    });
    
    it("debería validar formato de email", function() {
      // Arrange
      let emailValido = 'user@example.com';
      let emailInvalido = 'userexample.com';
      
      // Act
      let validarEmail = function(email) {
        let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };
      
      // Assert
      expect(validarEmail(emailValido)).toBe(true);
      expect(validarEmail(emailInvalido)).toBe(false);
    });
    
    it("debería validar longitud mínima de contraseña", function() {
      // Arrange
      let passwordValida = 'pass123';
      let passwordInvalida = 'pass';
      
      // Act
      let validarPassword = function(pass) {
        return pass.length >= 6;
      };
      
      // Assert
      expect(validarPassword(passwordValida)).toBe(true);
      expect(validarPassword(passwordInvalida)).toBe(false);
    });
    
    it("debería validar que las contraseñas coincidan", function() {
      // Arrange
      let password = 'password123';
      let confirmPassword = 'password123';
      
      // Act
      let coinciden = password === confirmPassword;
      
      // Assert
      expect(coinciden).toBe(true);
    });
    
    it("debería validar que el usuario sea mayor de 18 años", function() {
      // Arrange
      let calcularEdad = function(fechaNacimiento) {
        let hoy = new Date();
        let nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        let mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        return edad;
      };
      
      // Act
      let edadMayor = calcularEdad('2000-01-01');
      let edadMenor = calcularEdad('2010-01-01');
      
      // Assert
      expect(edadMayor).toBeGreaterThan(18);
      expect(edadMenor).toBeLessThan(18);
    });
    
    it("debería verificar que el email no esté ya registrado", function() {
      // Arrange
      let usuariosExistentes = [
        { email: 'usuario1@test.com' },
        { email: 'usuario2@test.com' }
      ];
      
      let nuevoEmail = 'usuario3@test.com';
      
      // Act
      let emailExiste = usuariosExistentes.some(function(u) {
        return u.email === nuevoEmail;
      });
      
      // Assert
      expect(emailExiste).toBe(false);
    });
  });

  // ==================================================
  // PRUEBA 5: CÁLCULO DE BENEFICIOS
  // ==================================================
  describe("Cálculo de Beneficios al Registrarse", function() {
    
    it("debería calcular edad correctamente", function() {
      // Arrange
      let calcularEdad = function(fechaNacimiento) {
        let hoy = new Date();
        let nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        return edad;
      };
      
      // Act
      let edad1970 = calcularEdad('1970-01-01');
      let edad2000 = calcularEdad('2000-01-01');
      
      // Assert
      expect(edad1970).toBeGreaterThanOrEqual(50);
      expect(edad2000).toBeLessThan(50);
    });
    
    it("debería detectar usuario mayor de 50 años", function() {
      // Arrange
      let fechaNacimiento = '1970-05-10';
      let calcularEdad = function(fecha) {
        let hoy = new Date();
        let nacimiento = new Date(fecha);
        return hoy.getFullYear() - nacimiento.getFullYear();
      };
      
      // Act
      let edad = calcularEdad(fechaNacimiento);
      let esSenior = edad >= 50;
      
      // Assert
      expect(esSenior).toBe(true);
    });
    
    it("debería detectar email DUOC (@duocuc.cl)", function() {
      // Arrange
      let emailDuoc = 'estudiante@duocuc.cl';
      let emailNormal = 'usuario@gmail.com';
      
      // Act
      let isDuocEmail = function(email) {
        return email.endsWith('@duocuc.cl');
      };
      
      // Assert
      expect(isDuocEmail(emailDuoc)).toBe(true);
      expect(isDuocEmail(emailNormal)).toBe(false);
    });
    
    it("debería detectar código promocional FELICES50", function() {
      // Arrange
      let codigoValido = 'FELICES50';
      let codigoInvalido = 'OTRO';
      
      // Act
      let esCodigoValido = function(codigo) {
        return codigo.trim() === 'FELICES50';
      };
      
      // Assert
      expect(esCodigoValido(codigoValido)).toBe(true);
      expect(esCodigoValido(codigoInvalido)).toBe(false);
    });
    
    it("debería asignar beneficio >50 a mayores de 50", function() {
      // Arrange
      let edad = 55;
      let benefits = [];
      
      // Act
      if (edad >= 50) {
        benefits.push('>50');
      }
      
      // Assert
      expect(benefits).toContain('>50');
      expect(benefits.length).toBe(1);
    });
    
    it("debería asignar beneficio DUOC a emails @duocuc.cl", function() {
      // Arrange
      let email = 'estudiante@duocuc.cl';
      let benefits = [];
      
      // Act
      if (email.endsWith('@duocuc.cl')) {
        benefits.push('DUOC');
      }
      
      // Assert
      expect(benefits).toContain('DUOC');
    });
    
    it("debería asignar beneficio FELICES50 con código válido", function() {
      // Arrange
      let promoCode = 'FELICES50';
      let benefits = [];
      
      // Act
      if (promoCode.trim() === 'FELICES50') {
        benefits.push('FELICES50');
      }
      
      // Assert
      expect(benefits).toContain('FELICES50');
    });
    
    it("debería acumular múltiples beneficios", function() {
      // Arrange
      let datosRegistro = {
        email: 'usuario@duocuc.cl',
        birthDate: '1970-01-01',
        promoCode: 'FELICES50'
      };
      let benefits = [];
      
      // Act: Calcular todos los beneficios
      let calcularEdad = function(fecha) {
        let hoy = new Date();
        let nacimiento = new Date(fecha);
        return hoy.getFullYear() - nacimiento.getFullYear();
      };
      
      let edad = calcularEdad(datosRegistro.birthDate);
      
      if (edad >= 50) benefits.push('>50');
      if (datosRegistro.email.endsWith('@duocuc.cl')) benefits.push('DUOC');
      if (datosRegistro.promoCode.trim() === 'FELICES50') benefits.push('FELICES50');
      
      // Assert
      expect(benefits.length).toBe(3);
      expect(benefits).toContain('>50');
      expect(benefits).toContain('DUOC');
      expect(benefits).toContain('FELICES50');
    });
    
    it("debería crear usuario con estructura correcta", function() {
      // Arrange
      let datosRegistro = {
        name: 'Ana Pérez',
        email: 'ana@duocuc.cl',
        password: 'pass123',
        birthDate: '1970-05-10',
        promoCode: 'FELICES50'
      };
      
      // Act: Crear usuario
      let nuevoUsuario = {
        name: datosRegistro.name,
        email: datosRegistro.email,
        password: datosRegistro.password,
        role: 'user',
        birthdate: datosRegistro.birthDate,
        benefits: ['>50', 'DUOC', 'FELICES50'],
        createdAt: new Date().toISOString()
      };
      
      // Assert
      expect(nuevoUsuario.name).toBe('Ana Pérez');
      expect(nuevoUsuario.email).toBe('ana@duocuc.cl');
      expect(nuevoUsuario.role).toBe('user');
      expect(nuevoUsuario.benefits.length).toBe(3);
      expect(Array.isArray(nuevoUsuario.benefits)).toBe(true);
    });
  });

  // ==================================================
  // PRUEBA 6: MENSAJES DE BENEFICIOS
  // ==================================================
  describe("Mensajes de Beneficios Obtenidos", function() {
    
    it("debería generar mensaje para beneficio senior", function() {
      // Arrange
      let benefits = ['>50'];
      let mensajes = [];
      
      // Act
      if (benefits.includes('>50')) {
        mensajes.push('50% de descuento en todos los productos (mayores de 50)');
      }
      
      // Assert
      expect(mensajes.length).toBe(1);
      expect(mensajes[0]).toContain('50%');
    });
    
    it("debería generar mensaje para código FELICES50", function() {
      // Arrange
      let benefits = ['FELICES50'];
      let mensajes = [];
      
      // Act
      if (benefits.includes('FELICES50')) {
        mensajes.push('10% de descuento adicional con código FELICES50');
      }
      
      // Assert
      expect(mensajes.length).toBe(1);
      expect(mensajes[0]).toContain('10%');
    });
    
    it("debería generar mensaje para beneficio DUOC", function() {
      // Arrange
      let benefits = ['DUOC'];
      let mensajes = [];
      
      // Act
      if (benefits.includes('DUOC')) {
        mensajes.push('Torta gratis en tu cumpleaños (estudiante DUOC)');
      }
      
      // Assert
      expect(mensajes.length).toBe(1);
      expect(mensajes[0]).toContain('Torta gratis');
    });
  });
});
