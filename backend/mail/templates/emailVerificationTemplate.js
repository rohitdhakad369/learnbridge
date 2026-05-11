const otpTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>

  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification Email</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, sans-serif;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      .logo {
        width: 120px;
        margin-bottom: 20px;
      }

      .title {
        font-size: 28px;
        font-weight: bold;
        color: #111827;
        margin-bottom: 10px;
      }

      .message {
        font-size: 16px;
        color: #4b5563;
        line-height: 1.6;
      }

      .otp-box {
        display: inline-block;
        margin: 25px 0;
        padding: 15px 35px;
        background-color: #FFD60A;
        color: #000;
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 5px;
        border-radius: 8px;
      }

      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #9ca3af;
      }

      a {
        color: #2563eb;
        text-decoration: none;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <!-- Logo -->
      <img 
        class="logo"
        src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" 
        alt="LearnBridge Logo"
      />

      <div class="title">
        OTP Verification
      </div>

      <div class="message">
        <p>Hello User,</p>

        <p>
          Thank you for registering with <strong>LearnBridge</strong>.
          Please use the OTP below to verify your account:
        </p>

        <div class="otp-box">
          ${otp}
        </div>

        <p>
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request this email, you can safely ignore it.
        </p>
      </div>

      <div class="footer">
        Need help? Contact us at
        <a href="mailto:info@learnbridge.com">
          info@learnbridge.com
        </a>
      </div>

    </div>
  </body>

  </html>
  `;
};

module.exports = otpTemplate;