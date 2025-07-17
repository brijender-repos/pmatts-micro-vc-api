const axios = require('axios');

exports.validateRecaptchaToken = async (req, res) => {
  const { recaptchaToken, ...formData } = req.body;

  console.log(formData);

  // Validate input
  if (!recaptchaToken) {
    return res.status(400).json({ error: 'reCAPTCHA token is required' });
  }

  // 1. Verify the token with Google
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(verificationUrl, null, {
      params: {
        secret: secretKey,
        response: recaptchaToken,
      },
    });

    const { success, score, action } = response.data;

    if (!success) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed',
        details: response.data['error-codes'] || [],
      });
    }

    // Optional: Check score for v3 reCAPTCHA
    if (score !== undefined && score < 0.5) {
      return res.status(400).json({
        error: 'reCAPTCHA score too low',
        score: score,
      });
    }

    res.status(200).json({
      message: 'reCAPTCHA verification success!',
      score: score,
      action: action,
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    res
      .status(500)
      .json({ error: 'Server error during reCAPTCHA verification' });
  }
};
