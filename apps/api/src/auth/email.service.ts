/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = Number(this.configService.get<number>('SMTP_PORT') ?? 587);
    const smtpSecure = smtpPort === 465;

    const transportConfig: SMTPTransport.Options = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
    };

    if (smtpUser && smtpPass) {
      transportConfig.auth = {
        user: smtpUser,
        pass: smtpPass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  private getHtmlLayout(
    title: string,
    previewText: string,
    content: string,
    cta?: { text: string; url: string },
  ) {
    const primaryColor = '#38bdf8';
    const darkColor = '#111827';
    const mutedColor = '#6b7280';
    const bgColor = '#f8fafc';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Grotesk:wght@700&display=swap');
            body { margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${darkColor}; }
            .container { max-width: 600px; margin: 40px auto; padding: 20px; }
            .card { background-color: #ffffff; border-radius: 24px; padding: 48px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .logo { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 32px; letter-spacing: -0.02em; }
            .logo-bracket { color: ${primaryColor}; opacity: 0.4; font-weight: 800; }
            .logo-text { color: ${primaryColor}; font-weight: 900; margin: 0 4px; }
            .title { font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.03em; color: ${darkColor}; }
            .content { font-size: 16px; line-height: 1.6; color: ${mutedColor}; margin-bottom: 32px; }
            .btn { display: inline-block; background-color: ${primaryColor}; color: #ffffff; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s ease; box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.2); }
            .footer { margin-top: 32px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; }
            .accent-line { width: 40px; height: 4px; background-color: ${primaryColor}; border-radius: 2px; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <span class="logo-bracket">[</span><span class="logo-text">CEMS</span><span class="logo-bracket">]</span>
              </div>
              <div class="accent-line"></div>
              <h1 class="title">${title}</h1>
              <div class="content">
                ${content}
              </div>
              ${cta ? `<a href="${cta.url}" class="btn">${cta.text}</a>` : ''}
            </div>
            <div class="footer">
              [ AUTH-GATE v2.0 — AASTU CEMS ]
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"AASTU Campus Event Management System" <${this.configService.get<string>('SMTP_FROM')}>`,
        to,
        subject,
        html,
      });

      this.logger.log('Email sent successfully to ' + to);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
      throw err;
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const verifyUrl = `${frontendBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const html = this.getHtmlLayout(
      'Verify account.',
      'Complete your registration to access the CEMS portal.',
      '<p>Welcome to the AASTU Campus Event Management System. To fully activate your account and start discovering events, please verify your email address.</p>',
      { text: 'Verify Email', url: verifyUrl },
    );

    await this.sendMail(email, 'Verify Your Email [CEMS]', html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL');
    const backendBaseUrl =
      this.configService.get<string>('BACKEND_URL') ??
      `http://localhost:${this.configService.get<number>('PORT') ?? 3000}`;

    const resetUrl = frontendBaseUrl
      ? `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`
      : `${backendBaseUrl}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

    const html = this.getHtmlLayout(
      'Reset password.',
      'Requested a password reset?',
      '<p>You requested a password reset for your CEMS account. If this was not you, please ignore this email. This link will expire in 15 minutes.</p>',
      { text: 'Reset Password', url: resetUrl },
    );

    await this.sendMail(email, 'Reset Your Password [CEMS]', html);
  }

  async sendEventLiveEmail(emails: string[], eventTitle: string) {
    if (emails.length === 0) return;

    const html = this.getHtmlLayout(
      'Event is live!',
      `Get ready for ${eventTitle}`,
      `<p>Exciting news! The event <strong>"${eventTitle}"</strong> is now LIVE. We look forward to seeing you there. Check the app for the full schedule and session details.</p>`,
      {
        text: 'Go To Dashboard',
        url:
          (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001') +
          '/dashboard',
      },
    );

    try {
      await this.transporter.sendMail({
        from: `"AASTU Campus Event Management System" <${this.configService.get<string>('SMTP_FROM')}>`,
        to: this.configService.get<string>('SMTP_FROM'),
        bcc: emails,
        subject: `[LIVE] ${eventTitle} — CEMS`,
        html,
      });

      this.logger.log(
        `Bulk 'Event Live' email sent to ${emails.length} attendees for event: ${eventTitle}`,
      );
    } catch (err) {
      this.logger.error(`Failed to send bulk 'Event Live' email: ${err.message}`);
    }
  }
}
