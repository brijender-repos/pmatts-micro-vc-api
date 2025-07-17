const healthCheck = async (req, res) => {
  try {
    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Check environment variables (without exposing sensitive data)
    const envStatus = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      hasBrevoApiKey: !!process.env.BREVO_API_KEY,
      hasSenderEmail: !!process.env.SENDER_EMAIL,
      hasBackofficeEmails: !!process.env.BACKOFFICE_EMAILS,
      hasRecaptchaSecret: !!process.env.RECAPTCHA_SECRET_KEY,
    };

    // System information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    // API status
    const apiStatus = {
      status: 'healthy',
      timestamp: timestamp,
      version: '1.0.0',
      endpoints: {
        health: '/health',
        email: '/email',
        payment: '/payment',
        auth: '/auth',
        recaptcha: '/recaptcha',
      },
      services: {
        email: 'Brevo (SibApiV3Sdk)',
        recaptcha: 'Google reCAPTCHA',
        database: 'Supabase',
      },
    };

    // Create comprehensive health response
    const healthResponse = {
      success: true,
      message: 'PMatts API is running successfully',
      data: {
        ...apiStatus,
        environment: envStatus,
        system: systemInfo,
        checks: {
          server: 'OK',
          environment: Object.values(envStatus).every(Boolean)
            ? 'OK'
            : 'WARNING',
          memory:
            systemInfo.memoryUsage.heapUsed < 100 * 1024 * 1024
              ? 'OK'
              : 'WARNING', // Less than 100MB
          uptime: systemInfo.uptime > 0 ? 'OK' : 'ERROR',
        },
      },
    };

    // Set appropriate status code
    const hasWarnings = Object.values(healthResponse.data.checks).some(
      (check) => check === 'WARNING'
    );
    const hasErrors = Object.values(healthResponse.data.checks).some(
      (check) => check === 'ERROR'
    );

    const statusCode = hasErrors ? 503 : hasWarnings ? 200 : 200;

    res.status(statusCode).json(healthResponse);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: 'Internal server error during health check',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = healthCheck;
