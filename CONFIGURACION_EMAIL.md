# INSTRUCCIONES PARA CONFIGURAR EL ARCHIVO .env

## 📧 Configuración de Email

### 1. Edita el archivo .env con tus datos reales:

```
EMAIL_USER=tu-email@gmail.com                  # Tu email de Gmail
EMAIL_PASSWORD=tu-password-de-aplicacion       # Password de aplicación (NO tu password normal)
EMAIL_TO_1=destinatario1@ejemplo.com          # Primer email destino
EMAIL_TO_2=destinatario2@ejemplo.com          # Segundo email destino
SMTP_HOST=smtp.gmail.com                      # Servidor SMTP (Gmail por defecto)
SMTP_PORT=587                                  # Puerto SMTP
```

### 2. 🔑 Para Gmail - Configurar Password de Aplicación:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Busca "Seguridad" -> "Verificación en 2 pasos"
3. Activa la verificación en 2 pasos si no la tienes
4. Busca "Contraseñas de aplicaciones"
5. Genera una nueva contraseña para "Correo"
6. Usa ESA contraseña en EMAIL_PASSWORD (no tu password normal)

### 3. 📨 Para otros proveedores de email:

#### Outlook/Hotmail:
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo:
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### 4. 🧪 Prueba la configuración:

Ejecuta el script normalmente:
```bash
node scraper.js
```

Si las inscripciones están abiertas (resultado true), se enviará un email automáticamente.

### 5. ⚠️ Importante:

- NUNCA compartas tu archivo .env
- El archivo .env ya está en .gitignore
- Usa passwords de aplicación, no tu password principal
- Verifica que los emails destinatarios sean correctos