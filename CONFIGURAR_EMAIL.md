# 📧 Configuración Rápida de Envío de Emails

## ⚡ Pasos Rápidos (5 minutos)

### 1. Crear cuenta en EmailJS
- Ve a: https://www.emailjs.com/
- Crea cuenta gratuita (200 emails/mes gratis)
- Verifica tu email

### 2. Configurar Servicio de Email
1. En EmailJS Dashboard → **Email Services**
2. Click **Add New Service**
3. Selecciona **Gmail** (o tu proveedor)
4. Conecta tu cuenta de Gmail
5. **Copia el Service ID** (ej: `service_abc123`)

### 3. Crear Template de Email
1. En EmailJS Dashboard → **Email Templates**
2. Click **Create New Template**
3. **Asunto:** `Confirmación de Pedido - Pastelería Mil Sabores`
4. **Contenido:** Copia el template de abajo
5. **Copia el Template ID** (ej: `template_xyz789`)

**Template HTML:**
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

### 4. Obtener Public Key
1. En EmailJS Dashboard → **Account** → **General**
2. **Copia tu Public Key** (ej: `abcdefghijklmnop`)

### 5. Crear archivo .env
1. En la raíz del proyecto, crea un archivo llamado `.env`
2. Copia el contenido de `.env.example` o agrega esto:

```env
REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
REACT_APP_EMAILJS_SERVICE_ID=tu_service_id_aqui
REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id_aqui
```

**Ejemplo real:**
```env
REACT_APP_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
REACT_APP_EMAILJS_SERVICE_ID=service_gmail123
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789
```

### 6. Instalar dependencia (si no está instalada)
```bash
npm install @emailjs/browser
```

### 7. Reiniciar la aplicación
```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm start
```

## ✅ Verificar que funciona

1. Realiza una compra de prueba
2. Abre la consola del navegador (F12)
3. Busca el mensaje: `Email de confirmación enviado exitosamente`
4. Revisa tu correo (y spam si no lo encuentras)

## 🔍 Solución de Problemas

### No se envía el email

**Verifica en la consola del navegador:**
- Si ves `⚠️ EmailJS no está configurado` → Falta el archivo `.env` o las variables
- Si ves errores de EmailJS → Verifica que los IDs sean correctos

**Pasos:**
1. Asegúrate de que el archivo `.env` esté en la raíz del proyecto (mismo nivel que `package.json`)
2. Verifica que las variables empiecen con `REACT_APP_`
3. **Reinicia el servidor** después de crear/modificar `.env`
4. Verifica que no haya espacios extra en las variables

### El email se envía pero está vacío

- Verifica que el template en EmailJS tenga todas las variables correctas
- Asegúrate de que el template esté activo (no en borrador)

### Límite de emails alcanzado

- Plan gratuito: 200 emails/mes
- Si excedes, actualiza a un plan de pago o espera al próximo mes

## 📖 Documentación Completa

Para más detalles, ver: `docs/EMAIL_SETUP.md`


