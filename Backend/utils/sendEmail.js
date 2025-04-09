const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Validate required environment variables
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_EMAIL',
    'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL',
    'SMTP_FROM_NAME'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  console.log('Creating email transporter with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: '***' // Don't log the actual password
    }
  });

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    throw new Error(`SMTP connection failed: ${error.message}`);
  }

  // Prepare the email message
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  console.log('Sending email:', {
    from: message.from,
    to: message.to,
    subject: message.subject
  });

  // Send the email
  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", {
      messageId: info.messageId,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", {
      error: error.message,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
