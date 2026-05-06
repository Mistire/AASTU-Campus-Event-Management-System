import PDFDocument from 'pdfkit';
import * as qrcode from 'qrcode';

// Extended event type with relations
interface TicketEvent {
  id: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  capacity: number;
  venueId: string;
  venue?: { name: string; building?: string | null; roomNumber?: string | null } | null;
  eventType?: { name: string } | null;
}

// ─── Brand Design Tokens ────────────────────────────────────────────────────
const BRAND = {
  // Brand blue (sky-600 equivalent)
  primary: '#0284c7',
  primaryDark: '#0c4a6e',
  primaryLight: '#e0f2fe',
  // Neutrals
  white: '#FFFFFF',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray700: '#334155',
  gray900: '#0f172a',
  // Accent
  accent: '#38bdf8',
};

export class TicketGeneratorUtil {
  /**
   * Generates a premium PDF event pass styled like a digital ID.
   * Layout: Compact pass (roughly 4" × 7") centered on A4.
   */
  static async generatePdfTicket(
    event: TicketEvent,
    attendeeName: string,
    attendeeEmail: string,
    ticketToken: string,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // ── Page & Pass Dimensions ──
        const pageW = 595.28; // A4 width
        const pageH = 841.89; // A4 height
        const passW = 340;
        const passH = 580;
        const passX = (pageW - passW) / 2;
        const passY = (pageH - passH) / 2;
        const pad = 28; // inner padding
        const innerW = passW - pad * 2;

        const doc = new PDFDocument({
          size: 'A4',
          margin: 0,
          info: {
            Title: `Event Pass — ${event.title}`,
            Author: 'Campus Event Management System',
            Subject: `Digital event pass for ${attendeeName}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Generate QR code as data URI
        const qrSize = 160;
        const qrDataUri = await qrcode.toDataURL(ticketToken, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: qrSize * 2, // 2x for retina-sharp rendering
          color: {
            dark: BRAND.primaryDark,
            light: BRAND.white,
          },
        });

        // ── Background ──
        doc.rect(0, 0, pageW, pageH).fill(BRAND.gray100);

        // ── Pass Card Shadow (simulated) ──
        doc.roundedRect(passX + 3, passY + 5, passW, passH, 20).fill('#00000010');

        // ── Pass Card Body ──
        doc.roundedRect(passX, passY, passW, passH, 20).fill(BRAND.white);

        // ── Header Band (brand gradient simulation) ──
        const headerH = 140;
        // Dark brand background
        doc.save();
        doc.roundedRect(passX, passY, passW, headerH + 20, 20).clip();
        doc.rect(passX, passY, passW, headerH + 20).fill(BRAND.primaryDark);
        // Lighter accent circle (decorative)
        doc.circle(passX + passW + 20, passY - 10, 100).fill(BRAND.primary);
        doc
          .circle(passX - 30, passY + headerH, 60)
          .fillOpacity(0.15)
          .fill(BRAND.accent);
        doc.fillOpacity(1);
        doc.restore();

        // ── Header Text ──
        let y = passY + 24;

        // Top row: "CEMS" logo text + Ticket ID
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(BRAND.accent)
          .text('[ CEMS ]', passX + pad, y, { width: innerW / 2 });
        doc
          .font('Courier-Bold')
          .fontSize(7)
          .fillColor('#ffffff60')
          .text(`#${event.id.slice(-8).toUpperCase()}`, passX + pad + innerW / 2, y + 1, {
            width: innerW / 2,
            align: 'right',
          });

        y += 28;

        // Event type label
        const eventTypeName = event.eventType?.name || 'Event';
        doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND.accent);

        const labelW = doc.widthOfString(eventTypeName.toUpperCase()) + 14;
        doc
          .roundedRect(passX + pad, y, labelW, 16, 4)
          .fillOpacity(0.2)
          .fill(BRAND.accent);
        doc
          .fillOpacity(1)
          .fillColor(BRAND.white)
          .text(eventTypeName.toUpperCase(), passX + pad + 7, y + 4);

        y += 26;

        // Event title
        doc
          .font('Helvetica-Bold')
          .fontSize(19)
          .fillColor(BRAND.white)
          .text(event.title, passX + pad, y, {
            width: innerW,
            lineGap: 2,
          });

        // ── Perforated Edge (dashed line + circle cutouts) ──
        const perfY = passY + headerH + 20;
        const circleR = 10;
        // Left cutout
        doc.circle(passX, perfY, circleR).fill(BRAND.gray100);
        // Right cutout
        doc.circle(passX + passW, perfY, circleR).fill(BRAND.gray100);
        // Dashed line
        doc
          .moveTo(passX + circleR + 4, perfY)
          .lineTo(passX + passW - circleR - 4, perfY)
          .dash(4, { space: 3 })
          .strokeColor(BRAND.gray200)
          .lineWidth(0.8)
          .stroke()
          .undash();

        // ── Info Section ──
        y = perfY + 18;

        const drawInfoRow = (label: string, value: string, xOffset = 0, maxWidth = innerW) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor(BRAND.gray400)
            .text(label.toUpperCase(), passX + pad + xOffset, y, {
              width: maxWidth,
            });
          y += 12;
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor(BRAND.gray900)
            .text(value, passX + pad + xOffset, y, {
              width: maxWidth,
              lineGap: 1,
            });
          y += doc.heightOfString(value, { width: maxWidth }) + 2;
        };

