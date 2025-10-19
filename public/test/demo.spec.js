/**
 * TEST DE DEMOSTRACIÓN
 * Este test simple demuestra que Jasmine está funcionando correctamente
 */

describe("🧪 Test de Validación - Sistema Funcionando", function() {
  
  it("✅ Jasmine está configurado correctamente", function() {
    expect(true).toBe(true);
  });
  
  it("✅ Puede hacer operaciones matemáticas", function() {
    var suma = 2 + 2;
    expect(suma).toBe(4);
  });
  
  it("✅ Puede validar strings", function() {
    var texto = "Pastelería Mil Sabores";
    expect(texto).toContain("Mil Sabores");
  });
  
  it("✅ Puede usar jasmine.createSpy()", function() {
    var funcionEspia = jasmine.createSpy('miFunction');
    
    funcionEspia('test');
    
    expect(funcionEspia).toHaveBeenCalled();
    expect(funcionEspia).toHaveBeenCalledWith('test');
  });
  
  it("✅ Puede validar arrays", function() {
    var beneficios = ['>50', 'DUOC', 'FELICES50'];
    
    expect(beneficios.length).toBe(3);
    expect(beneficios).toContain('DUOC');
  });
});
