// Example usage in your controller

const { sendModifiedCita } = require('./services/emailService');
const sendAppointmentModification = async (clientEmail, clientName, originalDate, originalTime, newDate, newTime, appointmentType, petName) => {
  try {
    await sendModifiedCita(clientEmail, clientName, originalDate, originalTime, newDate, newTime, appointmentType, petName);
    console.log(`Modified appointment email sent to ${clientEmail}`);
  } catch (error) {
    console.error(`Failed to send modified appointment email to ${clientEmail}:`, error);
  }
};

// ---------------------------------------------------------------------------------------------------

const { sendConfirmCita } = require('./services/emailService');
const sendAppointmentConfirmation = async (clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
    try {
        await sendConfirmCita(clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName);
        console.log(`Confirmation email sent to ${clientEmail}`);
    } catch (error) {
        console.error(`Failed to send confirmation email to ${clientEmail}:`, error);
    }
};

// Test the function with sample data
sendAppointmentConfirmation(`el.bigote.vet@gmail.com`, `Don Bigote`, `20-11-2024`, `16:00`, `Vacunación`, `Ernestillo`);
sendAppointmentModification(
  'el.bigote.vet@gmail.com',
  'Don Bigote',
  '20-11-2024',
  '16:00',
  '25-11-2024',
  '10:00',
  'Consulta',
  'Ernestillo'
);

// ---------------------------------------------------------------------------------------------------

const { sendCancelledCita } = require('./services/emailService');
const sendAppointmentCancellation = async (clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  try {
    await sendCancelledCita(clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName);
    console.log(`Cancellation email sent to ${clientEmail}`);
  } catch (error) {
    console.error(`Failed to send cancellation email to ${clientEmail}:`, error);
  }
};

// sendAppointmentCancellation(
//   'el.bigote.vet@gmail.com',
//   'Don Bigote',
//   '20-11-2024',
//   '16:00',
//   'Consulta',
//   'Ernestillo'
// );

// ---------------------------------------------------------------------------------------------------

const { sendReminderCita } = require('./services/emailService');
const sendAppointmentReminder = async (clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName) => {
  try {
    await sendReminderCita(clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName);
    console.log(`Reminder email sent to ${clientEmail}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${clientEmail}:`, error);
  }
};

// sendAppointmentReminder(
//   'el.bigote.vet@gmail.com',
//   'Don Bigote',
//   '20-11-2024',
//   '16:00',
//   'Consulta',
//   'Ernestillo'
// );

// ---

const { sendForgotPasswordEmail } = require('./services/emailService');
const sendResetPassword = async (clientEmail, clientName, resetLink) => {
  try {
    await sendForgotPasswordEmail(clientEmail, clientName, resetLink);
    console.log(`Password email sent to ${clientEmail}`);
  } catch (error) {
    console.error(`Failed to send password email to ${clientEmail}:`, error);
  }
};

// sendResetPassword(
//   'valentino.vidaurre@ucr.ac.cr',
//   'Valentino',
//   'http://localhost:5173/reset-password?token=ae2d97b8ac14da59edf259ac25f3365cafcd669d8bc40bc5f743fa3230b546c6');
