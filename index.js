const mailgun = require('mailgun-js');
const dotenv = require('dotenv');

dotenv.config();

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN });

exports.verifyEmail = async (event) => {
  const snsMessage = JSON.parse(event.Records[0].Sns.Message);
  const { email, first_name, last_name, token } = snsMessage;

  // Generate the verification link
  const verificationLink = `https://${domain}.nikitha-kambhampati.me/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  const emailData = {
    from: 'Exciting WebApp <no-reply@nikitha-kambhampati.com>',
    to: email,
    subject: `Welcome, ${first_name}! Please Verify Your Email`,
    html: `
      <p>Hi ${first_name} ${last_name},</p>
      <p>Thank you for registering with our WebApp! Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Your Email</a></p>
      <p>This link will expire in 2 minutes.</p>
    `
  };

  try {
    // Send the verification email
    await mg.messages().send(emailData);
    console.log(`Verification email sent to ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Verification email sent successfully!' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send verification email.' }),
    };
  }
};

