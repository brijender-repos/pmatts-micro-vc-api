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
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/payment', paymentRoutes);
app.use('/email', emailRoutes);
app.use('/auth', smsRouter);
app.use('/recaptcha', recaptchaRoutes);

app.listen(port, () => {
  console.log(`App is running at PORT: http://localhost:${port}`);
});
