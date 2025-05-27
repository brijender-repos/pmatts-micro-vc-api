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
      <div
  lang="en-IN"
  link="#0563c1"
  vlink="#800000"
  dir="ltr"
  style="
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    color: #000;
    background: #fff;
  "
>
   <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    <strong>Dear ${userName},</strong>
  </p>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    Congratulations, and thank you for taking the first step in a journey that's
    not just about returns — but about
    <em>responsibility, recognition, and real impact</em>.
  </p>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    Your investment of <strong>Rs. 30,000</strong> into PMatts Community Shares
    has been successfully acknowledged. You are now officially a
    <strong>Founding Community Shareholder</strong> in a movement that is
    building India's most people-powered innovation platform.
  </p>
  <p style="line-height: 108%; margin-bottom: 0in; text-align: left">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAACCAYAAACAGXJZAAAAJ0lEQVRYhe3OAQkAMAwDsH3+RdTpbuJwGImCnCRTAAA8178DAABbXTzSAuMKrc/IAAAAAElFTkSuQmCC"
      name="Shape4"
      alt="Shape4"
      align="bottom"
      width="602"
      height="2"
    />
  </p>
  <h3
    style="
      line-height: 100%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
      font-size: 13pt;
      font-weight: bold;
    "
  >
    🌱 What You've Just Joined:
  </h3>
  <ul style="margin-left: 1em">
    <li
      style="
        line-height: 100%;
        margin-top: 0.19in;
        margin-bottom: 0in;
        text-align: left;
      "
    >
      <strong>Missing Matters</strong>: AI-powered smart boxes solving lost
      &amp; found problems nationwide
    </li>
    <li style="line-height: 100%; margin-bottom: 0in; text-align: left">
      <strong>MiniVersion</strong>: A hyperlocal digital economy that empowers
      local sellers, job seekers &amp; renters
    </li>
    <li style="line-height: 100%; margin-bottom: 0.19in; text-align: left">
      Future-ready projects that combine tech, impact, and nation-building
    </li>
  </ul>
  <p style="line-height: 108%; margin-bottom: 0in; text-align: left">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAACCAYAAACAGXJZAAAAJ0lEQVRYhe3OAQkAMAwDsH3+RdTpbuJwGImCnCRTAAA8178DAABbXTzSAuMKrc/IAAAAAElFTkSuQmCC"
      name="Shape5"
      alt="Shape5"
      align="bottom"
      width="602"
      height="2"
    />
  </p>
  <h3
    style="
      line-height: 100%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
      font-size: 13pt;
      font-weight: bold;
    "
  >
    📄 What You Will Receive:
  </h3>
  <ul style="margin-left: 1em">
    <li
      style="
        line-height: 100%;
        margin-top: 0.19in;
        margin-bottom: 0in;
        text-align: left;
      "
    >
      Your <strong>digitally signed Community Share Agreement</strong>
    </li>
    <li style="line-height: 100%; margin-bottom: 0in; text-align: left">
      Your <strong>Community Share Certificate</strong>
    </li>
    <li style="line-height: 100%; margin-bottom: 0in; text-align: left">
      Access to our <strong>investor update channel</strong>
    </li>
    <li style="line-height: 100%; margin-bottom: 0in; text-align: left">
      Priority access to future PMatts startup launches
    </li>
    <li style="line-height: 100%; margin-bottom: 0.19in; text-align: left">
      Referral rewards of <strong>Rs. 3,000</strong> for every new investor you
      bring in
    </li>
  </ul>
  <p style="line-height: 108%; margin-bottom: 0in; text-align: left">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAACCAYAAACAGXJZAAAAJ0lEQVRYhe3OAQkAMAwDsH3+RdTpbuJwGImCnCRTAAA8178DAABbXTzSAuMKrc/IAAAAAElFTkSuQmCC"
      name="Shape6"
      alt="Shape6"
      align="bottom"
      width="602"
      height="2"
    />
  </p>
  <h3
    style="
      line-height: 100%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
      font-size: 13pt;
      font-weight: bold;
    "
  >
    📈 Your Returns:
  </h3>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    Your returns are milestone-based, not fixed — just like real business.
    You'll be updated at each stage of project monetization and success.<br />And
    yes — you'll always be first in line for rewards, recognition, and
    reinvestment rounds.
  </p>
  <p style="line-height: 108%; margin-bottom: 0in; text-align: left">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAACCAYAAACAGXJZAAAAJ0lEQVRYhe3OAQkAMAwDsH3+RdTpbuJwGImCnCRTAAA8178DAABbXTzSAuMKrc/IAAAAAElFTkSuQmCC"
      name="Shape7"
      alt="Shape7"
      align="bottom"
      width="602"
      height="2"
    />
  </p>
  <h3
    style="
      line-height: 100%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
      font-size: 13pt;
      font-weight: bold;
    "
  >
    💬 Need Help or Have Questions?
  </h3>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    We're just a message away.<br />
    📧 info@pmatts.in<br />
    📲 +91-8008107889<br />
    🌐
    <a
      href="http://www.pmatts.com/"
      target="_new"
      style="color: #0563c1; text-decoration: underline"
      >www.pmatts.in</a
    >
  </p>
  <p style="line-height: 108%; margin-bottom: 0in; text-align: left">
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAACCAYAAACAGXJZAAAAJ0lEQVRYhe3OAQkAMAwDsH3+RdTpbuJwGImCnCRTAAA8178DAABbXTzSAuMKrc/IAAAAAElFTkSuQmCC"
      name="Shape8"
      alt="Shape8"
      align="bottom"
      width="602"
      height="2"
    />
  </p>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    <em
      >"This is not a pitch. This is a partnership. And we grow with people like
      you — bold enough to believe early."</em
    ><br />– <strong>Vinay Kumar Andapally</strong>, Founder &amp; Director
  </p>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    Welcome again —<br />Let's build impact, income, and India's future
    together.
  </p>
  <p
    style="
      line-height: 108%;
      margin-top: 0.19in;
      margin-bottom: 0.19in;
      text-align: left;
    "
  >
    Warm regards,<br /><strong>Team PMatts</strong>
  </p>
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
