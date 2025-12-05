/**
 * Email Templates for LISAR
 * Professional HTML email templates with fallback text versions
 */

interface WelcomeEmailParams {
  firstName?: string;
  userId: string;
  walletAddress?: string;
  username?: string;
}

interface TransactionEmailParams {
  firstName?: string;
  transactionType: 'deposit' | 'withdrawal' | 'delegation' | 'reward';
  amount: string;
  tokenSymbol: string;
  transactionHash?: string;
  timestamp?: string;
  walletAddress?: string;
}

export class EmailTemplates {
  /**
   * Base HTML template wrapper with LISAR branding
   */
  private static baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LISAR</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #1a1a1a;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #000000;
      padding: 40px 30px;
      text-align: center;
    }
    .logo-container {
      display: inline-block;
    }
    .logo-svg {
      width: 120px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.8;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .tagline {
      font-size: 18px;
      font-weight: 500;
      color: #C7EF6B;
      margin-bottom: 25px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 15px;
    }
    .cta-box {
      background-color: #f8fff0;
      border-left: 4px solid #C7EF6B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .cta-list {
      margin: 15px 0;
      padding-left: 20px;
    }
    .cta-list li {
      margin-bottom: 12px;
      color: #2d3748;
    }
    .cta-link {
      color: #000000;
      text-decoration: none;
      font-weight: 500;
    }
    .cta-link:hover {
      text-decoration: underline;
    }
    .info-box {
      background-color: #fff9e6;
      border-left: 4px solid #f6ad55;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box-title {
      font-weight: 600;
      color: #744210;
      margin-bottom: 10px;
    }
    .timeline {
      background-color: #f8fff0;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .timeline-item {
      margin-bottom: 12px;
      padding-left: 15px;
      border-left: 2px solid #C7EF6B;
      color: #2d3748;
    }
    .button {
      display: inline-block;
      background-color: #C7EF6B;
      color: #000000;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #b5db59;
    }
    .footer {
      background-color: #000000;
      color: #ffffff;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-signature {
      font-size: 16px;
      font-weight: 500;
      margin-top: 20px;
      color: #a0aec0;
    }
    .code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #000000;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <svg class="logo-svg" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <!-- LISAR Logo - Lime green rays on black background -->
          <g transform="translate(0, 0)">
            <!-- Ray 1 (leftmost, longest) -->
            <path d="M 0 100 L 10 0 Q 15 0 25 0 L 35 100 Q 30 100 25 100 Q 20 100 15 100 Z" fill="#C7EF6B" opacity="0.9"/>
            
            <!-- Ray 2 -->
            <path d="M 40 100 L 55 20 Q 60 20 70 20 L 75 100 Q 70 100 65 100 Q 60 100 55 100 Z" fill="#C7EF6B" opacity="0.85"/>
            
            <!-- Ray 3 -->
            <path d="M 80 100 L 90 35 Q 95 35 105 35 L 110 100 Q 105 100 100 100 Q 95 100 90 100 Z" fill="#C7EF6B" opacity="0.8"/>
            
            <!-- Ray 4 (rightmost) -->
            <path d="M 115 100 L 122 50 Q 127 50 137 50 L 142 100 Q 137 100 132 100 Q 127 100 122 100 Z" fill="#C7EF6B" opacity="0.75"/>
          </g>
        </svg>
      </div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>If you need help at any point, simply reply to this email. The team sees every message.</p>
      <p class="footer-signature" style="color: #C7EF6B;">— The LISAR Team</p>
      <p style="font-size: 12px; color: #718096; margin-top: 20px;">
        This email was sent to you because you created an account on LISAR.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Welcome Email Template
   */
  static welcomeEmail(params: WelcomeEmailParams): { subject: string; text: string; html: string } {
    const firstName = params.firstName || 'there';

    const htmlContent = `
      <h2 class="greeting">Welcome ${firstName},</h2>
      <p class="tagline">Smart choice.</p>
      
      <p>You just joined the simplest way to earn crypto rewards, without touching wallets, keys, or gas fees.</p>

      <div class="section">
        <p><strong>Here's the deal:</strong> LISAR works best when you understand exactly how your money earns for you.</p>
        <p>So over the next few days, I'll send you a short series of emails that break down everything you need to know about LISAR and growing your earnings safely.</p>
      </div>

      <div class="cta-box">
        <div class="section-title">But first, here's what you can do right now:</div>
        <ul class="cta-list">
          <li>✅ Complete account setup</li>
          <li>💰 Make your first deposit (you'll see staking rewards within 24 hours)</li>
          <li>💬 Join the LISAR community on Telegram for updates and support: <a href="https://t.me/+nVvtyHCX5Sg2OTQ0" class="cta-link">Join Telegram</a></li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Over the next few days, you'll receive:</div>
        <div class="timeline">
          <div class="timeline-item">📊 A simple breakdown of how LISAR handles staking behind the scenes</div>
          <div class="timeline-item">🎯 Your first-reward guide - how to track daily earnings</div>
          <div class="timeline-item">💸 A withdrawal walkthrough so you know exactly how payouts hit your bank</div>
          <div class="timeline-item">📈 Tips to grow your earnings safely</div>
        </div>
        <p>Each email is short, practical, and designed to help you make informed moves.</p>
      </div>

      <div class="info-box">
        <div class="info-box-title">🔒 You're in good hands</div>
        <p>LISAR is built as a <strong>non-custodial staking tool</strong>, which means we never take ownership of your money or your staked assets. We simply automate the staking process on your behalf and return the rewards to you, without holding or rehypothecating your funds.</p>
        <p style="margin-top: 15px;">You can export your private key any time and import it straight into <strong>MetaMask, Ledger</strong>, or whichever wallet you trust more than us. We built it this way on purpose.</p>
      </div>

      <div class="section">
        <p style="font-size: 18px; font-weight: 500; color: #667eea;">Welcome to LISAR.</p>
        <p style="font-size: 16px;">Let's help your money start working immediately.</p>
      </div>
    `;

    const textContent = `
Welcome ${firstName},

Smart choice.

You just joined the simplest way to earn crypto rewards, without touching wallets, keys, or gas fees.

Here's the deal: LISAR works best when you understand exactly how your money earns for you.

So over the next few days, I'll send you a short series of emails that break down everything you need to know about LISAR and growing your earnings safely.

BUT FIRST, HERE'S WHAT YOU CAN DO RIGHT NOW:
✅ Complete account setup
💰 Make your first deposit (you'll see staking rewards within 24 hours)
💬 Join the LISAR community on Telegram: https://t.me/+nVvtyHCX5Sg2OTQ0

OVER THE NEXT FEW DAYS, YOU'LL RECEIVE:
• A simple breakdown of how LISAR handles staking behind the scenes
• Your first-reward guide - how to track daily earnings
• A withdrawal walkthrough so you know exactly how payouts hit your bank
• Tips to grow your earnings safely

Each email is short, practical, and designed to help you make informed moves.

YOU'RE IN GOOD HANDS
LISAR is built as a non-custodial staking tool, which means we never take ownership of your money or your staked assets. We simply automate the staking process on your behalf and return the rewards to you, without holding or rehypothecating your funds.

You can export your private key any time and import it straight into MetaMask, Ledger, or whichever wallet you trust more than us. We built it this way on purpose.

If you need help at any point, reply to this email. The team sees every message.

Welcome to LISAR.
Let's help your money start working immediately.

— The LISAR Team
    `.trim();

    return {
      subject: "You're in! Now let's get you earning with LISAR.",
      text: textContent,
      html: this.baseTemplate(htmlContent)
    };
  }

  /**
   * Transaction Email Template (Grey-style design)
   */
  static transactionEmail(params: TransactionEmailParams): { subject: string; text: string; html: string } {
    const firstName = params.firstName || 'there';
    const { transactionType, amount, tokenSymbol, transactionHash, timestamp, walletAddress } = params;

    // Customize message based on transaction type
    let emoji = '�';
    let action = 'Transaction';
    let title = 'Your transaction was successful';
    let description = '';

    switch (transactionType) {
      case 'deposit':
        emoji = '�';
        title = 'Your deposit was successful';
        action = 'Deposit';
        description = 'Your funds have been successfully received and are now available in your account.';
        break;
      case 'withdrawal':
        emoji = '�';
        title = 'Your withdrawal was successful';
        action = 'Withdrawal';
        description = 'Your withdrawal has been processed successfully.';
        break;
      case 'delegation':
        emoji = '🚀';
        title = 'Your staking was successful';
        action = 'Staking';
        description = 'Your tokens have been successfully staked. Start earning rewards!';
        break;
      case 'reward':
        emoji = '🎉';
        title = 'You earned rewards';
        action = 'Rewards';
        description = 'Congratulations! Your staking rewards have been credited.';
        break;
    }

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 24px; border-radius: 12px 12px 0 0;">
          <div style="display: flex; align-items: center;">
            <svg width="80" height="40" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0, 0)">
                <path d="M 0 100 L 10 0 Q 15 0 25 0 L 35 100 Q 30 100 25 100 Q 20 100 15 100 Z" fill="#C7EF6B" opacity="0.9"/>
                <path d="M 40 100 L 55 20 Q 60 20 70 20 L 75 100 Q 70 100 65 100 Q 60 100 55 100 Z" fill="#C7EF6B" opacity="0.85"/>
                <path d="M 80 100 L 90 35 Q 95 35 105 35 L 110 100 Q 105 100 100 100 Q 95 100 90 100 Z" fill="#C7EF6B" opacity="0.8"/>
                <path d="M 115 100 L 122 50 Q 127 50 137 50 L 142 100 Q 137 100 132 100 Q 127 100 122 100 Z" fill="#C7EF6B" opacity="0.75"/>
              </g>
            </svg>
          </div>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f5f7fa; padding: 40px 32px;">
          <p style="color: #4a5568; font-size: 15px; margin: 0 0 16px 0;">Hello ${firstName},</p>
          
          <h1 style="color: #1a202c; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">
            ${title} ${emoji}
          </h1>
          
          <p style="color: #718096; font-size: 15px; margin: 0 0 32px 0;">The details are shown below:</p>

          <!-- Transaction Details Box -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #4a5568; font-size: 15px; font-weight: 500;">Transaction Type:</td>
                <td style="padding: 12px 0; color: #1a202c; font-size: 15px; text-align: right; font-weight: 500; text-transform: capitalize;">${transactionType === 'delegation' ? 'Staking' : transactionType}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #4a5568; font-size: 15px; font-weight: 500;">Amount:</td>
                <td style="padding: 12px 0; color: #1a202c; font-size: 15px; text-align: right; font-weight: 600;">${amount} ${tokenSymbol}</td>
              </tr>
              ${walletAddress ? `
              <tr>
                <td style="padding: 12px 0; color: #4a5568; font-size: 15px; font-weight: 500;">Wallet Address:</td>
                <td style="padding: 12px 0; color: #1a202c; font-size: 14px; text-align: right; font-family: 'Courier New', monospace;">${walletAddress.substring(0, 10)}...${walletAddress.substring(32)}</td>
              </tr>
              ` : ''}
              ${transactionHash ? `
              <tr>
                <td style="padding: 12px 0; color: #4a5568; font-size: 15px; font-weight: 500;">Reference:</td>
                <td style="padding: 12px 0; color: #1a202c; font-size: 14px; text-align: right; font-family: 'Courier New', monospace;">${transactionHash.substring(0, 12).toUpperCase()}</td>
              </tr>
              ` : ''}
              ${timestamp ? `
              <tr>
                <td style="padding: 12px 0; color: #4a5568; font-size: 15px; font-weight: 500;">Date & Time:</td>
                <td style="padding: 12px 0; color: #1a202c; font-size: 15px; text-align: right;">${new Date(timestamp).toLocaleDateString('en-GB')} - ${new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} UTC</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- View Transaction Button -->
          ${transactionHash ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://arbiscan.io/tx/${transactionHash}" 
               style="display: inline-block; background-color: #C7EF6B; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
              View on Arbiscan →
            </a>
          </div>
          ` : ''}

          <!-- Security Notice -->
          <div style="background-color: #fff9e6; border-left: 4px solid #f6ad55; padding: 16px 20px; border-radius: 4px; margin-top: 32px;">
            <p style="color: #744210; font-size: 14px; margin: 0; line-height: 1.6;">
              If you didn't initiate this transaction, please contact our support team immediately via email 
              <a href="mailto:support@lisar.io" style="color: #000000; text-decoration: none; font-weight: 600;">support@lisar.io</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #000000; padding: 32px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #a0aec0; font-size: 14px; margin: 0 0 8px 0;">
            Need help? Reply to this email or contact us at 
            <a href="mailto:support@lisar.io" style="color: #C7EF6B; text-decoration: none;">support@lisar.io</a>
          </p>
          <p style="color: #718096; font-size: 13px; margin: 16px 0 0 0;">
            © ${new Date().getFullYear()} LISAR. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const textContent = `
Hello ${firstName},

${title.toUpperCase()} ${emoji}

The details are shown below:

Transaction Type: ${transactionType === 'delegation' ? 'Staking' : transactionType}
Amount: ${amount} ${tokenSymbol}
${walletAddress ? `Wallet Address: ${walletAddress}` : ''}
${transactionHash ? `Reference: ${transactionHash.substring(0, 12).toUpperCase()}` : ''}
${timestamp ? `Date & Time: ${new Date(timestamp).toLocaleDateString('en-GB')} - ${new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} UTC` : ''}

${transactionHash ? `View on Arbiscan: https://arbiscan.io/tx/${transactionHash}\n` : ''}
If you didn't initiate this transaction, please contact our support team immediately via email support@lisar.io

Need help? Reply to this email or contact us at support@lisar.io

© ${new Date().getFullYear()} LISAR. All rights reserved.
    `.trim();

    return {
      subject: `${title} ${emoji}`,
      text: textContent,
      html: htmlContent
    };
  }
}
