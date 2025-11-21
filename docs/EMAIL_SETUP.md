# 📧 Configuración de Envío de Emails

Este documento explica cómo configurar el sistema de envío de emails de confirmación de compra usando EmailJS.

## 🎯 ¿Qué es EmailJS?

EmailJS es un servicio que permite enviar emails directamente desde el frontend sin necesidad de un servidor backend. Es perfecto para demos y pruebas.

**Ventajas:**
- ✅ Gratis hasta 200 emails/mes
- ✅ No requiere backend
- ✅ Configuración simple
- ✅ Ideal para demos

## 📋 Pasos de Configuración

### 1. Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Configurar un Servicio de Email

1. En el dashboard, ve a **Email Services**
2. Click en **Add New Service**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Guarda el Service ID** (ej: `service_abc123`)

### 3. Crear un Template de Email

1. Ve a **Email Templates**
2. Click en **Create New Template**
3. Usa este template básico:

**Asunto:**
```
Confirmación de Pedido - Pastelería Mil Sabores
```

**Contenido (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #8B4513;">¡Gracias por tu compra, {{to_name}}!</h2>
    
    <p>Tu pedido <strong>{{order_code}}</strong> ha sido confirmado exitosamente.</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Fecha:</strong> {{order_date}}</p>
      <p style="margin: 5px 0;"><strong>Subtotal:</strong> {{order_subtotal}}</p>
      {{#order_discount}}
      <p style="margin: 5px 0; color: #28a745;"><strong>Descuento:</strong> -{{order_discount}}</p>
      {{/order_discount}}
      <p style="margin: 5px 0; font-size: 18px; color: #8B4513;"><strong>Total:</strong> {{order_total}}</p>
    </div>
    
    <h3 style="color: #8B4513;">Productos:</h3>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; white-space: pre-wrap;">{{items_list}}</pre>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <div style="margin-top: 30px;">
      {{invoice_html}}
    </div>
    
    <p style="margin-top: 30px;">
      Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
    </p>
    
    <p style="color: #8B4513; font-weight: bold;">
      ¡Gracias por elegir Pastelería Mil Sabores! 🍰
    </p>
  </div>
</body>
</html>
```

**Variables del Template:**
- `{{to_name}}` - Nombre del cliente
- `{{to_email}}` - Email del cliente (se usa automáticamente)
- `{{order_code}}` - Código del pedido
- `{{order_date}}` - Fecha del pedido formateada
- `{{order_total}}` - Total del pedido
- `{{order_subtotal}}` - Subtotal antes de descuentos
- `{{order_discount}}` - Monto del descuento (si aplica)
- `{{items_list}}` - Lista de productos en texto
- `{{invoice_html}}` - HTML completo de la boleta detallada
- `{{message}}` - Mensaje adicional

4. **Guarda el Template ID** (ej: `template_xyz789`)

### 4. Obtener Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key** (ej: `abcdefghijklmnop`)

### 5. Configurar Variables de Entorno

1. Crea o edita el archivo `.env` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
REACT_APP_EMAILJS_SERVICE_ID=tu_service_id_aqui
REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id_aqui
```

**Ejemplo:**
```env
REACT_APP_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
REACT_APP_EMAILJS_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789
```

### 6. Instalar Dependencia

```bash
npm install @emailjs/browser
```

### 7. Reiniciar la Aplicación

```bash
npm start
```

## ✅ Verificación

1. Realiza una compra de prueba
2. Verifica que recibas el email de confirmación
3. Revisa la consola del navegador para ver logs

## 🔧 Solución de Problemas

### El email no se envía

1. **Verifica las variables de entorno:**
   - Asegúrate de que empiecen con `REACT_APP_`
   - Reinicia el servidor después de agregarlas

2. **Revisa la consola del navegador:**
   - Busca errores relacionados con EmailJS
   - Verifica que las variables estén definidas

3. **Verifica el template:**
   - Asegúrate de que todas las variables estén correctamente escritas
   - El template debe estar activo en EmailJS

4. **Límites de EmailJS:**
   - Plan gratuito: 200 emails/mes
   - Si excedes el límite, los emails no se enviarán

### El email se envía pero está vacío

- Verifica que el template tenga el contenido correcto
- Asegúrate de que las variables del template coincidan con las que envía el código

## 🚀 Alternativas para Producción

Para producción, considera usar:

1. **Supabase Edge Functions + Resend**
   - Más profesional
   - Mejor control
   - Requiere configuración de Edge Functions

2. **Nodemailer con SMTP**
   - Control total
   - Requiere servidor backend

3. **SendGrid / Mailgun**
   - Servicios profesionales
   - Mejor deliverability
   - Requiere backend

## 📝 Notas Importantes

- ⚠️ EmailJS es para **demos y pruebas**
- ⚠️ No uses EmailJS para producción con alto volumen
- ⚠️ El HTML del email se genera en el frontend (no es ideal para producción)
- ✅ Para producción, mueve la generación de emails al backend

## 🎓 Recursos

- [Documentación de EmailJS](https://www.emailjs.com/docs/)
- [Ejemplos de Templates](https://www.emailjs.com/docs/examples/reactjs/)

