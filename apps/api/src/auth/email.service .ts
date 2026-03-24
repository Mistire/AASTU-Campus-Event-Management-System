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
    const backendBaseUrl =
      this.configService.get<string>('BACKEND_URL') ??
      `http://localhost:${this.configService.get<number>('PORT') ?? 3000}`;
    const verifyUrl = `${backendBaseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

    await this.sendMail(
      email,
      'Verify Your Email',
      `
      <h2>Welcome To AASTU Campus Event Management System!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      `,
    );
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL');
    const backendBaseUrl =
      this.configService.get<string>('BACKEND_URL') ??
      `http://localhost:${this.configService.get<number>('PORT') ?? 3000}`;

    const resetUrl = frontendBaseUrl
      ? `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`
      : `${backendBaseUrl}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.sendMail(
      email,
      'Reset Your Password',
      `
        <p>You requested a password reset.</p>
        <p>Please reset your password by clicking the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    );
  }
}
