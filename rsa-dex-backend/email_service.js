const nodemailer = require('nodemailer');

// Email configuration (in production, use environment variables)
const EMAIL_CONFIG = {
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'noreply@rsacrypto.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

const SUPPORT_EMAIL = 'support@rsacrypto.com';

// Create transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

// Email templates
const EMAIL_TEMPLATES = {
  userRegistration: (username, email, verificationToken) => ({
    to: email,
    subject: 'Welcome to RSA DEX - Please Verify Your Account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937;">Welcome to RSA DEX, ${username}!</h2>
        <p>Thank you for registering with RSA DEX. Please verify your email address to complete your registration.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <a href="http://localhost:3000/verify-email?token=${verificationToken}" 
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `
  }),

  kycSubmission: (userEmail, kycData) => ({
    to: userEmail,
    subject: 'RSA DEX - KYC Document Submitted Successfully',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937;">KYC Document Submitted</h2>
        <p>Your KYC (Know Your Customer) documents have been successfully submitted to RSA DEX.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Submission Details:</h3>
          <p><strong>Email:</strong> ${kycData.email}</p>
          <p><strong>Full Name:</strong> ${kycData.fullName}</p>
          <p><strong>Document Type:</strong> ${kycData.documentType}</p>
          <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Status:</strong> Pending Review</p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Our team will review your documents within 24-48 hours</li>
          <li>You will receive an email notification once the review is complete</li>
          <li>You can check your KYC status in your account dashboard</li>
        </ul>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          If you have any questions, please contact our support team at ${SUPPORT_EMAIL}
        </p>
      </div>
    `
  }),

  kycSupportNotification: (kycData) => ({
    to: SUPPORT_EMAIL,
    subject: `New KYC Submission - ${kycData.fullName}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">🔔 New KYC Submission Received</h2>
        <p>A new KYC document has been submitted and requires review.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Customer Information:</h3>
          <p><strong>Full Name:</strong> ${kycData.fullName}</p>
          <p><strong>Email:</strong> ${kycData.email}</p>
          <p><strong>Phone:</strong> ${kycData.phone || 'Not provided'}</p>
          <p><strong>Document Type:</strong> ${kycData.documentType}</p>
          <p><strong>Document Number:</strong> ${kycData.documentNumber || 'Not provided'}</p>
          <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3>Credit Card Information (if provided):</h3>
          <p><strong>Card Type:</strong> ${kycData.cardType || 'Not provided'}</p>
          <p><strong>Last 4 Digits:</strong> ${kycData.cardLast4 || 'Not provided'}</p>
        </div>
        
        <a href="http://localhost:3002/admin/kyc/review/${kycData.userId}" 
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review KYC Documents
        </a>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          Please review this submission within 24 hours as per our compliance requirements.
        </p>
      </div>
    `
  })
};

// Email sending functions
const sendEmail = async (emailOptions) => {
  try {
    const mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      ...emailOptions
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${emailOptions.to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

const sendUserRegistrationEmail = async (username, email, verificationToken) => {
  const emailTemplate = EMAIL_TEMPLATES.userRegistration(username, email, verificationToken);
  return await sendEmail(emailTemplate);
};

const sendKYCSubmissionEmails = async (kycData) => {
  // Send confirmation to user
  const userEmailTemplate = EMAIL_TEMPLATES.kycSubmission(kycData.email, kycData);
  const userEmailResult = await sendEmail(userEmailTemplate);

  // Send notification to support
  const supportEmailTemplate = EMAIL_TEMPLATES.kycSupportNotification(kycData);
  const supportEmailResult = await sendEmail(supportEmailTemplate);

  return {
    userEmail: userEmailResult,
    supportEmail: supportEmailResult
  };
};

// API endpoints for email service
const setupEmailRoutes = (app) => {
  // KYC submission endpoint
  app.post('/api/kyc/submit', async (req, res) => {
    try {
      const kycData = {
        userId: req.body.userId || 'guest',
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        documentType: req.body.documentType,
        documentNumber: req.body.documentNumber,
        cardType: req.body.cardType,
        cardLast4: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
        submittedAt: new Date().toISOString()
      };

      // Send emails
      const emailResults = await sendKYCSubmissionEmails(kycData);

      console.log(`📋 KYC submitted for ${kycData.fullName} (${kycData.email})`);
      
      res.json({
        success: true,
        data: {
          submissionId: `kyc_${Date.now()}`,
          status: 'submitted',
          submittedAt: kycData.submittedAt
        },
        message: 'KYC documents submitted successfully. You will receive confirmation emails shortly.',
        emailStatus: emailResults
      });
    } catch (error) {
      console.error('KYC submission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit KYC documents'
      });
    }
  });

  // User registration with email verification
  app.post('/api/users/register-with-email', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Generate verification token
      const verificationToken = require('crypto').randomBytes(32).toString('hex');
      
      // Save user to database (in memory for demo)
      const newUser = {
        id: Date.now(),
        username,
        email,
        password: `[HASHED_${require('crypto').createHash('sha256').update(password).digest('hex')}]`,
        isVerified: false,
        verificationToken,
        createdAt: new Date().toISOString()
      };

      // Send verification email
      const emailResult = await sendUserRegistrationEmail(username, email, verificationToken);

      console.log(`👤 User registered with email verification: ${username} (${email})`);
      
      res.json({
        success: true,
        data: { id: newUser.id, username, email, isVerified: false },
        message: 'Registration successful! Please check your email to verify your account.',
        emailStatus: emailResult
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user'
      });
    }
  });

  // Email verification endpoint
  app.get('/api/users/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      // In production, verify token against database
      console.log(`✅ Email verified with token: ${token}`);
      
      res.json({
        success: true,
        message: 'Email verified successfully! You can now login to your account.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to verify email'
      });
    }
  });
};

module.exports = {
  sendEmail,
  sendUserRegistrationEmail,
  sendKYCSubmissionEmails,
  setupEmailRoutes,
  EMAIL_TEMPLATES
};