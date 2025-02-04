const AWS = require('aws-sdk');
const mailgun = require('mailgun-js');
const secretsManager = new AWS.SecretsManager();

exports.verifyEmail = async (event) => {
  const snsMessage = JSON.parse(event.Records[0].Sns.Message);
  const { email, first_name, last_name, token } = snsMessage;

  try {
    const secretName = process.env.DOMAIN === 'dev' 
      ? 'mailgun-credentials-dev-kms' 
      : 'mailgun-credentials-demo-kms';
    
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

    let emailServiceCredentials;
    if (secretValue.SecretString) {
      emailServiceCredentials = JSON.parse(secretValue.SecretString);
    } else {
      const buff = Buffer.from(secretValue.SecretBinary, 'base64');
      emailServiceCredentials = JSON.parse(buff.toString('ascii'));
    }

    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = emailServiceCredentials;

    const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

    const verificationLink = `https://${process.env.DOMAIN}.nikitha-kambhampati.me/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    const emailData = {
      from: `CSYE6225 WebApp Support <webapp@${process.env.DOMAIN}.nikitha-kambhampati.me>`,
      to: email,
      subject: `Welcome, ${first_name}! Confirm your WebApp registration please!`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
            <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #0073e6; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px;">Welcome to WebApp, ${first_name}!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px;">
                  <p>Hi <strong>${first_name} ${last_name}</strong>,</p>
                  <p>Thank you for your interest in Webapp !!</p>
                  <p>Kindly, Confirm your registration here!</p>
                  <p style="text-align: center;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #0073e6; text-decoration: none; border-radius: 4px;">Verify Your Email</a>
                  </p>
                  <p>If you didn’t sign up for WebApp, please ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; text-align: center; background-color: #f1f1f1; font-size: 12px; color: #666;">
                  <p>&copy; ${new Date().getFullYear()} WebApp. All rights reserved.</p>
                  <p style="margin: 0;">WebApp, 123 WebApp Lane, Tech City, USA</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    };

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
