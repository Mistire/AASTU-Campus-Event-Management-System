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

  private getMailIcons() {
    return {
      star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
      medal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;"><path d="M12 2l3 9h-6l3-9zm0 11c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 4c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z"/></svg>`,
      cap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`,
    };
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

  async sendRegistrationTicket(email: string, eventTitle: string, ticketPdfBuffer: Buffer) {
    const html = this.getHtmlLayout(
      'Registration Confirmed!',
      `You're going to ${eventTitle}!`,
      `<p>Your registration for <strong>"${eventTitle}"</strong> has been successfully confirmed. We've attached your digital ticket to this email.</p>
       <p>Please keep this PDF handy and present the QR code at the event entrance for a smooth check-in experience. We look forward to seeing you there!</p>`,
      {
        text: 'View My Registrations',
        url:
          (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001') +
          '/dashboard/my-events',
      },
    );

    try {
      await this.transporter.sendMail({
        from: `"AASTU Campus Event Management System" <${this.configService.get<string>('SMTP_FROM')}>`,
        to: email,
        subject: `[CONFIRMED] Ticket for ${eventTitle}`,
        html,
        attachments: [
          {
            filename: `Ticket_${eventTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
            content: ticketPdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`Registration ticket email sent to ${email} for event: ${eventTitle}`);
    } catch (err) {
      this.logger.error(`Failed to send registration ticket email to ${email}: ${err.message}`);
      throw err;
    }
  }

  async sendOrganizerInvitationEmail(email: string, inviterName: string, eventTitle: string) {
    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const invitationsUrl = `${frontendBaseUrl}/dashboard/invitations`;

    const html = this.getHtmlLayout(
      'Organizer Invitation.',
      `Collaborate on ${eventTitle}`,
      `<p><strong>${inviterName}</strong> has invited you to join the organizing team for the event <strong>"${eventTitle}"</strong>.</p>
       <p>As a co-organizer, you'll be able to manage registrations, track attendance, and help ensure the event's success.</p>`,
      { text: 'View Invitation', url: invitationsUrl },
    );

    await this.sendMail(email, `[INVITATION] Join the team for ${eventTitle}`, html);
  }

  async sendOrganizerResponseEmail(
    email: string,
    inviteeName: string,
    eventTitle: string,
    status: string,
  ) {
    const html = this.getHtmlLayout(
      'Organizer Response.',
      `Update for ${eventTitle}`,
      `<p><strong>${inviteeName}</strong> has <strong>${status.toLowerCase()}</strong> your invitation to help organize <strong>"${eventTitle}"</strong>.</p>`,
    );

    await this.sendMail(email, `[RESPONSE] Organizer Invitation: ${eventTitle}`, html);
  }

  async sendGraduationClaimEmail(
    email: string,
    studentName: string,
    eventTitle: string,
    claimUrl: string,
  ) {
    const html = this.getHtmlLayout(
      'Graduation Ceremony',
      `Your graduation invite for ${eventTitle}`,
      `<p>Congratulations, <strong>${studentName}</strong>!</p>
       <p>You are cordially invited to the <strong>${eventTitle}</strong> graduation ceremony.</p>
       <p>Please click the button below to set up entry passes for your parent guest(s). You will be able to send them a Telegram link or email with their unique QR code for entry.</p>
       <p style="color:#94a3b8; font-size:12px;">This link is personal to you — please do not share it with others.</p>`,
      { text: 'Claim My Guest Passes', url: claimUrl },
    );

    await this.sendMail(email, `Graduation Invite — Claim Your Guest Passes`, html);
    this.logger.log(`Graduation claim email sent to ${email}`);
  }

  async sendParentQREmail(
    parentEmail: string,
    studentName: string,
    tier: string,
    event: {
      title: string;
      startTime: Date;
      venue?: { name: string; building?: string | null } | null;
    },
    pdfBuffer: Buffer,
  ) {
    const icons = this.getMailIcons();
    const tierLabels: Record<string, { label: string; icon: string; color: string }> = {
      DISTINGUISHED: { label: 'Distinguished Guest', icon: icons.star, color: '#d97706' },
      HONORS: { label: 'Honors Guest', icon: icons.medal, color: '#7c3aed' },
      GRADUATE: { label: 'Graduate Guest', icon: icons.cap, color: '#0284c7' },
    };
    const tierInfo = tierLabels[tier] ?? { label: 'Guest', icon: '', color: '#64748b' };
    const tierLabel = `<span style="color:${tierInfo.color}; font-weight:800; display:inline-flex; align-items:center; gap:6px;">${tierInfo.icon} ${tierInfo.label}</span>`;

    const dateStr = new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const venueName = event.venue?.name ?? 'Campus Venue';

    const html = this.getHtmlLayout(
      `You're Invited!`,
      `Graduation invitation for ${studentName}`,
      `<p>You have been invited as a <strong>${tierLabel}</strong> to the graduation ceremony of <strong>${studentName}</strong>.</p>
       <p><strong>Event:</strong> ${event.title}<br/>
          <strong>Date:</strong> ${dateStr}<br/>
          <strong>Venue:</strong> ${venueName}</p>
       <p>Your personalized QR code is attached to this email as a PDF. Please present it at the entrance gate on the day of the ceremony.</p>`,
    );

    await this.transporter.sendMail({
      from: `"AASTU Campus Event Management System" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: parentEmail,
      subject: `Your Graduation Entry Pass — ${event.title}`,
      html,
      attachments: [
        {
          filename: `GraduationPass_${studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    this.logger.log(`Parent QR email sent to ${parentEmail} for student ${studentName}`);
  }

  async sendSupportReplyEmail(email: string, ticketId: string, ticketSubject: string, replyMessage: string) {
    const html = this.getHtmlLayout(
      'New Support Reply.',
      `Re: ${ticketSubject}`,
      `<p>You have received a new reply from the support team regarding your ticket: <strong>"${ticketSubject}"</strong>.</p>
       <div style="background-color:#f1f5f9; padding:16px; border-radius:12px; margin:24px 0; color:#475569; font-size:15px; border-left:4px solid #38bdf8;">
         ${replyMessage}
       </div>
       <p>If you are a registered user, you can view the full conversation in your dashboard. If you raised this as a guest, please raise a new ticket if you have further questions.</p>`,
      {
        text: 'View Support',
        url:
          (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001') +
          `/support/track?ticketId=${ticketId}&email=${email}`,
      },
    );

    await this.sendMail(email, `[SUPPORT] New reply: ${ticketSubject}`, html);
  }

  async sendFeedbackRequestEmail(
    email: string,
    firstName: string,
    eventTitle: string,
    feedbackUrl: string,
  ) {
    const html = this.getHtmlLayout(
      'Share your feedback',
      `How was ${eventTitle}?`,
      `<p>Hi <strong>${firstName}</strong>,</p>
       <p>Thank you for attending <strong>"${eventTitle}"</strong>! We hope you had a great experience.</p>
       <p>We'd love to hear what you thought. Your feedback helps us improve future events and takes less than 2 minutes to complete.</p>
       <p style="color:#94a3b8; font-size:12px; margin-top:24px;">This link is personal to you and expires in 14 days. Please do not share it with others.</p>`,
      { text: 'Share My Feedback', url: feedbackUrl },
    );

    await this.sendMail(email, `[FEEDBACK] How was "${eventTitle}"? — CEMS`, html);
    this.logger.log(`Feedback request email sent to ${email} for event: ${eventTitle}`);
  }

  async sendTicketAcknowledgementEmail(email: string, ticketId: string, ticketSubject: string) {
    const html = this.getHtmlLayout(
      'Support Ticket Received',
      `Confirmation: ${ticketSubject}`,
      `<p>We have received your support request regarding <strong>"${ticketSubject}"</strong>.</p>
       <p>Our team will review it and get back to you as soon as possible.</p>
       <p><strong>Your Ticket ID:</strong> <code>${ticketId}</code></p>
       <p>You can use this ID to track your ticket status and add more information at any time.</p>`,
      {
        text: 'Track My Ticket',
        url:
          (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001') +
          `/support/track?ticketId=${ticketId}&email=${email}`,
      },
    );

    await this.sendMail(email, `[SUPPORT] Ticket Received: ${ticketSubject}`, html);
  }

  /**
   * Sends ALL parent QR-pass PDFs in a single bundled email to the student's chosen address.
   * Called when the student selects the "Bundle all to my email" delivery mode.
   */
  async sendBulkParentQREmail(
    studentEmail: string,
    studentName: string,
    tier: string,
    event: {
      title: string;
      startTime: Date;
      venue?: { name: string; building?: string | null } | null;
    },
    passes: Array<{ parentLabel: string; pdfBuffer: Buffer }>,
  ) {
    const icons = this.getMailIcons();
    const tierLabels: Record<string, { label: string; icon: string; color: string }> = {
      DISTINGUISHED: { label: 'Distinguished Graduate', icon: icons.star, color: '#d97706' },
      HONORS:        { label: 'Honors Graduate',        icon: icons.medal, color: '#7c3aed' },
      GRADUATE:      { label: 'Graduate',               icon: icons.cap,   color: '#0284c7' },
    };
    const tierInfo = tierLabels[tier] ?? { label: 'Graduate', icon: '', color: '#64748b' };
    const tierLabel = `<span style="color:${tierInfo.color}; font-weight:800;">${tierInfo.icon} ${tierInfo.label}</span>`;

    const dateStr = new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const venueName = event.venue?.name ?? 'Campus Venue';

    const passListHtml = passes
      .map(
        (p) =>
          `<li style="margin:4px 0; font-weight:600; color:#374151;">${p.parentLabel}</li>`,
      )
      .join('');

    const html = this.getHtmlLayout(
      'Your Guest Passes — All in One',
      `Graduation guest passes for ${studentName}`,
      `<p>Congratulations, <strong>${studentName}</strong> — <strong>${tierLabel}</strong>!</p>
       <p>All of your parent guest-pass QR tickets for <strong>${event.title}</strong> are attached to this email as PDFs.</p>
       <p><strong>Event:</strong> ${event.title}<br/>
          <strong>Date:</strong> ${dateStr}<br/>
          <strong>Venue:</strong> ${venueName}</p>
       <p><strong>Passes included (${passes.length}):</strong></p>
       <ul style="padding-left:20px; margin:0 0 16px;">${passListHtml}</ul>
       <p style="color:#94a3b8; font-size:12px;">Please print or save each PDF and distribute it to the respective guest. Each QR code is unique and can only be used once.</p>`,
    );

    const attachments = passes.map((p) => ({
      filename: `GuestPass_${studentName.replace(/[^a-z0-9]/gi, '_')}_${p.parentLabel.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      content: p.pdfBuffer,
      contentType: 'application/pdf' as const,
    }));

    await this.transporter.sendMail({
      from: `"AASTU Campus Event Management System" <${this.configService.get<string>('SMTP_FROM')}>`,
      to: studentEmail,
      subject: `[GRADUATION] Your ${passes.length} Guest Pass${passes.length > 1 ? 'es' : ''} — ${event.title}`,
      html,
      attachments,
    });

    this.logger.log(
      `Bulk graduation pass email sent to ${studentEmail} (${passes.length} passes) for student ${studentName}`,
    );
  }
}

