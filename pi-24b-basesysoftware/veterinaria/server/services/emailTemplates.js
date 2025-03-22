const generateAppointmentEmail = (clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Cita</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
          }
          .header {
              text-align: center;
              padding: 20px 0;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
          }
          .content h1 {
              color: #333333;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #61A0F2;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="cid:companyLogo" alt="Logo de la Veterinaria El Bigote">
          </div>
          <div class="content">
              <h1>¡Hola, ${clientName}!</h1>
              <p>Queremos informarte que se ha registrado una nueva cita para tu mascota en nuestra veterinaria.</p>
              
              <h2>Detalles de la Cita</h2>
              <p><strong>Fecha:</strong> ${appointmentDate}</p>
              <p><strong>Hora:</strong> ${appointmentTime}</p>
              <p><strong>Tipo de Cita:</strong> ${appointmentType}</p>
              <p><strong>Mascota:</strong> ${petName}</p>

              <p>Si tienes alguna pregunta o necesitas reprogramar la cita, no dudes en contactarnos.</p>
              
              <p>Puedes ver más detalles en nuestro sitio web:</p>
              <p><a href="http://localhost:5173/" class="btn">Ir al sitio web</a></p>
          </div>
          <div class="footer">
              <p>Gracias por confiar en la Veterinaria El Bigote.</p>
              <p>&copy; 2024 Veterinaria El Bigote. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

const generateModifiedAppointmentEmail = (clientName, originalDate, originalTime, newDate, newTime, appointmentType, petName) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Modificación de Cita</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
          }
          .header {
              text-align: center;
              padding: 20px 0;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
          }
          .content h1 {
              color: #333333;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #61A0F2;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="cid:companyLogo" alt="Logo de la Veterinaria El Bigote">
          </div>
          <div class="content">
              <h1>¡Hola, ${clientName}!</h1>
              <p>Queremos informarte que tu cita ha sido modificada.</p>

              <h2>Detalles de la Cita Modificada</h2>
              <p><strong>Tipo de Cita:</strong> ${appointmentType}</p>
              <p><strong>Mascota:</strong> ${petName}</p>
              
              <h3>Fecha y Hora Original</h3>
              <p><strong>Fecha:</strong> ${originalDate}</p>
              <p><strong>Hora:</strong> ${originalTime}</p>
              
              <h3>Nueva Fecha y Hora</h3>
              <p><strong>Fecha:</strong> ${newDate}</p>
              <p><strong>Hora:</strong> ${newTime}</p>

              <p>Si tienes alguna pregunta o necesitas ajustar nuevamente la cita, no dudes en contactarnos.</p>

              <p>Puedes ver más detalles en nuestro sitio web:</p>
              <p><a href="http://localhost:5173/" class="btn">Ir al sitio web</a></p>
          </div>
          <div class="footer">
              <p>Gracias por confiar en la Veterinaria El Bigote.</p>
              <p>&copy; 2024 Veterinaria El Bigote. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

// server/services/emailTemplates.js

const generateCancelledAppointmentEmail = (clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cancelación de Cita</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
          }
          .header {
              text-align: center;
              padding: 20px 0;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
          }
          .content h1 {
              color: #333333;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #61A0F2;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="cid:companyLogo" alt="Logo de la Veterinaria El Bigote">
          </div>
          <div class="content">
              <h1>¡Hola, ${clientName}!</h1>
              <p>Lamentamos informarte que tu cita ha sido cancelada.</p>

              <h2>Detalles de la Cita Cancelada</h2>
              <p><strong>Fecha:</strong> ${appointmentDate}</p>
              <p><strong>Hora:</strong> ${appointmentTime}</p>
              <p><strong>Tipo de Cita:</strong> ${appointmentType}</p>
              <p><strong>Mascota:</strong> ${petName}</p>

              <p>Si deseas reprogramar la cita, visita nuestro sitio web para agendar una nueva cita en un momento conveniente para ti.</p>

              <p>Puedes ver más detalles en nuestro sitio web:</p>
              <p><a href="http://localhost:5173/" class="btn">Ir al sitio web</a></p>
          </div>
          <div class="footer">
              <p>Gracias por confiar en la Veterinaria El Bigote.</p>
              <p>&copy; 2024 Veterinaria El Bigote. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

const generateReminderAppointmentEmail = (clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Cita</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
          }
          .header {
              text-align: center;
              padding: 20px 0;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
          }
          .content h1 {
              color: #333333;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #61A0F2;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="cid:companyLogo" alt="Logo de la Veterinaria El Bigote">
          </div>
          <div class="content">
              <h1>¡Hola, ${clientName}!</h1>
              <p>Te recordamos que tienes una cita programada en nuestra veterinaria en las próximas 24 horas.</p>

              <h2>Detalles de la Cita</h2>
              <p><strong>Fecha:</strong> ${appointmentDate}</p>
              <p><strong>Hora:</strong> ${appointmentTime}</p>
              <p><strong>Tipo de Cita:</strong> ${appointmentType}</p>
              <p><strong>Mascota:</strong> ${petName}</p>

              <p>Si necesitas reprogramar o cancelar tu cita, visita nuestro sitio web o contáctanos directamente.</p>

              <p>Puedes ver más detalles en nuestro sitio web:</p>
              <p><a href="http://localhost:5173/" class="btn">Ir al sitio web</a></p>
          </div>
          <div class="footer">
              <p>Gracias por confiar en la Veterinaria El Bigote.</p>
              <p>&copy; 2024 Veterinaria El Bigote. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

const generateForgotPasswordEmail = (clientName, resetLink) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
          }
          .header {
              text-align: center;
              padding: 20px 0;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
          }
          .content h1 {
              color: #333333;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #61A0F2;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="cid:companyLogo" alt="Logo de la Veterinaria El Bigote">
          </div>
          <div class="content">
              <h1>¡Hola, ${clientName}!</h1>
              <p>Recibimos una solicitud para restablecer tu contraseña.</p>

              <p>Si solicitaste restablecer tu contraseña, haz clic en el siguiente enlace para crear una nueva:</p>

              <p><a href="${resetLink}" class="btn">Restablecer Contraseña</a></p>

              <p>Este enlace expirará en 1 hora por motivos de seguridad.</p>

              <p>Si no solicitaste un cambio de contraseña, puedes ignorar este mensaje.</p>
          </div>
          <div class="footer">
              <p>Gracias por confiar en la Veterinaria El Bigote.</p>
              <p>&copy; 2024 Veterinaria El Bigote. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

module.exports = {
  generateAppointmentEmail,
  generateModifiedAppointmentEmail,
  generateCancelledAppointmentEmail,
  generateReminderAppointmentEmail,
  generateForgotPasswordEmail,
};