# 🤖 Monitor Automático de Inscripciones CILS - IIC Buenos Aires

Este proyecto monitorea automáticamente la página del Instituto Italiano di Cultura de Buenos Aires para detectar cuando se abren las inscripciones para los exámenes CILS.

## ⚡ Ejecución Automática con GitHub Actions

El sistema se ejecuta **automáticamente** con dos tipos de monitoreo:

### 🔍 **Monitoreo Principal** (3 veces al día):
- 🌅 **7:00 AM** hora argentina - Verificación matutina
- 🌞 **1:00 PM** hora argentina - Verificación del mediodía
- 🌙 **7:00 PM** hora argentina - Verificación vespertina

### 📅 **Alerta Semanal** (todos los jueves):
- 💚 **9:00 AM** hora argentina - Confirma que el sistema está funcionando

## 🔧 Configuración Inicial

### 1. 📧 Configurar Secrets en GitHub

Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions** y agrega estos secrets:

```
EMAIL_USER          → tu-email@gmail.com
EMAIL_PASSWORD      → tu-password-de-aplicacion-gmail
EMAIL_TO_1          → destinatario1@ejemplo.com
EMAIL_TO_2          → destinatario2@ejemplo.com
SMTP_HOST           → smtp.gmail.com
SMTP_PORT           → 587
```

### 2. 🔑 Generar Password de Aplicación para Gmail

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Activa **"2-Step Verification"** si no la tienes
3. Busca **"App passwords"** 
4. Genera una nueva contraseña para **"Mail"**
5. Usa ESA contraseña en `EMAIL_PASSWORD` (NO tu password normal)

### 3. 🚀 Activar el Workflow

1. Haz push de este código a tu repositorio de GitHub
2. Ve a la pestaña **"Actions"**
3. Verifica que el workflow aparezca listado
4. Puedes ejecutarlo manualmente con **"Run workflow"**

## 📱 ¿Qué Hace el Sistema?

### 🔍 **Monitoreo Principal:**
- 🔍 **Scraping Inteligente**: Analiza la tabla de fechas de exámenes
- 📧 **Notificación Inmediata**: Envía email solo cuando se detectan inscripciones abiertas
- ⏰ **Monitoreo 24/7**: Se ejecuta automáticamente sin intervención manual
- 🎯 **Detección Precisa**: Verifica específicamente los campos "Apertura iscrizioni"
- 🛡️ **Control Anti-Spam**: Solo envía una notificación por día para evitar emails duplicados

### 💚 **Alerta Semanal:**
- 📅 **Reporte de Estado**: Todos los jueves confirma que el sistema está activo
- 📊 **Información Completa**: Estado del sistema, horarios de monitoreo y próximas verificaciones
- ✅ **Tranquilidad**: Si recibes este email, todo está funcionando perfectamente

## 📬 Tipos de Notificaciones

### 🚨 **Email de Inscripciones Abiertas** (Solo cuando se detectan):
- 🚨 Alerta visual destacada
- 📊 Información completa del análisis
- 🔗 Link directo a la página oficial
- ⏰ Fecha y hora exacta de la detección
- 🎯 Instrucciones claras de acción

### 💚 **Email de Alerta Semanal** (Todos los jueves):
- ✅ Confirmación de que el sistema está activo
- 📊 Estado completo del monitoreo
- ⏰ Horarios de todas las verificaciones automáticas
- 📅 Información sobre la próxima alerta

## 🧪 Ejecución Local (Opcional)

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# (Edita el .env con tus datos)

# Ejecutar monitoreo principal una vez
node scraper.js

# O usar el script npm
npm start

# Ejecutar alerta semanal una vez (para pruebas)
node weekly-alert.js

# O usar el script npm
npm run weekly-alert
```

## 📋 Estructura del Proyecto

```
script/
├── 📄 scraper.js                    # Script principal de scraping
├── � weekly-alert.js               # Script de alerta semanal
├── 📦 package.json                  # Dependencias del proyecto
├── 🔐 .env                          # Variables de entorno (local)
├── 📝 CONFIGURACION_EMAIL.md        # Guía de configuración
├── 🚫 .gitignore                    # Archivos ignorados
└── .github/workflows/
    ├── 📅 monitor-inscripciones.yml # Monitoreo principal (3x/día)
    └── 💚 weekly-alert.yml          # Alerta semanal (jueves)
```

## ⚠️ Importante

- El archivo `.env` está en `.gitignore` por seguridad
- Los secrets de GitHub están encriptados y son seguros
- El sistema solo envía email cuando detecta cambios (inscripciones abiertas)
- Las ejecuciones automáticas aparecen en la pestaña "Actions" de GitHub

## 🔄 Horarios de Ejecución

| Tipo | Día | Hora Argentina | Hora UTC | Descripción |
|------|-----|---------------|----------|-------------|
| 🔍 Monitoreo | Lunes a Domingo | 🌅 07:00 AM | 10:00 AM | Verificación matutina |
| 🔍 Monitoreo | Lunes a Domingo | 🌞 01:00 PM | 04:00 PM | Verificación del mediodía |
| 🔍 Monitoreo | Lunes a Domingo | 🌙 07:00 PM | 10:00 PM | Verificación vespertina |
| 💚 Alerta | Solo Jueves | 📅 09:00 AM | 12:00 PM | **Alerta semanal del sistema** |

## 🆘 Solución de Problemas

### ❌ Si no recibes emails:

1. Verifica que los secrets estén configurados correctamente
2. Revisa la pestaña "Actions" para ver logs de errores
3. Confirma que usaste un "App Password" de Gmail, no tu password normal

### ❌ Si el workflow no se ejecuta:

1. Verifica que el archivo YML esté en `.github/workflows/`
2. Confirma que hiciste push a la rama principal
3. Ve a "Actions" → "All workflows" para verificar el estado