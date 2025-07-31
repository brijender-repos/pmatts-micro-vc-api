require('dotenv').config();
const express = require('express');
const cors = require('cors');

const paymentRoutes = require('./src/routes/paymentRoute.js');
const emailRoutes = require('./src/routes/emailRoute.js');
const smsRouter = require('./src/routes/otpRoute.js');
const recaptchaRoutes = require('./src/routes/recaptchaRoute.js');
const healthRoutes = require('./src/routes/healthRoute.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Routes
app.use('/health', healthRoutes);
app.use('/payment', paymentRoutes);
app.use('/email', emailRoutes);
app.use('/auth', smsRouter);
app.use('/recaptcha', recaptchaRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.listen(port, () => {
  console.log(`App is running at PORT: http://localhost:${port}`);
});
