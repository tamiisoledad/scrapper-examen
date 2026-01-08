const nodemailer = require('nodemailer');
require('dotenv').config();

// Función para enviar email de alerta semanal
async function sendWeeklyAlert() {
    try {
        console.log('📅 Preparando alerta semanal del sistema...');
        
        // Configurar el transportador de email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Obtener fecha actual
        const now = new Date();
        const argentineTime = new Intl.DateTimeFormat('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(now);

        // Preparar el contenido del email
        const emailSubject = '💚 Alerta Semanal - Sistema IIC Funcionando Correctamente';
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status-ok { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #28a745; }
        .info { background-color: #e7f3ff; padding: 15px; border-left: 5px solid #0066cc; margin: 20px 0; }
        .schedule { background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0; }
        .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💚 ALERTA SEMANAL DEL SISTEMA</h1>
        <p>Monitor de Inscripciones CILS - IIC Buenos Aires</p>
    </div>
    
    <div class="content">
        <div class="status-ok">
            <h2><span class="emoji">✅</span> Sistema Operativo y Funcionando</h2>
            <p><strong>El sistema de monitoreo automático está funcionando correctamente</strong></p>
        </div>
        
        <div class="info">
            <h3>📊 Información del Sistema:</h3>
            <ul>
                <li><strong>Fecha de este reporte:</strong> ${argentineTime}</li>
                <li><strong>Estado del sistema:</strong> <span style="color: #28a745; font-weight: bold;">ACTIVO ✅</span></li>
                <li><strong>URL monitoreada:</strong> <a href="https://iicbuenosaires.esteri.it/it/lingua-e-cultura/certificazioni/">IIC Buenos Aires - Certificazioni</a></li>
                <li><strong>Función:</strong> Detección automática de apertura de inscripciones CILS</li>
            </ul>
        </div>
        
        <div class="schedule">
            <h3>⏰ Horarios de Monitoreo Automático:</h3>
            <table>
                <tr>
                    <th>Hora (Argentina)</th>
                    <th>Frecuencia</th>
                    <th>Propósito</th>
                </tr>
                <tr>
                    <td>🌅 07:00 AM</td>
                    <td>Lunes a Domingo</td>
                    <td>Verificación matutina</td>
                </tr>
                <tr>
                    <td>🌞 01:00 PM</td>
                    <td>Lunes a Domingo</td>
                    <td>Verificación del mediodía</td>
                </tr>
                <tr>
                    <td>🌙 07:00 PM</td>
                    <td>Lunes a Domingo</td>
                    <td>Verificación vespertina</td>
                </tr>
                <tr style="background-color: #fff3cd;">
                    <td>📅 09:00 AM</td>
                    <td>Solo Jueves</td>
                    <td><strong>Alerta semanal (este email)</strong></td>
                </tr>
            </table>
        </div>
        
        <div class="info">
            <h3>🎯 ¿Qué hace el sistema?</h3>
            <ul>
                <li><strong>Monitoreo 24/7:</strong> Verifica automáticamente si se abren las inscripciones CILS</li>
                <li><strong>Notificación instantánea:</strong> Envía email inmediatamente cuando detecta inscripciones abiertas</li>
                <li><strong>Control de spam:</strong> Solo envía una notificación por día para evitar emails duplicados</li>
                <li><strong>Alerta semanal:</strong> Confirma que el sistema está activo (este email)</li>
            </ul>
        </div>
        
        <div class="status-ok">
            <h3>✅ Estado Actual del Monitoreo</h3>
            <p><strong>El sistema continuará monitoreando automáticamente las inscripciones.</strong></p>
            <p>Si las inscripciones se abren, recibirás una notificación inmediata por separado.</p>
            <p>El próximo reporte semanal será el jueves siguiente a las 9:00 AM.</p>
        </div>
    </div>
    
    <div class="footer">
        <p>📧 Alerta semanal automática - Sistema de Monitoreo IIC Buenos Aires</p>
        <p>🤖 Generado automáticamente el ${argentineTime}</p>
        <p>💚 Si recibes este email, significa que todo funciona perfectamente</p>
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
            from: `"💚 IIC Monitor Semanal" <${process.env.EMAIL_USER}>`,
            to: recipients.join(', '),
            subject: emailSubject,
            html: emailBody
        };

        // Enviar el email
        console.log(`📨 Enviando alerta semanal a: ${recipients.join(', ')}`);
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Alerta semanal enviada exitosamente!');
        console.log('📧 Message ID:', info.messageId);
        console.log('👥 Destinatarios notificados:', recipients.length);
        console.log(`📅 Próxima alerta: Jueves siguiente a las 9:00 AM ARG`);
        
        return true;

    } catch (error) {
        console.error('❌ Error enviando alerta semanal:', error.message);
        if (error.code === 'EAUTH') {
            console.error('🔑 Error de autenticación. Verifica EMAIL_USER y EMAIL_PASSWORD en el .env');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🌐 Error de conexión. Verifica la configuración SMTP en el .env');
        }
        return false;
    }
}

// Función principal
async function main() {
    try {
        console.log('📅 Iniciando alerta semanal del sistema...\n');
        
        const result = await sendWeeklyAlert();
        
        console.log('\n' + '='.repeat(60));
        if (result) {
            console.log('💚 ALERTA SEMANAL ENVIADA CORRECTAMENTE');
        } else {
            console.log('❌ ERROR ENVIANDO ALERTA SEMANAL');
        }
        console.log('='.repeat(60));
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en alerta semanal:', error.message);
        return false;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

// Exportar para uso en otros archivos
module.exports = { sendWeeklyAlert, main };