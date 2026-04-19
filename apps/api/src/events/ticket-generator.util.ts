import PDFDocument from 'pdfkit';
import * as qrcode from 'qrcode';
import { Event } from '@prisma/client';

export class TicketGeneratorUtil {
  /**
   * Generates a PDF ticket buffer for a given event and ticket payload.
   * @param event The event entity.
   * @param guestEmail The email of the guest.
   * @param ticketToken The signed JWT ticket.
   * @returns A Buffer containing the printable PDF ticket.
   */
  static async generatePdfTicket(event: Event, guestEmail: string, ticketToken: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Ticket for ${event.title}`,
            Author: 'AASTU Event Management System',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Generate QR code data URI
        const qrCodeDataUri = await qrcode.toDataURL(ticketToken, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300,
        });

        // Background / Border
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('GRADUATION CEREMONY TICKET', { align: 'center' });
        
        doc.moveDown();

        // Event Title
        doc
          .fontSize(20)
          .font('Helvetica')
          .text(event.title, { align: 'center' });
        
        doc.moveDown(2);

        // Details
        doc.fontSize(14).font('Helvetica');
        doc.text(`Guest: ${guestEmail}`, { align: 'left' });
        doc.text(`Date & Time: ${new Date(event.startTime).toLocaleString()}`, { align: 'left' });
        doc.text(`Venue ID: ${event.venueId}`, { align: 'left' }); // Or grab explicit name if relation is loaded

        doc.moveDown(3);

        // Instructions
        doc
          .fontSize(12)
          .font('Helvetica-Oblique')
          .text('Please present this QR code at the entrance for scanning.', { align: 'center' });

        doc.moveDown(2);

        // QR Code Image
        doc.image(qrCodeDataUri, (doc.page.width - 300) / 2, doc.y, { width: 300 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
