# Sistema de Descuentos y Beneficios

## Beneficios Disponibles

### 1. Descuento Mayores de 50 años
- **Condición**: Usuario tiene 50 años o más
- **Beneficio**: 50% de descuento en TODOS los productos
- **Etiqueta**: `>50`
- **Se aplica**: Automáticamente al registrarse con fecha de nacimiento válida

### 2. Código Promocional FELICES50
- **Condición**: Usuario ingresa código "FELICES50" en registro
- **Beneficio**: 10% de descuento adicional en TODOS los productos
- **Etiqueta**: `FELICES50`
- **Se aplica**: Al ingresar el código en el formulario de registro
- **Acumulable**: Sí, se suma con otros descuentos

### 3. Beneficio Estudiante DUOC
- **Condición**: Email con dominio @duocuc.cl
- **Beneficio**: Torta GRATIS en el cumpleaños del usuario
- **Etiqueta**: `DUOC`
- **Se aplica**: Automáticamente al registrarse con email @duocuc.cl
- **Nota**: NO es un descuento porcentual, es una torta gratis en fecha específica

---

## Cómo se Aplican los Descuentos

### En el Registro:
1. Usuario completa formulario en `/register`
2. Sistema detecta automáticamente:
   - Si tiene 50+ años → Agrega beneficio `>50`
   - Si email termina en @duocuc.cl → Agrega beneficio `DUOC`
   - Si ingresó código FELICES50 → Agrega beneficio `FELICES50`
3. Se guardan en array `benefits` del usuario

### En el Carrito:
1. Sistema lee `currentUser.benefits` desde localStorage
2. Por cada beneficio en el array:
   - `>50` → Aplica 50% de descuento
   - `FELICES50` → Aplica 10% de descuento adicional
   - `DUOC` → Muestra mensaje informativo (no aplica descuento en carrito)
3. Los descuentos se suman (si tienes ambos: 60% total)
4. Se muestra desglose de descuentos aplicados

---

## Ejemplos de Usuarios

### Ejemplo 1: Usuario Normal
```javascript
{
  name: "Juan Pérez",
  email: "juan@gmail.com",
  birthdate: "2000-05-15", // 25 años
  benefits: [] // Sin beneficios
}
```
**Resultado en carrito**: Paga precio completo

---

### Ejemplo 2: Estudiante DUOC
```javascript
{
  name: "María González",
  email: "maria@duocuc.cl",
  birthdate: "2003-08-20", // 22 años
  benefits: ["DUOC"] // Solo beneficio DUOC
}
```
**Resultado en carrito**: 
- Paga precio completo
- Ve mensaje: "Beneficio DUOC: Torta gratis en tu cumpleaños"

---

### Ejemplo 3: Mayor de 50
```javascript
{
  name: "Carlos Ruiz",
  email: "carlos@gmail.com",
  birthdate: "1965-12-20", // 59 años
  benefits: [">50"] // Beneficio senior
}
```
**Resultado en carrito**:
- Descuento 50% en todos los productos
- Si subtotal es $100.000 → Paga $50.000

---

### Ejemplo 4: Estudiante DUOC Mayor de 50
```javascript
{
  name: "Ana Pérez",
  email: "ana@duocuc.cl",
  birthdate: "1970-05-10", // 55 años
  benefits: [">50", "DUOC"] // Ambos beneficios
}
```
**Resultado en carrito**:
- Descuento 50% en todos los productos
- Mensaje de torta gratis en cumpleaños
- Si subtotal es $100.000 → Paga $50.000

---

### Ejemplo 5: Usuario con Código Promocional
```javascript
{
  name: "Pedro Silva",
  email: "pedro@gmail.com",
  birthdate: "1995-03-15", // 30 años
  promoCode: "FELICES50", // Ingresó código
  benefits: ["FELICES50"] // Solo código promo
}
```
**Resultado en carrito**:
- Descuento 10% en todos los productos
- Si subtotal es $100.000 → Paga $90.000

---

