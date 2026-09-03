import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
  HeadingLevel,
} from 'docx';
import { GeneratedNoteItem, ShiftWindow, SectionType } from '../../types/index.js';

interface DOCXPublisherOptions {
  shiftWindow: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibilityHash: string;
  generatedAt?: string;
  operator?: string;
}

const SECTION_COLORS: Record<SectionType, string> = {
  'Blockers': 'B45309',    // Amber
  'In Progress': '1D4ED8', // Blue
  'Completed': '047857',   // Green
  'Watch-list': '6D28D9',  // Purple
};

const SECTIONS_ORDER: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];

export async function generateDOCXBuffer(options: DOCXPublisherOptions): Promise<Buffer> {
  const generatedTime = options.generatedAt || new Date().toISOString();
  const operator = options.operator || 'NOC Shift Supervisor';

  const docChildren: (Paragraph | Table)[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: 'SHIFT HANDOVER NOTE',
          bold: true,
          size: 32,
          color: '0F172A',
          font: 'Arial',
        }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'OFFICIAL NOC OPERATION LOG — SOURCED & REPRODUCIBLE',
          size: 18,
          color: '64748B',
          font: 'Arial',
        }),
      ],
      spacing: { after: 240 },
    })
  );

  // Metadata Table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.DASHED, size: 1, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Shift Window:', bold: true, size: 18, color: '334155' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${options.shiftWindow.start}  →  ${options.shiftWindow.end} (${options.shiftWindow.timezone})`,
                    size: 18,
                    color: '0F172A',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Operator / Timestamp:', bold: true, size: 18, color: '334155' })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${operator} | Generated at: ${generatedTime}`,
                    size: 18,
                    color: '0F172A',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Reproducibility (SHA-256):', bold: true, size: 18, color: '334155' })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.reproducibilityHash,
                    font: 'Courier New',
                    bold: true,
                    size: 16,
                    color: '2563EB',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  docChildren.push(metaTable);
  docChildren.push(new Paragraph({ spacing: { after: 300 } }));

  // Four Fixed Sections
  for (const section of SECTIONS_ORDER) {
    const sectionItems = options.items.filter((i) => i.section === section);
    const color = SECTION_COLORS[section];

    // Section Header
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `■ ${section.toUpperCase()} (${sectionItems.length})`,
            bold: true,
            size: 22,
            color: color,
            font: 'Arial',
          }),
        ],
        spacing: { before: 200, after: 120 },
      })
    );

    if (sectionItems.length === 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Nothing to report (confirmed quiet within shift window)',
              italics: true,
              size: 18,
              color: '64748B',
              font: 'Arial',
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } else {
      for (const item of sectionItems) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item.item}`,
                size: 20,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 60, after: 40 },
          }),
          new Paragraph({
            indent: { left: 360 },
            children: [
              new TextRun({
                text: `[Source: ${item.source}]`,
                bold: true,
                font: 'Courier New',
                size: 16,
                color: color,
              }),
              new TextRun({
                text: `   Timestamp: ${item.timestamp}`,
                font: 'Arial',
                size: 16,
                color: '64748B',
              }),
              ...(item.carried_forward
                ? [
                    new TextRun({
                      text: `   | [HELD OVER: ${item.shifts_open || 1} SHIFTS${(item.shifts_open || 1) >= 3 ? ' - STALE ESCALATION' : ''}]`,
                      bold: true,
                      font: 'Arial',
                      size: 16,
                      color: (item.shifts_open || 1) >= 3 ? 'B91C1C' : 'B45309',
                    }),
                  ]
                : []),
              ...(item.progression && item.progression.length > 1
                ? [
                    new TextRun({
                      text: `   | History: ${item.progression.join(' → ')}`,
                      italics: true,
                      font: 'Arial',
                      size: 16,
                      color: '0284C7',
                    }),
                  ]
                : []),
            ],
            spacing: { after: 140 },
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
