import PDFDocument from 'pdfkit';
import { GeneratedNoteItem, ShiftWindow, SectionType } from '../../types/index.js';

interface PDFPublisherOptions {
  shiftWindow: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibilityHash: string;
  generatedAt?: string;
  operator?: string;
  stats?: {
    totalRawEvents: number;
    eventsInWindow: number;
    deduplicatedItems: number;
  };
}

const SECTION_COLORS: Record<SectionType, { headerBg: string; text: string; lightBg: string; border: string }> = {
  'Blockers': {
    headerBg: '#B45309', // Dark Amber
    text: '#92400E',
    lightBg: '#FEF3C7',
    border: '#F59E0B',
  },
  'In Progress': {
    headerBg: '#1D4ED8', // Dark Blue
    text: '#1E40AF',
    lightBg: '#DBEAFE',
    border: '#3B82F6',
  },
  'Completed': {
    headerBg: '#047857', // Dark Green
    text: '#065F46',
    lightBg: '#D1FAE5',
    border: '#10B981',
  },
  'Watch-list': {
    headerBg: '#6D28D9', // Dark Purple
    text: '#5B21B6',
    lightBg: '#EDE9FE',
    border: '#8B5CF6',
  },
};

const SECTIONS_ORDER: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];

export function generatePDFBuffer(options: PDFPublisherOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const generatedTime = options.generatedAt || new Date().toISOString();
      const operator = options.operator || 'NOC Shift Supervisor';

      // --- HEADER BAR ---
      doc.rect(40, 40, 515, 60).fill('#0F172A'); // Slate-900 NOC header
      
      // Title
      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
        .text('SHIFT HANDOVER NOTE', 55, 52);

      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
        .text('OFFICIAL NOC OPERATION LOG — SOURCED & REPRODUCIBLE', 55, 72);

      doc.fillColor('#38BDF8').fontSize(8).font('Helvetica-Bold')
        .text(`OPERATOR: ${operator.toUpperCase()}`, 380, 52, { align: 'right', width: 160 });

      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
        .text(`GENERATED: ${generatedTime}`, 380, 68, { align: 'right', width: 160 });

      // --- METADATA PANEL ---
      doc.rect(40, 108, 515, 48).fill('#F1F5F9');
      doc.rect(40, 108, 515, 48).stroke('#CBD5E1');

      // Shift window
      doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('SHIFT WINDOW:', 52, 116);
      doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica')
        .text(`${options.shiftWindow.start}  →  ${options.shiftWindow.end} (${options.shiftWindow.timezone})`, 130, 116);

      // Reproducibility Hash
      doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('REPRODUCIBILITY HASH (SHA-256):', 52, 134);
      doc.fillColor('#2563EB').fontSize(8).font('Courier-Bold')
        .text(options.reproducibilityHash, 225, 134);

      let currentY = 170;

      // --- SECTIONS ---
      for (const sectionName of SECTIONS_ORDER) {
        const sectionItems = options.items.filter((item) => item.section === sectionName);
        const styling = SECTION_COLORS[sectionName];

        // Check page overflow
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        // Section header banner
        doc.rect(40, currentY, 515, 22).fill(styling.headerBg);
        doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
          .text(`${sectionName.toUpperCase()} (${sectionItems.length})`, 50, currentY + 6);
        currentY += 28;

        if (sectionItems.length === 0) {
          // Empty state: "Nothing to report"
          doc.rect(40, currentY, 515, 28).fill('#F8FAFC');
          doc.rect(40, currentY, 515, 28).stroke('#E2E8F0');
          doc.fillColor('#64748B').fontSize(9).font('Helvetica-Oblique')
            .text('Nothing to report (confirmed quiet within shift window)', 55, currentY + 9);
          currentY += 36;
        } else {
          for (const item of sectionItems) {
            // Check space for item card
            if (currentY > 720) {
              doc.addPage();
              currentY = 50;
            }

            const cardStartY = currentY;

            // Compute approximate height for item text
            doc.fontSize(9.5).font('Helvetica-Bold');
            const titleHeight = doc.heightOfString(item.item, { width: 480 });
            const cardHeight = Math.max(46, titleHeight + 28);

            // Item card background
            doc.rect(40, cardStartY, 515, cardHeight).fill('#FFFFFF');
            doc.rect(40, cardStartY, 515, cardHeight).stroke('#E2E8F0');

            // Left colored indicator bar
            doc.rect(40, cardStartY, 4, cardHeight).fill(styling.border);

            // Item summary text
            doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica')
              .text(item.item, 52, cardStartY + 8, { width: 490 });

            // Bottom metadata row: Source badge + Timestamp
            const metaY = cardStartY + cardHeight - 16;
            
            // Source Badge pill
            doc.rect(52, metaY - 2, 140, 14).fill(styling.lightBg);
            doc.rect(52, metaY - 2, 140, 14).stroke(styling.border);
            doc.fillColor(styling.text).fontSize(7.5).font('Courier-Bold')
              .text(item.source, 56, metaY);

            // Timestamp citation
            doc.fillColor('#64748B').fontSize(7.5).font('Helvetica')
              .text(`Event Time: ${item.timestamp}`, 205, metaY);

            if (item.progression && item.progression.length > 1) {
              doc.fillColor('#0284C7').fontSize(7.5).font('Helvetica-Oblique')
                .text(`History: ${item.progression.join(' → ')}`, 360, metaY, { width: 185, align: 'right' });
            }

            currentY += cardHeight + 6;
          }
          currentY += 6;
        }
      }

      // --- PAGE NUMBERING IN FOOTER ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica')
          .text(
            `NOC Operations Shift Report — Page ${i + 1} of ${totalPages} — Verified Grounded & Source Traceable`,
            40,
            800,
            { align: 'center', width: 515 }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