### Ejemplo 6: Combo Completo
```javascript
{
  name: "Roberto Díaz",
  email: "roberto@duocuc.cl",
  birthdate: "1970-01-01", // 55 años
  promoCode: "FELICES50",
  benefits: [">50", "DUOC", "FELICES50"] // Todos los beneficios
}
```
**Resultado en carrito**:
- Descuento 50% (mayores de 50)
- Descuento 10% adicional (código FELICES50)
- **Total descuento: 60%**
- Mensaje de torta gratis
- Si subtotal es $100.000 → Paga $40.000

---

## Validaciones

### Email DUOC:
- Debe terminar exactamente en `@duocuc.cl`
- Ejemplos válidos:
  - maria@duocuc.cl ✓
  - juan.perez@duocuc.cl ✓
- Ejemplos inválidos:
  - maria@duoc.cl ✗
  - maria@duocuc.com ✗

### Código Promocional:
- Debe ser exactamente `FELICES50`
- Case-sensitive (sensible a mayúsculas/minúsculas)
- FELICES50 ✓
- felices50 ✗
- Felices50 ✗

### Edad:
- Se calcula automáticamente desde fecha de nacimiento
- Debe ser mayor de 18 años para registrarse
- Si tiene 50 o más → Aplica descuento automáticamente

---

## Implementación Técnica

### Estructura de datos:
```javascript
// Usuario en localStorage
{
  benefits: [">50", "DUOC", "FELICES50"]
}
```

### Lógica en Cart.js:
```javascript
// Leer beneficios
const usuario = JSON.parse(localStorage.getItem('currentUser'))
const userBenefits = usuario.benefits || []

// Calcular descuentos
let descuentoTotal = 0

if (userBenefits.includes('>50')) {
  descuentoTotal += 50 // 50%
}

if (userBenefits.includes('FELICES50')) {
  descuentoTotal += 10 // 10%
}

// Aplicar descuento
const montoDescuento = subtotal * (descuentoTotal / 100)
const total = subtotal - montoDescuento
```

### Lógica en Register.js:
```javascript
// Calcular beneficios al registrarse
const benefits = []

// Mayor de 50
if (calculateAge(data.birthDate) >= 50) {
  benefits.push('>50')
}

// Código promocional
if (data.promoCode?.trim() === 'FELICES50') {
  benefits.push('FELICES50')
}

// Email DUOC
if (data.email.endsWith('@duocuc.cl')) {
  benefits.push('DUOC')
}

// Guardar en usuario
const newUser = {
  ...otherData,
  benefits: benefits
}
```

---

## Testing

### Probar Descuento Senior:
1. Registrarse con fecha de nacimiento antes de 1975
2. Ir al carrito con productos
3. Verificar descuento 50%

### Probar Código Promocional:
1. Registrarse e ingresar código "FELICES50"
2. Ir al carrito con productos
3. Verificar descuento 10%

### Probar Beneficio DUOC:
1. Registrarse con email @duocuc.cl
2. Ir al carrito con productos
3. Verificar mensaje de torta gratis (NO descuento)

### Probar Acumulación:
1. Registrarse con:
   - Email @duocuc.cl
   - Fecha de nacimiento antes de 1975
   - Código FELICES50
2. Ir al carrito con productos
3. Verificar descuento total 60%

---

## Preguntas Frecuentes

**¿Los descuentos se acumulan?**
Sí, los descuentos porcentuales (>50 y FELICES50) se suman.

**¿El beneficio DUOC da descuento?**
No, el beneficio DUOC es una torta gratis en el cumpleaños, no un descuento en el carrito.

**¿Puedo tener múltiples beneficios?**
Sí, puedes tener todos los beneficios al mismo tiempo si cumples las condiciones.

**¿Los descuentos se aplican a todos los productos?**
Sí, los descuentos se aplican al subtotal completo del carrito.

**¿Cómo obtengo el código FELICES50?**
Es un código promocional que se ingresa durante el registro. (En producción sería comunicado por marketing)
