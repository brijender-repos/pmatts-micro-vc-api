const SibApiV3Sdk = require('sib-api-v3-sdk');

const welcomeEmail = async (req, res) => {
  try {
    const { userName, userEmail } = req.body;

    console.log(userEmail, userName);

    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, error: 'userEmail is required' });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: auto;">
  <h2 style="color: #007BFF; text-align: center;">🎉 Congratulations, and Thank You!</h2>
  <p>Dear <strong>${userName}</strong>,</p>
  <p>You've taken the first step in a journey that's not just about returns—but about <strong>responsibility, recognition, and real impact.</strong></p>

  <p>You are now officially a <strong>🏆 PMatts Community Member</strong> in a movement that is building <strong>India's most people-powered innovation platform. 🌱</strong></p>

  <h3 style="color: #007BFF;">🚀 What You've Just Joined:</h3>
  <ul style="padding-left: 20px;">
    <li>🏷 <strong>Missing Matters</strong> – AI-powered smart boxes solving lost & found problems nationwide</li>
    <li>🏡 <strong>MiniVersion</strong> – A hyperlocal digital economy that empowers local sellers, job seekers & renters</li>
    <li>🌟 <strong>Future-ready projects</strong> that combine <strong>tech, impact, and nation-building</strong></li>
  </ul>

  <h3 style="color: #007BFF;">📜 What You Will Receive:</h3>
  <ul style="padding-left: 20px;">
    <li>✅ <strong>Digitally signed</strong> Community Share Agreement</li>
    <li>✅ <strong>Official Community Share Certificate</strong></li>
    <li>✅ <strong>Exclusive access</strong> to our investor update channel</li>
    <li>✅ <strong>Priority entry</strong> to future PMatts startup launches</li>
    <li>✅ <strong>Referral rewards</strong> of Rs. 3,000 for every new investor you bring in</li>
  </ul>

  <h3 style="color: #007BFF;">📈 Your Returns:</h3>
  <p>Your returns are <strong>milestone-based</strong>, not fixed—just like real business. You'll be updated at each stage of <strong>project monetization and success.</strong> And yes—you’ll always be <strong>first in line for rewards, recognition, and reinvestment rounds.</strong></p>

  <h3 style="color: #007BFF;">💬 Need Help or Have Questions?</h3>
  <p>We're just a message away!</p>
  <ul style="list-style: none; padding-left: 0;">
    <li>📩 <strong>Email:</strong> <a href="mailto:info@pmatts.in" style="color: #007BFF;">info@pmatts.in</a></li>
    <li>📱 <strong>Phone:</strong> <a href="tel:+918008107889" style="color: #007BFF;">+91-8008107889</a></li>
    <li>🌐 <strong>Website:</strong> <a href="http://www.pmatts.in" style="color: #007BFF;">www.pmatts.in</a></li>
  </ul>

  <blockquote style="border-left: 3px solid #007BFF; padding-left: 15px; font-style: italic; color: #555;">
    "This is not a pitch. This is a partnership. And we grow with people like you—bold enough to believe early."
    <br><strong>– Vinay Kumar Andapally, Founder & Director</strong>
  </blockquote>

  <p style="text-align: center; font-weight: bold; color: #007BFF;">✨ Welcome again—Let’s build impact, income, and India's future together! ✨</p>

  <p style="text-align: right;"><strong>Warm regards,</strong><br>Team PMatts</p>
</div>
`;

    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const senderEmail = process.env.SENDER_EMAIL;
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: 'PMatts Team',
      email: senderEmail,
    };
    sendSmtpEmail.to = [{ email: userEmail }];
    sendSmtpEmail.subject =
      "Welcome to PMatts — You're Now a Founding Community Shareholder 🚀";
    sendSmtpEmail.htmlContent = emailHtml;

    apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then(function (data) {
        console.log('Email sent successfully:', data);
        res.json({ success: true, data });
      })
      .catch(function (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = welcomeEmail;
