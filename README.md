# PMATT Micro VC API

A Node.js Express API for PMATT Micro VC platform with payment processing, email notifications, OTP verification, and reCAPTCHA integration.

## Getting Started

### Prerequisites
- Node.js 22.x
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=noreply@pmattscatalysts.com

# Backoffice Team Emails (comma-separated for multiple emails)
BACKOFFICE_EMAILS=email@pmattscatalysts.com,anvinaikumar@gmail.com,brijender.s@gmail.com

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Server Configuration
PORT=5000

# Add other environment variables as needed for your specific setup
```

### Running the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in your .env file).

## API Endpoints

### Health Check (`/health`)
- `GET /health` - Check API health and connectivity status

### Payment Routes (`/payment`)
- Payment processing endpoints

### Email Routes (`/email`)
- `POST /email/send-investment-email` - Send investment emails
- `POST /email/send-acknowledge-email` - Send acknowledgment emails
- `POST /email/welcome-email` - Send welcome emails
- `POST /email/kyc-email` - Send KYC emails
- `POST /email/contact-us` - Send Contact Us form submissions to backoffice team

### Authentication Routes (`/auth`)
- `POST /auth/send-otp` - Send OTP to mobile
- `POST /auth/verify-otp` - Verify OTP

### reCAPTCHA Routes (`/recaptcha`)
- `POST /recaptcha/validate-token` - Validate reCAPTCHA tokens

## Contact Us Form Integration

The API includes Contact Us form processing functionality:

**Endpoint:** `POST /email/contact-us`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "emailAddress": "john.doe@example.com",
  "phoneNumber": "+91 9876543210",
  "subject": "Investment Opportunities",
  "message": "I'm interested in learning more about your investment opportunities.",
  "recaptchaToken": "your_recaptcha_token_here"
}
```

**Response:**
- Success: `200 OK` with success message
- Validation Error: `400 Bad Request` with error details
- Server Error: `500 Internal Server Error`

**Features:**
- Validates all required fields
- Email format validation
- Indian phone number validation
- Sends formatted HTML email to backoffice team
- Supports multiple recipient emails (comma-separated in .env)
- Includes submission timestamp and contact details

## Health Check Integration

The API includes a comprehensive health check endpoint for frontend connectivity testing:

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "PMatts API is running successfully",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "endpoints": {
      "health": "/health",
      "email": "/email",
      "payment": "/payment",
      "auth": "/auth",
      "recaptcha": "/recaptcha"
    },
    "services": {
      "email": "Brevo (SibApiV3Sdk)",
      "recaptcha": "Google reCAPTCHA",
      "database": "Supabase"
    },
    "environment": {
      "nodeEnv": "production",
      "port": 5000,
      "hasBrevoApiKey": true,
      "hasSenderEmail": true,
      "hasBackofficeEmails": true,
      "hasRecaptchaSecret": true
    },
    "system": {
      "nodeVersion": "v22.0.0",
      "platform": "linux",
      "memoryUsage": {
        "heapUsed": 52428800,
        "heapTotal": 104857600
      },
      "uptime": 3600
    },
    "checks": {
      "server": "OK",
      "environment": "OK",
      "memory": "OK",
      "uptime": "OK"
    }
  }
}
```

**Features:**
- API connectivity verification
- Environment variable status (without exposing sensitive data)
- System resource monitoring
- Service availability checks
- Frontend debugging support

## reCAPTCHA Integration

The API includes reCAPTCHA verification functionality:

**Endpoint:** `POST /recaptcha/validate-token`

**Request Body:**
```json
{
  "recaptchaToken": "your_recaptcha_token_here"
}
```

**Response:**
- Success: `200 OK` with verification details
- Failure: `400 Bad Request` with error details
- Server Error: `500 Internal Server Error`

## Build and Test
TODO: Add testing instructions

## Contribute
TODO: Add contribution guidelines
