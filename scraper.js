const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Archivo para trackear el estado de emails enviados
const STATUS_FILE = path.join(__dirname, 'email-status.json');

// Funciones para manejar el estado de emails enviados
function loadEmailStatus() {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            const data = fs.readFileSync(STATUS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('⚠️ Error leyendo archivo de estado, creando nuevo:', error.message);
    }
    return { lastEmailSent: null, lastCheckDate: null };
}

function saveEmailStatus(status) {
    try {
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
        console.log('💾 Estado guardado correctamente');
    } catch (error) {
        console.error('❌ Error guardando estado:', error.message);
    }
}

function shouldSendEmail(aperturaResult) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const status = loadEmailStatus();
    
    console.log(`\n📅 Verificando estado de emails:`);
    console.log(`Fecha actual: ${today}`);
    console.log(`Último email enviado: ${status.lastEmailSent || 'Nunca'}`);
    console.log(`Inscripciones abiertas: ${aperturaResult}`);
    
    // Si las inscripciones no están abiertas, no enviar
    if (!aperturaResult) {
        console.log('💤 No hay inscripciones abiertas, no se enviará email');
        return false;
    }
    
    // Si ya enviamos email hoy, no reenviar
    if (status.lastEmailSent === today) {
        console.log('📧 Ya se envió notificación hoy, evitando reenvío');
        return false;
    }
    
    // Si llegamos aquí, hay inscripciones abiertas y no hemos enviado email hoy
    console.log('✅ Condiciones cumplidas para enviar email');
    return true;
}

function markEmailAsSent() {
    const today = new Date().toISOString().split('T')[0];
    const status = loadEmailStatus();
    status.lastEmailSent = today;
    status.lastCheckDate = new Date().toISOString();
    saveEmailStatus(status);
    console.log(`📧 Marcado como enviado para el día: ${today}`);
}

