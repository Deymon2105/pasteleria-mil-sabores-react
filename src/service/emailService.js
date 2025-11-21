/**
 * Servicio de envío de emails usando EmailJS
 * Para demo/pruebas - Configuración simple sin backend
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crear cuenta gratuita en https://www.emailjs.com/
 * 2. Crear un servicio de email (Gmail, Outlook, etc.)
 * 3. Crear un template de email
 * 4. Obtener Public Key, Service ID y Template ID
 * 5. Agregar las variables de entorno en .env:
 *    REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key
 *    REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
 *    REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id
 */

// Instalar EmailJS: npm install @emailjs/browser

/**
 * Genera el HTML del email con la boleta de compra
 */
const generateInvoiceHTML = (orderData) => {
  const {
    code,
    total,
    discount,
    subtotal,
    shippingAddress,
    items,
    created_at,
    paymentInfo
  } = orderData;

  const fecha = new Date(created_at || new Date()).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 12px; text-align: left;">${item.title || item.name || 'Producto'}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; text-align: right;">$${(item.price || 0).toLocaleString('es-CL')}</td>
      <td style="padding: 12px; text-align: right;">$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Compra - Pastelería Mil Sabores</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍰 Pastelería Mil Sabores</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">¡Gracias por tu compra!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #8B4513; margin-top: 0;">Confirmación de Pedido</h2>
              <p style="color: #666666; line-height: 1.6;">
                Hola <strong>${shippingAddress?.nombre || 'Cliente'}</strong>,
              </p>
              <p style="color: #666666; line-height: 1.6;">
                Tu pedido ha sido recibido exitosamente. Te enviaremos una actualización cuando tu pedido sea enviado.
              </p>
              
              <!-- Order Details -->
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #8B4513; margin-top: 0;">Detalles del Pedido</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666;"><strong>Código de Pedido:</strong></td>
                    <td style="color: #333333; text-align: right;"><strong>${code}</strong></td>
                  </tr>
                  <tr>
                    <td style="color: #666666;"><strong>Fecha:</strong></td>
                    <td style="color: #333333; text-align: right;">${fecha}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666;"><strong>Estado:</strong></td>
                    <td style="color: #333333; text-align: right;">Pendiente</td>
                  </tr>
                </table>
              </div>
              
              <!-- Items Table -->
              <h3 style="color: #8B4513; margin-top: 30px;">Productos</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #8B4513; color: #ffffff;">
                    <th style="padding: 12px; text-align: left;">Producto</th>
                    <th style="padding: 12px; text-align: center;">Cantidad</th>
                    <th style="padding: 12px; text-align: right;">Precio Unit.</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <!-- Summary -->
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: right; color: #666666; padding: 8px;">Subtotal:</td>
                  <td style="text-align: right; color: #333333; padding: 8px; width: 120px;">$${(subtotal || total + (discount || 0)).toLocaleString('es-CL')}</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                  <td style="text-align: right; color: #28a745; padding: 8px;">Descuento:</td>
                  <td style="text-align: right; color: #28a745; padding: 8px;">-$${(discount || 0).toLocaleString('es-CL')}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #8B4513;">
                  <td style="text-align: right; color: #8B4513; padding: 12px 8px; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="text-align: right; color: #8B4513; padding: 12px 8px; font-size: 18px; font-weight: bold;">$${(total || 0).toLocaleString('es-CL')}</td>
                </tr>
              </table>
              
              <!-- Shipping Address -->
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #8B4513; margin-top: 0;">Dirección de Envío</h3>
                <p style="color: #666666; line-height: 1.8; margin: 0;">
                  <strong>${shippingAddress?.nombre || ''}</strong><br>
                  ${shippingAddress?.calle || ''}${shippingAddress?.depto ? `, ${shippingAddress.depto}` : ''}<br>
                  ${shippingAddress?.comuna || ''}, ${shippingAddress?.region || ''}<br>
                  ${shippingAddress?.codigo_postal ? `Código Postal: ${shippingAddress.codigo_postal}` : ''}
                  ${shippingAddress?.telefono ? `<br>Teléfono: ${shippingAddress.telefono}` : ''}
                </p>
              </div>
              
              <!-- Payment Info -->
              ${paymentInfo ? `
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #8B4513; margin-top: 0;">Información de Pago</h3>
                <p style="color: #666666; line-height: 1.8; margin: 0;">
                  Método: ${paymentInfo.method === 'credit_card' ? 'Tarjeta de Crédito' : paymentInfo.method}<br>
                  ${paymentInfo.lastFourDigits ? `Terminada en: ****${paymentInfo.lastFourDigits}` : ''}<br>
                  ${paymentInfo.cardHolderName ? `Titular: ${paymentInfo.cardHolderName}` : ''}
                </p>
              </div>
              ` : ''}
              
              <!-- Footer -->
              <p style="color: #666666; line-height: 1.6; margin-top: 30px;">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
              </p>
              <p style="color: #666666; line-height: 1.6;">
                ¡Gracias por elegir Pastelería Mil Sabores!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #999999; font-size: 12px;">
              <p style="margin: 0;">Pastelería Mil Sabores</p>
              <p style="margin: 5px 0 0 0;">Este es un email automático, por favor no responder.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Envía un email de confirmación de compra
 * @param {Object} orderData - Datos completos de la orden
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Verificar que EmailJS esté configurado
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

    if (!publicKey || !serviceId || !templateId) {
      console.warn('⚠️ EmailJS no está configurado.');
      console.warn('📧 Para habilitar el envío de emails:');
      console.warn('1. Crea un archivo .env en la raíz del proyecto');
      console.warn('2. Agrega las siguientes variables:');
      console.warn('   REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key');
      console.warn('   REACT_APP_EMAILJS_SERVICE_ID=tu_service_id');
      console.warn('   REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id');
      console.warn('3. Reinicia el servidor (npm start)');
      console.warn('📖 Ver instrucciones completas en: docs/EMAIL_SETUP.md');
      return false;
    }

    // Importar EmailJS dinámicamente
    const emailjs = await import('@emailjs/browser');

    // Obtener email del destinatario
    const recipientEmail = orderData.shippingAddress?.correo ||
      orderData.guest_email ||
      orderData.user?.email;

    if (!recipientEmail) {
      console.warn('No se encontró email del destinatario');
      return false;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.warn('Email del destinatario inválido:', recipientEmail);
      return false;
    }

    // Calcular subtotal si no viene
    const subtotal = orderData.subtotal || (orderData.total + (orderData.discount || 0));

    // Preparar datos para el template
    // Nota: EmailJS puede enviar HTML, pero es mejor usar variables simples y HTML en el template
    const templateParams = {
      to_email: recipientEmail,
      to_name: orderData.shippingAddress?.nombre || orderData.guest_name || 'Cliente',
      order_code: orderData.code,
      order_date: new Date(orderData.created_at || new Date()).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      order_total: `$${(orderData.total || 0).toLocaleString('es-CL')}`,
      order_subtotal: `$${(subtotal || orderData.total).toLocaleString('es-CL')}`,
      order_discount: orderData.discount > 0 ? `$${(orderData.discount || 0).toLocaleString('es-CL')}` : '0',
      // Generar HTML de la boleta para incluir en el template
      // IMPORTANTE: EmailJS tiene límite de tamaño (50KB). Si el HTML es muy grande, puede fallar.
      // Se recomienda usar un template simple en EmailJS y pasar solo datos.
      invoice_html: generateInvoiceHTML({
        ...orderData,
        subtotal
      }),
      // Datos adicionales para el template
      message: `Tu pedido ${orderData.code} ha sido confirmado. Total: $${(orderData.total || 0).toLocaleString('es-CL')}`,
      // Items como texto simple para el template básico
      items_list: orderData.items?.map(item =>
        `- ${item.title || item.name} (x${item.quantity || 1}): $${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}`
      ).join('\n') || 'No hay items'
    };

    // Enviar email usando EmailJS
    console.log('Enviando email a:', recipientEmail);

    // Timeout para el envío de email (10 segundos)
    const emailTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado al enviar email')), 10000)
    );

    const response = await Promise.race([
      emailjs.default.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      ),
      emailTimeout
    ]);

    console.log('✅ Email enviado exitosamente:', response);
    console.log('📧 Email enviado a:', recipientEmail);
    return true;

  } catch (error) {
    console.error('❌ Error al enviar email de confirmación:', error);
    console.error('Detalles del error:', {
      message: error.message,
      text: error.text,
      status: error.status
    });

    // Si es un error de configuración, dar más información
    if (error.text && error.text.includes('Invalid')) {
      console.error('⚠️ Verifica que los IDs de EmailJS sean correctos en el archivo .env');
    }

    // No lanzar error para no bloquear la compra
    return false;
  }
};