        // Attendee Name
        drawInfoRow('Attendee', attendeeName);

        y += 8;

        // Date & Time (side by side)
        const colW = (innerW - 16) / 2;
        const savedY = y;

        const dateStr = new Date(event.startTime).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        drawInfoRow('Date', dateStr, 0, colW);

        y = savedY;
        const timeStr = new Date(event.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
        drawInfoRow('Time', timeStr, colW + 16, colW);

        y += 8;

        // Venue
        const venueName = event.venue?.name || 'Campus Venue';
        const venueDetail = [event.venue?.building, event.venue?.roomNumber]
          .filter(Boolean)
          .join(', ');
        drawInfoRow('Venue', venueDetail ? `${venueName} — ${venueDetail}` : venueName);

        // ── QR Code Section ──
        y += 12;

        // QR container background
        const qrContainerW = qrSize + 24;
        const qrContainerH = qrSize + 24;
        const qrContainerX = passX + (passW - qrContainerW) / 2;

        doc.roundedRect(qrContainerX, y, qrContainerW, qrContainerH, 14).fill(BRAND.gray50);
        doc
          .roundedRect(qrContainerX, y, qrContainerW, qrContainerH, 14)
          .strokeColor(BRAND.gray200)
          .lineWidth(0.5)
          .stroke();

        // Corner accent dots
        const dotR = 2.5;
        const dotOff = 8;
        doc.circle(qrContainerX + dotOff, y + dotOff, dotR).fill(BRAND.accent + '60');
        doc
          .circle(qrContainerX + qrContainerW - dotOff, y + dotOff, dotR)
          .fill(BRAND.accent + '60');
        doc
          .circle(qrContainerX + dotOff, y + qrContainerH - dotOff, dotR)
          .fill(BRAND.accent + '60');
        doc
          .circle(qrContainerX + qrContainerW - dotOff, y + qrContainerH - dotOff, dotR)
          .fill(BRAND.accent + '60');

        // QR code image
        doc.image(qrDataUri, qrContainerX + 12, y + 12, { width: qrSize, height: qrSize });

        y += qrContainerH + 10;

        // Scan instruction
        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor(BRAND.gray300)
          .text('PRESENT THIS QR CODE AT THE ENTRANCE', passX + pad, y, {
            width: innerW,
            align: 'center',
          });

        // ── Footer Branding ──
        const footerY = passY + passH - 28;
        doc
          .moveTo(passX + pad, footerY - 8)
          .lineTo(passX + passW - pad, footerY - 8)
          .strokeColor(BRAND.gray100)
          .lineWidth(0.5)
          .stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(6)
          .fillColor(BRAND.gray300)
          .text('CAMPUS EVENT MANAGEMENT SYSTEM', passX + pad, footerY, {
            width: innerW,
            align: 'center',
          });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  // ─── Graduation Guest Card ──────────────────────────────────────────────────

  private static drawStar(doc: any, x: number, y: number, size: number) {
    const points = 5;
    const outerRadius = size / 2;
    const innerRadius = size / 5;
    const cx = x + outerRadius;
    const cy = y + outerRadius;

    doc.save().translate(cx, cy).rotate(0);
    doc.moveTo(0, -outerRadius);
    for (let i = 0; i < points; i++) {
      doc.rotate(180 / points);
      doc.lineTo(0, -innerRadius);
      doc.rotate(180 / points);
      doc.lineTo(0, -outerRadius);
    }
    doc.fill().restore();
  }

  private static drawMedal(doc: any, x: number, y: number, size: number) {
    const r = size / 2;
    const cx = x + r;
    const cy = y + r;
    // Ribbon
    doc.save();
    doc.moveTo(cx - 4, cy).lineTo(cx - 6, cy + r).lineTo(cx, cy + r - 4).lineTo(cx + 6, cy + r).lineTo(cx + 4, cy).fill();
    // Circle
    doc.circle(cx, cy, r - 2).fill();
    doc.restore();
  }

  private static drawGradCap(doc: any, x: number, y: number, size: number) {
    const w = size;
    const h = size * 0.8;
    // Top diamond
    doc.save();
    doc.moveTo(x + w / 2, y).lineTo(x + w, y + h / 3).lineTo(x + w / 2, y + (h * 2) / 3).lineTo(x, y + h / 3).fill();
    // Bottom part
    doc.moveTo(x + w / 4, y + h / 2).lineTo(x + w / 4, y + h).bezierCurveTo(x + w / 4, y + h, x + w / 2, y + h + 2, x + (w * 3) / 4, y + h).lineTo(x + (w * 3) / 4, y + h / 2).fill();
    doc.restore();
  }

  /**
   * Generates a tier-styled PDF entry pass for a graduation ceremony parent guest.
   * Three visual themes: GRADUATE (blue), HONORS (purple), DISTINGUISHED (gold).
   */
  static async generateGraduationGuestCard(
    event: {
      id: string;
      title: string;
      startTime: Date;
      endTime: Date;
      venue?: { name: string; building?: string | null; roomNumber?: string | null } | null;
    },
    guestPass: {
      id: string;
      parentLabel: string;
      qrToken: string;
    },
    graduationRecord: {
      fullName: string;
      gpa: number;
      tier: string;
    },
  ): Promise<Buffer> {
    // ─── Tier Theming ──────────────────────────────────────────────────────
    const TIER_THEMES: Record<string, { primary: string; dark: string; light: string; accent: string; badge: string; icon: string }> = {
      DISTINGUISHED: {
        primary: '#d97706',   // amber-600
        dark:    '#78350f',   // amber-900
        light:   '#fef3c7',   // amber-50
        accent:  '#fbbf24',   // amber-400
        badge:   'DISTINGUISHED GUEST',
        icon:    'STAR',
      },
      HONORS: {
        primary: '#7c3aed',   // violet-600
        dark:    '#3b0764',   // violet-950
        light:   '#f5f3ff',   // violet-50
        accent:  '#a78bfa',   // violet-400
        badge:   'HONORS GUEST',
        icon:    'MEDAL',
      },
      GRADUATE: {
        primary: BRAND.primary,
        dark:    BRAND.primaryDark,
        light:   BRAND.primaryLight,
        accent:  BRAND.accent,
        badge:   'GRADUATE GUEST',
        icon:    'CAP',
      },
    };

    const theme = TIER_THEMES[graduationRecord.tier] ?? TIER_THEMES.GRADUATE;

    return new Promise(async (resolve, reject) => {
      try {
        // ── Page & Pass Dimensions ──
        const pageW = 595.28;
        const pageH = 841.89;
        const passW = 340;
        const passH = 600;
        const passX = (pageW - passW) / 2;
        const passY = (pageH - passH) / 2;
        const pad = 28;
        const innerW = passW - pad * 2;

        const doc = new PDFDocument({
          size: 'A4',
          margin: 0,
          info: {
            Title: `Graduation Pass — ${graduationRecord.fullName}`,
            Author: 'AASTU Campus Event Management System',
            Subject: `Graduation guest pass for ${guestPass.parentLabel}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Generate QR
        const qrSize = 160;
        const qrDataUri = await qrcode.toDataURL(guestPass.qrToken, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: qrSize * 2,
          color: { dark: theme.dark, light: BRAND.white },
        });

        // ── Background ──
        doc.rect(0, 0, pageW, pageH).fill(BRAND.gray100);

        // ── Card Shadow ──
        doc.roundedRect(passX + 3, passY + 5, passW, passH, 20).fill('#00000012');

        // ── Card Body ──
        doc.roundedRect(passX, passY, passW, passH, 20).fill(BRAND.white);

        // ── Header Band ──
        const headerH = 160;
        doc.save();
        doc.roundedRect(passX, passY, passW, headerH + 20, 20).clip();
        doc.rect(passX, passY, passW, headerH + 20).fill(theme.dark);
        doc.circle(passX + passW + 20, passY - 10, 110).fill(theme.primary);
        doc.circle(passX - 30, passY + headerH, 70).fillOpacity(0.15).fill(theme.accent);
        doc.fillOpacity(1);
        doc.restore();

        // ── Header Content ──
        let y = passY + 24;

        // [ CEMS ] + pass ID
        doc.font('Helvetica-Bold').fontSize(9).fillColor(theme.accent)
           .text('[ CEMS ]', passX + pad, y, { width: innerW / 2 });
        doc.font('Courier-Bold').fontSize(7).fillColor('#ffffff60')
           .text(`#${guestPass.id.slice(-8).toUpperCase()}`, passX + pad + innerW / 2, y + 1, {
             width: innerW / 2, align: 'right',
           });

        y += 28;

        // Tier badge pill
        const badgeText = theme.badge;
        doc.font('Helvetica-Bold').fontSize(7).fillColor(theme.accent);
        const textW = doc.widthOfString(badgeText);
        const badgeW = textW + 32; // extra room for icon
        doc.roundedRect(passX + pad, y, badgeW, 18, 5).fillOpacity(0.2).fill(theme.accent);
        
        // Draw icon
        doc.fillOpacity(1).fillColor(BRAND.white);
        if (theme.icon === 'STAR') this.drawStar(doc, passX + pad + 8, y + 4, 10);
        else if (theme.icon === 'MEDAL') this.drawMedal(doc, passX + pad + 8, y + 4, 10);
        else if (theme.icon === 'CAP') this.drawGradCap(doc, passX + pad + 8, y + 4, 10);
        
        doc.text(badgeText, passX + pad + 22, y + 5);

        y += 28;

        // Event title
        doc.font('Helvetica-Bold').fontSize(17).fillColor(BRAND.white)
           .text(event.title, passX + pad, y, { width: innerW, lineGap: 2 });

        y += 42;

        // "In honour of" subline
        doc.font('Helvetica').fontSize(9).fillColor('#ffffff90')
           .text('In honour of the graduation of', passX + pad, y, { width: innerW });

        y += 15;

        doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND.white)
           .text(graduationRecord.fullName, passX + pad, y, { width: innerW });

        // ── Perforated Divider ──
        const perfY = passY + headerH + 20;
        const circleR = 10;
        doc.circle(passX, perfY, circleR).fill(BRAND.gray100);
        doc.circle(passX + passW, perfY, circleR).fill(BRAND.gray100);
        doc.moveTo(passX + circleR + 4, perfY)
           .lineTo(passX + passW - circleR - 4, perfY)
           .dash(4, { space: 3 })
           .strokeColor(BRAND.gray200)
           .lineWidth(0.8)
           .stroke()
           .undash();

        // ── Info Section ──
        y = perfY + 20;

        const drawRow = (label: string, value: string, xOff = 0, maxW = innerW) => {
          doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND.gray400)
             .text(label.toUpperCase(), passX + pad + xOff, y, { width: maxW });
          y += 12;
          doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.gray900)
             .text(value, passX + pad + xOff, y, { width: maxW, lineGap: 1 });
          y += doc.heightOfString(value, { width: maxW }) + 2;
        };

        // Guest label
        drawRow('Admitted Guest', guestPass.parentLabel);
        y += 8;

        // Date & Time side by side
        const colW = (innerW - 16) / 2;
        const savedY = y;
        const dateStr = new Date(event.startTime).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
        drawRow('Date', dateStr, 0, colW);

        y = savedY;
        const timeStr = new Date(event.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit',
        });
        drawRow('Time', timeStr, colW + 16, colW);
        y += 8;

        // Venue
        const venueName = event.venue?.name ?? 'Campus Venue';
        const venueDetail = [event.venue?.building, event.venue?.roomNumber].filter(Boolean).join(', ');
        drawRow('Venue', venueDetail ? `${venueName} — ${venueDetail}` : venueName);

        // ── QR Section ──
        y += 12;
        const qrContainerW = qrSize + 24;
        const qrContainerH = qrSize + 24;
        const qrContainerX = passX + (passW - qrContainerW) / 2;

        doc.roundedRect(qrContainerX, y, qrContainerW, qrContainerH, 14).fill(BRAND.gray50);
        doc.roundedRect(qrContainerX, y, qrContainerW, qrContainerH, 14)
           .strokeColor(BRAND.gray200).lineWidth(0.5).stroke();

        // Tier-colored corner dots
        const dotR = 3;
        const dotOff = 9;
        [
          [qrContainerX + dotOff,             y + dotOff],
          [qrContainerX + qrContainerW - dotOff, y + dotOff],
          [qrContainerX + dotOff,             y + qrContainerH - dotOff],
          [qrContainerX + qrContainerW - dotOff, y + qrContainerH - dotOff],
        ].forEach(([cx, cy]) => doc.circle(cx, cy, dotR).fill(theme.accent + '80'));

        doc.image(qrDataUri, qrContainerX + 12, y + 12, { width: qrSize, height: qrSize });
        y += qrContainerH + 10;

        doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND.gray300)
           .text('PRESENT THIS QR CODE AT THE ENTRANCE', passX + pad, y, {
             width: innerW, align: 'center',
           });

        // ── Footer ──
        const footerY = passY + passH - 28;
        doc.moveTo(passX + pad, footerY - 8)
           .lineTo(passX + passW - pad, footerY - 8)
           .strokeColor(BRAND.gray100).lineWidth(0.5).stroke();

        doc.font('Helvetica-Bold').fontSize(6).fillColor(BRAND.gray300)
           .text('AASTU CAMPUS EVENT MANAGEMENT SYSTEM', passX + pad, footerY, {
             width: innerW, align: 'center',
           });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
