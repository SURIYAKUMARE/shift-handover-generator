import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Event, GeneratedNoteItem, ShiftWindow } from '../types/index.js';
import { generatePDFBuffer } from './publisher/pdfPublisher.js';
import { generateDOCXBuffer } from './publisher/docxPublisher.js';

async function runDummyPipeline() {
  console.log('--- PHASE 1: DUMMY PIPELINE VERIFICATION ---');

  // 1. Shift window trigger
  const shiftWindow: ShiftWindow = {
    start: '2026-09-03T18:00:00+05:30',
    end: '2026-09-04T02:00:00+05:30',
    timezone: 'Asia/Kolkata',
  };
  console.log(`[1. Trigger] Window defined: ${shiftWindow.start} to ${shiftWindow.end} (${shiftWindow.timezone})`);

  // 2. Fetch-activity dummy event
  const dummyRawEvent: Event = {
    source: 'ticketing',
    record_id: 'OPS-4821',
    timestamp: '2026-09-03T19:42:00+05:30',
    summary: 'Customer reported login failures on mobile app',
    status: 'open',
  };
  console.log('[2. Fetch-activity] Received raw event:', dummyRawEvent);

  // 3. Generator note item
  const dummyGeneratedItem: GeneratedNoteItem = {
    section: 'Blockers',
    item: 'OPS-4821 — login failures on mobile app, root cause not yet found; needs backend on-call',
    source: 'ticketing:OPS-4821',
    timestamp: '2026-09-03T19:42:00+05:30',
    raw_events: [dummyRawEvent],
    progression: ['open'],
    final_status: 'open',
  };

  const canonicalItems = JSON.stringify([dummyGeneratedItem]);
  const reproducibilityHash = crypto.createHash('sha256').update(canonicalItems).digest('hex');
  console.log(`[3. Generator] Note item generated. Reproducibility Hash: ${reproducibilityHash}`);

  // 4. Publisher - generate real PDF and DOCX
  const outputDir = path.resolve('exports_test');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'handover_dummy.pdf');
  const docxPath = path.join(outputDir, 'handover_dummy.docx');

  console.log('[4. Publisher] Generating PDF...');
  const pdfBuffer = await generatePDFBuffer({
    shiftWindow,
    items: [dummyGeneratedItem],
    reproducibilityHash,
    generatedAt: new Date().toISOString(),
    operator: 'Lead On-Call SRE',
  });
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`✓ PDF successfully written to ${pdfPath} (${pdfBuffer.length} bytes)`);

  console.log('[4. Publisher] Generating DOCX...');
  const docxBuffer = await generateDOCXBuffer({
    shiftWindow,
    items: [dummyGeneratedItem],
    reproducibilityHash,
    generatedAt: new Date().toISOString(),
    operator: 'Lead On-Call SRE',
  });
  fs.writeFileSync(docxPath, docxBuffer);
  console.log(`✓ DOCX successfully written to ${docxPath} (${docxBuffer.length} bytes)`);

  // Verify non-zero byte size
  if (pdfBuffer.length > 1000 && docxBuffer.length > 1000) {
    console.log('=== PHASE 1 COMPLETE: Real exported documents appear with dummy item! ===');
    process.exit(0);
  } else {
    console.error('FAILED: Output files too small or empty');
    process.exit(1);
  }
}

runDummyPipeline().catch((err) => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});
