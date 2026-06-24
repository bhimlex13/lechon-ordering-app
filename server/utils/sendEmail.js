const nodemailer = require('nodemailer');
const branding = require('../config/branding');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEMO MODE] Email that would have been sent to ${options.to}:`);
    console.log(`Subject: ${options.subject}`);
    console.log('---');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
    // --- FIX FOR SELF-SIGNED CERTIFICATE ERROR ---
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"${branding.name}" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

module.exports = sendEmail;