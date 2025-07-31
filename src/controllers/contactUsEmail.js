const SibApiV3Sdk = require('sib-api-v3-sdk');
const axios = require('axios');

const sendContactUsEmail = async (req, res) => {
  try {
    const {
      fullName,
      emailAddress,
      phoneNumber,
      subject,
      message,
      recaptchaToken,
    } = req.body;

    // Validate required fields
    if (!fullName || !emailAddress || !phoneNumber || !subject || !message) {
      return res.status(400).json({
        success: false,
        error:
          'All fields are required: fullName, emailAddress, phoneNumber, subject, message',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate phone number (basic validation for Indian numbers)
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA token is required',
      });
    }

    // Verify reCAPTCHA token with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    try {
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const response = await axios.post(verificationUrl, null, {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      });

      const { success, score, action } = response.data;

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'reCAPTCHA verification failed',
          details: response.data['error-codes'] || [],
        });
      }

      // Optional: Check score for v3 reCAPTCHA
      if (score !== undefined && score < 0.5) {
        return res.status(400).json({
          success: false,
          error: 'reCAPTCHA score too low',
          score: score,
        });
      }

      console.log('reCAPTCHA verification successful:', { score, action });
    } catch (recaptchaError) {
      console.error('reCAPTCHA verification error:', recaptchaError.message);
      return res.status(500).json({
        success: false,
        error: 'Server error during reCAPTCHA verification',
      });
    }

    // Get backoffice emails from environment variables
    const backofficeEmails = process.env.BACKOFFICE_EMAILS;
    if (!backofficeEmails) {
      return res.status(500).json({
        success: false,
        error: 'Backoffice emails not configured',
      });
    }

    // Parse emails (support multiple emails separated by comma)
    const emailList = backofficeEmails.split(',').map((email) => email.trim());

    // Create email HTML content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">PMatts Contact Us Form</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Full Name:</td>
                <td style="padding: 8px 0; color: #1e293b;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email Address:</td>
                <td style="padding: 8px 0; color: #1e293b;">
                  <a href="mailto:${emailAddress}" style="color: #2563eb; text-decoration: none;">${emailAddress}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone Number:</td>
                <td style="padding: 8px 0; color: #1e293b;">
                  <a href="tel:${phoneNumber}" style="color: #2563eb; text-decoration: none;">${phoneNumber}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                <td style="padding: 8px 0; color: #1e293b;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">Message</h2>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📅 Submission Details</h3>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              This email was sent from the PMatts Contact Us form. 
              Please respond to the sender directly using the email address provided above.
            </p>
          </div>
        </div>
      </div>`;

    // Initialize Brevo API Client
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const senderEmail = process.env.SENDER_EMAIL;

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: 'PMatts Contact Form',
      email: senderEmail,
    };

    // Send to all backoffice emails
    sendSmtpEmail.to = emailList.map((email) => ({ email }));

    sendSmtpEmail.subject = `New Contact Form Submission - ${subject}`;
    sendSmtpEmail.htmlContent = emailHtml;

    apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then(function (data) {
        console.log('Contact form email sent successfully:', data);
        res.json({
          success: true,
          message:
            "Your message has been sent successfully. We'll get back to you soon!",
          data,
        });
      })
      .catch(function (error) {
        console.error('Error sending contact form email:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to send message. Please try again later.',
        });
      });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.',
    });
  }
};

module.exports = sendContactUsEmail;
