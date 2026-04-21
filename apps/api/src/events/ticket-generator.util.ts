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
}
