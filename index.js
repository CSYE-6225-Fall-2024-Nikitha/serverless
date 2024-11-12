const mailgun = require('mailgun-js');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');


dotenv.config();

// Configure Mailgun
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  }
);

exports.verifyEmail = async (event) => {
  const { email, token, userName } = JSON.parse(event.body);

  // Generate verification link
  const verificationLink = `https://nikitha-kambhampati.me/verify/${token}`;

  const emailData = {
    from: 'Exciting WebApp <no-reply@yourdomain.com>',
    to: email,
    subject: `Welcome, ${userName}! Please Verify Your Email`,
    html: `
  <p>Hi ${userName},</p>
  <p>Thank you for registering with Nikitha's WebApp! We're excited to have you on board.</p>
  <p>To complete your registration, please click the link below to verify your email address:</p>
  <p><a href="${verificationLink}" style="color: #3498db; text-decoration: none; font-weight: bold;">Verify Your Email</a></p>
  <p>This link will expire in 2 minutes, so please make sure to verify your email as soon as possible.</p>
  <p>If you did not sign up for this account, please disregard this email.</p>
  <p>Best regards,<br>Exciting WebApp Team</p>
`

  };

  try {
    await mg.messages().send(emailData);
    console.log(`Verification email sent to ${email}`);

    const currentTime = new Date();

    await EmailTrack.create({
      email_id: null,
      verification_token: token,
      verification_link: verificationLink,
      expires_at: new Date(currentTime.getTime() + 2 * 60000),  
      sent_date: currentTime,
      sns_message_id: event.messageId,  
      userId: userName,
      is_verified: false,  
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Verification email sent successfully!' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);

    await EmailTrack.create({
      email_id: null, 
      verification_token: token,
      verification_link: null,
      expires_at: new Date(),
      sent_date: new Date(),
      sns_message_id: event.messageId, 
      userId: userName, 
      is_verified: false,
      errorMessage: error.message || 'Failed to send email',
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send verification email.' }),
    };
  }
};
