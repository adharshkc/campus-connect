const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'yahoo', 'hotmail', etc.
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password' // For Gmail, you might need an App Password
  }
});

// Email options


// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error occurred:', error.message);
  } else {
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  }
});