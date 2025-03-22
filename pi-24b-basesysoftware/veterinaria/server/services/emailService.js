require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const { generateAppointmentEmail, 
        generateModifiedAppointmentEmail, 
        generateCancelledAppointmentEmail,
        generateReminderAppointmentEmail,
        generateForgotPasswordEmail
      } = require('./emailTemplates');
      
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
  connectionTimeout: 10000,
  // logger: true,
  // debug: true,
});

// Define a function to send an email
const sendGeneralEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USERNAME, // sender address
      to, // recipient
      subject,
      text, // plain text body
      html, // HTML body, optional
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} successfully`);
  } catch (error) {
    console.error('Error sending email:', error);

    // Custom error handling for authentication issues
    if (error.response && error.response.includes('5.7.0')) {
      console.error('OAuth authentication error. Check your OAuth2 credentials.');
    }

    throw error;
  }
};

const sendConfirmCita = async (to, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  const htmlContent = generateAppointmentEmail(clientName, appointmentDate, appointmentTime, appointmentType, petName);

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to,
    subject: 'Confirmación de tu Cita - Veterinaria El Bigote',
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: path.resolve(__dirname, '../../client/src/assets/homeAssets/gatilloAzulillo.png'), // Use an absolute path
        cid: 'companyLogo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Appointment confirmation email sent to ${to}`);
};

const sendModifiedCita = async (to, clientName, originalDate, originalTime, newDate, newTime, appointmentType, petName) => {
  const htmlContent = generateModifiedAppointmentEmail(clientName, originalDate, originalTime, newDate, newTime, appointmentType, petName);

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to,
    subject: 'Modificación de tu Cita - Veterinaria El Bigote',
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: path.resolve(__dirname, '../../client/src/assets/homeAssets/gatilloAzulillo.png'), // Adjust the path
        cid: 'companyLogo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Modified appointment email sent to ${to}`);
};

const sendCancelledCita = async (to, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  const htmlContent = generateCancelledAppointmentEmail(clientName, appointmentDate, appointmentTime, appointmentType, petName);

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to,
    subject: 'Cancelación de tu Cita - Veterinaria El Bigote',
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: path.resolve(__dirname, '../../client/src/assets/homeAssets/gatilloAzulillo.png'),
        cid: 'companyLogo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Cancellation email sent to ${to}`);
};

const sendReminderCita = async (to, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  const htmlContent = generateReminderAppointmentEmail(clientName, appointmentDate, appointmentTime, appointmentType, petName);

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to,
    subject: 'Recordatorio de tu Cita - Veterinaria El Bigote',
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: path.resolve(__dirname, '../../client/src/assets/homeAssets/gatilloAzulillo.png'),
        cid: 'companyLogo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Appointment reminder email sent to ${to}`);
};

const sendForgotPasswordEmail = async (to, clientName, resetLink) => {
  try {
    const htmlContent = generateForgotPasswordEmail(clientName, resetLink);

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to,
      subject: 'Restablecer tu Contraseña - Veterinaria El Bigote',
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: path.resolve(__dirname, '../../client/src/assets/homeAssets/gatilloAzulillo.png'),
          cid: 'companyLogo'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${to}:`, error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

module.exports = {
  sendGeneralEmail,
  sendConfirmCita,
  sendModifiedCita,
  sendCancelledCita,
  sendReminderCita,
  sendForgotPasswordEmail
};