// Función para enviar email de notificación
async function sendEmailNotification(aperturaResult, detailedInfo) {
    try {
        console.log('\n📧 Preparando envío de notificación por email...');
        
        // Configurar el transportador de email
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Preparar el contenido del email
        const emailSubject = '🚨 ALERTA: Inscripciones CILS Abiertas - IIC Buenos Aires';
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert { background-color: #f44336; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background-color: #e7f3ff; padding: 15px; border-left: 5px solid #0066cc; margin: 20px 0; }
        .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 NOTIFICACIÓN AUTOMÁTICA - SCRAPER IIC</h1>
        <p>Instituto Italiano di Cultura - Buenos Aires</p>
    </div>
    
    <div class="content">
        <div class="alert">
            <h2>🚨 ¡INSCRIPCIONES ABIERTAS DETECTADAS!</h2>
            <p><strong>Se han detectado fechas en los campos de "Apertura iscrizioni"</strong></p>
        </div>
        
        <div class="info">
            <h3>📊 Información del Análisis:</h3>
            <ul>
                <li><strong>Fecha y hora del análisis:</strong> ${new Date().toLocaleString('es-ES')}</li>
                <li><strong>URL analizada:</strong> <a href="${targetUrl}">${targetUrl}</a></li>
                <li><strong>Estado de Apertura Iscrizioni:</strong> ${aperturaResult ? '✅ TIENE VALORES' : '❌ VACÍO'}</li>
                <li><strong>Resultado:</strong> ${aperturaResult}</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>⚡ Acción Recomendada:</h3>
            <p>Se recomienda verificar inmediatamente la página web oficial para confirmar las fechas de inscripción y proceder según sea necesario.</p>
            <p><a href="${targetUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📋 VER PÁGINA OFICIAL</a></p>
        </div>
        
        ${detailedInfo ? `
        <div class="info">
            <h3>📝 Detalles Técnicos:</h3>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">${detailedInfo}</pre>
        </div>
        ` : ''}
    </div>
    
    <div class="footer">
        <p>📧 Email enviado automáticamente por el sistema de monitoreo IIC Buenos Aires</p>
        <p>🤖 Generado el ${new Date().toLocaleString('es-ES')}</p>
    </div>
</body>
</html>
        `;

        // Lista de destinatarios
        const recipients = [
            process.env.EMAIL_TO_1,
            process.env.EMAIL_TO_2
        ].filter(email => email); // Filtrar emails válidos

        if (recipients.length === 0) {
            console.log('❌ No se encontraron emails de destinatarios válidos en el .env');
            return false;
        }

        // Configurar el mensaje
        const mailOptions = {
            from: `"🤖 IIC Scraper Bot" <${process.env.EMAIL_USER}>`,
            to: recipients.join(', '),
            subject: emailSubject,
            html: emailBody
        };

        // Enviar el email
        console.log(`📨 Enviando notificación a: ${recipients.join(', ')}`);
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado exitosamente!');
        console.log('📧 Message ID:', info.messageId);
        console.log('👥 Destinatarios notificados:', recipients.length);
        
        return true;

    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        if (error.code === 'EAUTH') {
            console.error('🔑 Error de autenticación. Verifica EMAIL_USER y EMAIL_PASSWORD en el .env');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🌐 Error de conexión. Verifica la configuración SMTP en el .env');
        }
        return false;
    }
}

// Función para verificar si hay valores en los campos de "Apertura iscrizioni"
function checkAperturaIscrizioni(htmlContent) {
    try {
        console.log('\n🔍 Analizando campos de "Apertura iscrizioni"...');
        
        // Crear un DOM virtual del HTML
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        
        // Buscar la tabla que contiene "Apertura iscrizioni"
        const tables = document.querySelectorAll('table');
        let aperturaColumnIndex = -1;
        let targetTable = null;
        
        // Buscar la tabla correcta y el índice de la columna "Apertura iscrizioni"
        for (let table of tables) {
            const headerRow = table.querySelector('tr');
            if (headerRow) {
                const headerCells = headerRow.querySelectorAll('td');
                headerCells.forEach((cell, index) => {
                    if (cell.textContent.includes('Apertura iscrizioni')) {
                        aperturaColumnIndex = index;
                        targetTable = table;
                        console.log('✅ Encontrada tabla con "Apertura iscrizioni" en columna:', index);
                    }
                });
            }
        }
        
        if (aperturaColumnIndex === -1 || !targetTable) {
            console.log('❌ No se encontró la columna "Apertura iscrizioni"');
            return false;
        }
        
        // Obtener todas las filas de datos (excluir la fila de encabezado)
        const dataRows = Array.from(targetTable.querySelectorAll('tr')).slice(1);
        console.log(`📊 Analizando ${dataRows.length} filas de datos`);
        
        // Verificar el contenido de cada celda en la columna "Apertura iscrizioni"
        let hasAnyValue = false;
        let emptyCount = 0;
        
        dataRows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > aperturaColumnIndex) {
                const aperturaCell = cells[aperturaColumnIndex];
                const cellContent = aperturaCell.textContent.trim();
                
                console.log(`📍 Fila ${rowIndex + 1} - Contenido: "${cellContent}" (Longitud: ${cellContent.length})`);
                
                if (cellContent.length > 0) {
                    console.log(`✅ Fila ${rowIndex + 1}: Tiene valor`);
                    hasAnyValue = true;
                } else {
                    console.log(`⭕ Fila ${rowIndex + 1}: Está vacía`);
                    emptyCount++;
                }
            }
        });
        
        console.log(`\n📈 RESUMEN:`);
        console.log(`Total de filas analizadas: ${dataRows.length}`);
        console.log(`Filas vacías: ${emptyCount}`);
        console.log(`Filas con contenido: ${dataRows.length - emptyCount}`);
        console.log(`¿Alguna tiene valor?: ${hasAnyValue}`);
        
        return hasAnyValue;
        
    } catch (error) {
        console.error('❌ Error analizando el HTML:', error.message);
        return false;
    }
}

// URL objetivo para el scraping
const targetUrl = 'https://iicbuenosaires.esteri.it/it/lingua-e-cultura/certificazioni/';

// Función principal para hacer el scraping
async function scrapePage() {
    try {
        console.log('Iniciando scraping de:', targetUrl);
        
        // Configuración de headers para simular un navegador real
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000 // 10 segundos de timeout
        };

        // Hacer la petición HTTP
        const response = await axios.get(targetUrl, config);
        
        // Verificar que la petición fue exitosa
        if (response.status === 200) {
            console.log('✅ Página obtenida exitosamente');
            console.log('Tamaño del HTML:', response.data.length, 'caracteres');
            
            // Analizar directamente los campos de "Apertura iscrizioni"
            const aperturaResult = checkAperturaIscrizioni(response.data);
            
            console.log('\n' + '='.repeat(60));
            console.log('🎯 RESULTADO FINAL:');
            console.log(`Los campos de "Apertura iscrizioni" tienen valores: ${aperturaResult}`);
            console.log('='.repeat(60));
            
            // Actualizar el estado siempre (para trackear última verificación)
            const status = loadEmailStatus();
            status.lastCheckDate = new Date().toISOString();
            
            // Verificar si debemos enviar email (considerando si ya se envió hoy)
            const shouldSend = shouldSendEmail(aperturaResult);
            
            if (shouldSend) {
                console.log('\n🚨 ¡INSCRIPCIONES ABIERTAS DETECTADAS!');
                console.log('📧 Enviando notificación por email...');
                
                const emailSent = await sendEmailNotification(aperturaResult, null);
                
                if (emailSent) {
                    markEmailAsSent();
                    console.log('✅ Email enviado y estado actualizado');
                } else {
                    console.log('❌ Error enviando email, estado no actualizado');
                    // Guardar al menos la fecha de verificación
                    saveEmailStatus(status);
                }
            } else if (aperturaResult && !shouldSend) {
                console.log('\n📧 Inscripciones abiertas pero email ya enviado hoy');
                console.log('⏭️ Saltando reenvío para evitar spam');
                saveEmailStatus(status);
            } else {
                console.log('\n💤 Las inscripciones aún no están abiertas');
                console.log('📧 No se enviará notificación');
                // Guardar fecha de verificación
                saveEmailStatus(status);
            }
            
            return {
                html: response.data,
                aperturaIscrizioni: aperturaResult,
                emailSent: shouldSend
            };
        } else {
            console.log('❌ Error: Código de respuesta HTTP:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error durante el scraping:', error.message);
        
        if (error.response) {
            console.error('Código de estado HTTP:', error.response.status);
            console.error('Headers de respuesta:', error.response.headers);
        }
        
        if (error.code === 'ECONNABORTED') {
            console.error('La petición tardó demasiado en responder (timeout)');
        }
    }
}

// Ejecutar el script
console.log('🚀 Iniciando script de scraping...\n');
scrapePage();