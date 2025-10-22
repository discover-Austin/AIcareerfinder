import { Injectable } from '@angular/core';
import { FullAnalysis } from '../models/personality-test.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  /**
   * Send career analysis results via email
   * This requires a backend API to actually send emails
   */
  async sendAnalysisEmail(
    toEmail: string,
    userName: string,
    analysis: FullAnalysis
  ): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement backend API call
      // This should call your backend endpoint that uses an email service like:
      // - SendGrid: https://sendgrid.com/
      // - Resend: https://resend.com/
      // - Amazon SES: https://aws.amazon.com/ses/
      // - Mailgun: https://www.mailgun.com/

      console.warn('⚠️ Email sending requires backend API integration');
      console.warn('Create an endpoint at /api/send-analysis-email that:');
      console.warn('1. Accepts email, userName, and analysis data');
      console.warn('2. Formats the email (HTML template)');
      console.warn('3. Sends via email service (SendGrid, Resend, etc.)');
      console.warn('4. Returns success/failure status');

      // Example backend API call structure:
      /*
      const response = await fetch('/api/send-analysis-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail,
          userName,
          analysis,
        }),
      });

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      const result = await response.json();
      return { success: true, message: 'Email sent successfully!' };
      */

      // For development, just log
      console.log('Would send email to:', toEmail);
      console.log('Analysis for:', userName);

      return {
        success: false,
        message: 'Email delivery requires backend integration. Please check the console for setup instructions.',
      };
    } catch (error: any) {
      console.error('Email error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(toEmail: string, userName: string): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement backend API call
      console.log('Would send welcome email to:', toEmail);

      return {
        success: false,
        message: 'Email delivery requires backend integration',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send welcome email',
      };
    }
  }

  /**
   * Send upgrade confirmation email
   */
  async sendUpgradeConfirmation(
    toEmail: string,
    userName: string,
    plan: string,
    price: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // TODO: Implement backend API call
      console.log('Would send upgrade confirmation to:', toEmail);
      console.log('Plan:', plan, 'Price:', price);

      return {
        success: false,
        message: 'Email delivery requires backend integration',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send upgrade confirmation',
      };
    }
  }

  /**
   * Generate email HTML template for career analysis
   * This can be used by the backend
   */
  private generateAnalysisEmailTemplate(userName: string, analysis: FullAnalysis): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Career Analysis</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .archetype {
      background: white;
      padding: 20px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      border-radius: 5px;
    }
    .career {
      background: white;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your AI Career Analysis</h1>
    <p>Personalized insights for ${userName}</p>
  </div>

  <div class="content">
    <p>Hi ${userName},</p>
    <p>Thank you for completing the AI Career Path Finder personality assessment! Based on your responses, we've prepared a comprehensive analysis of your personality and career recommendations.</p>

    <div class="archetype">
      <h2>${analysis.archetype.name}</h2>
      <p>${analysis.archetype.description}</p>
    </div>

    <h3>Your Top Strengths:</h3>
    <ul>
      ${analysis.strengths.map(s => `<li><strong>${s.name}:</strong> ${s.description}</li>`).join('')}
    </ul>

    <h3>Recommended Careers:</h3>
    ${analysis.suggestions.slice(0, 3).map(career => `
      <div class="career">
        <h4>${career.career}</h4>
        <p>${career.description}</p>
        <p><em>Why it fits: ${career.reasoning}</em></p>
      </div>
    `).join('')}

    <center>
      <a href="${process.env.APP_URL || 'https://yourapp.com'}/profile" class="button">
        View Full Analysis
      </a>
    </center>

    <p>Ready to take the next step? Log in to your account to access detailed career guides, learning paths, and more!</p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} AI Career Path Finder. All rights reserved.</p>
    <p>You're receiving this email because you completed a personality assessment on our platform.</p>
  </div>
</body>
</html>
    `.trim();
  }
}
