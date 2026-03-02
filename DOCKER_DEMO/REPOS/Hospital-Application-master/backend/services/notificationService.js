const nodemailer = require('nodemailer');

// Email configuration


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send appointment confirmation email
const sendAppointmentConfirmation = async (appointment, patientEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Appointment Confirmation - HealthCare Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>HealthCare Plus</h1>
            <h2>Appointment Confirmation</h2>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment has been successfully scheduled with the following details:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Appointment Details</h3>
              <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
              <p><strong>Department:</strong> ${appointment.department}</p>
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <p><strong>Symptoms:</strong> ${appointment.symptoms}</p>
            </div>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #007bff; margin-top: 0;">Important Reminders:</h4>
              <ul>
                <li>Please arrive 15 minutes before your scheduled time</li>
                <li>Bring any relevant medical records or test results</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>HealthCare Plus Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
  }
};

// Send appointment reminder email
const sendAppointmentReminder = async (appointment, patientEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Appointment Reminder - HealthCare Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>HealthCare Plus</h1>
            <h2>Appointment Reminder</h2>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <p>Dear ${appointment.patientName},</p>
            <p>This is a friendly reminder about your upcoming appointment:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Appointment Details</h3>
              <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
              <p><strong>Department:</strong> ${appointment.department}</p>
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
            </div>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #28a745; margin-top: 0;">Please Remember:</h4>
              <ul>
                <li>Arrive 15 minutes before your scheduled time</li>
                <li>Bring your ID and insurance information</li>
                <li>Bring any relevant medical records</li>
                <li>If you need to cancel, please call us immediately</li>
              </ul>
            </div>
            
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>HealthCare Plus Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment reminder email sent successfully');
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
  }
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (appointment, patientEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Appointment Cancellation - HealthCare Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>HealthCare Plus</h1>
            <h2>Appointment Cancelled</h2>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment has been cancelled as requested:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #dc3545; margin-top: 0;">Cancelled Appointment Details</h3>
              <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
              <p><strong>Department:</strong> ${appointment.department}</p>
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
            </div>
            
            <p>If you would like to reschedule, please visit our patient portal or contact us directly.</p>
            <p>Thank you for choosing HealthCare Plus.</p>
            <p>Best regards,<br>HealthCare Plus Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment cancellation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment cancellation email:', error);
  }
};

// Send SMS notification (placeholder - would need SMS service integration)
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // This is a placeholder for SMS integration
    // You would integrate with services like Twilio, AWS SNS, etc.
    console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
    
    // Example Twilio integration:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendSMSNotification
}; 

