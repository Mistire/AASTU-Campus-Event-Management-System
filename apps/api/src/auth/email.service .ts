/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
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
    const smtpPort = this.configService.get<number>('SMTP_PORT');

    const transportConfig: any = {
      host: smtpHost,
      port: Number(smtpPort),
      secure: false,
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
    const baseUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

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
    const baseUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.sendMail(
      email,
      'Reset Your Password',
      `
        <p>You requested a password reset.</p>
        <p>Please reset your password by clicking the link below:</p>
        <a href="${verifyUrl}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    );
  }
}
