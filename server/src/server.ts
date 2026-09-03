import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ShiftWindow, GeneratedNoteItem } from './types/index.js';
import {
  MockTicketingAdapter,
  MockIncidentAdapter,
  MockChatAdapter,
} from './pipeline/fetcher/adapters.js';
import { fetchActivity } from './pipeline/fetcher/fetchActivity.js';
import { generateHandoverNote } from './pipeline/generator/handoverGenerator.js';
import { generatePDFBuffer } from './pipeline/publisher/pdfPublisher.js';
import { generateDOCXBuffer } from './pipeline/publisher/docxPublisher.js';
import { SEED_SCENARIOS } from './seeds/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize adapters
const ticketingAdapter = new MockTicketingAdapter();
const incidentAdapter = new MockIncidentAdapter();
const chatAdapter = new MockChatAdapter();

const ADAPTERS_MAP = {
  ticketing: ticketingAdapter,
  incident: incidentAdapter,
  chat: chatAdapter,
};

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'shift-handover-generator', uptime: process.uptime() });
});

// Presets metadata
app.get('/api/shift/presets', (req: Request, res: Response) => {
  const presets = Object.entries(SEED_SCENARIOS).map(([key, data]) => ({
    id: key,
    name: data.name,
    description: data.description,
    defaultWindow: data.defaultWindow,
    simulatedUnreachable: data.simulateUnreachableSource,
  }));
  res.json({ presets });
});

// Live Sources Health
app.get('/api/sources/status', async (req: Request, res: Response) => {
  try {
    const statuses = await Promise.all([
      ticketingAdapter.checkHealth(),
      incidentAdapter.checkHealth(),
      chatAdapter.checkHealth(),
    ]);
    res.json({
      sources: statuses.reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
      }, {} as Record<string, any>),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Shift Handover Generation Endpoint
app.post('/api/shift/generate', async (req: Request, res: Response) => {
  try {
    const {
      scenario = 'busy',
      shiftWindow,
      enabledSources = ['ticketing', 'incident', 'chat'],
      simulateUnreachableSource,
    } = req.body;

    if (!shiftWindow || !shiftWindow.start || !shiftWindow.end) {
      return res.status(400).json({ error: 'shiftWindow with start and end is required' });
    }

    // Configure scenario on adapters
    ticketingAdapter.setScenario(scenario);
    incidentAdapter.setScenario(scenario);
    chatAdapter.setScenario(scenario);

    // Apply simulation overrides if requested
    ticketingAdapter.setSimulateUnreachable(simulateUnreachableSource === 'ticketing');
    incidentAdapter.setSimulateUnreachable(simulateUnreachableSource === 'incident');
    chatAdapter.setSimulateUnreachable(simulateUnreachableSource === 'chat');

    // Select active adapters
    const activeAdapters = enabledSources
      .map((id: string) => ADAPTERS_MAP[id as keyof typeof ADAPTERS_MAP])
      .filter(Boolean);

    // 1. Fetch activity
    const fetchResult = await fetchActivity(activeAdapters, shiftWindow);

    // 2. Generate Handover Note (Dedup, section rules, deterministic sort, SHA-256)
    const result = generateHandoverNote(
      fetchResult.inWindowEvents,
      shiftWindow,
      fetchResult.totalRawEvents,
      fetchResult.sourcesHealth,
      fetchResult.warnings,
      fetchResult.flaggedEvents,
      fetchResult.stageLogs
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error generating shift handover:', err);
    res.status(500).json({
      error: err.message || 'Internal error in shift handover generation pipeline',
    });
  }
});

// Single-File PDF Export
app.post('/api/shift/export/pdf', async (req: Request, res: Response) => {
  try {
    const { shiftWindow, items, reproducibilityHash, operator } = req.body;
    if (!shiftWindow || !items || !reproducibilityHash) {
      return res.status(400).json({ error: 'Missing required export payload fields' });
    }

    const pdfBuffer = await generatePDFBuffer({
      shiftWindow,
      items,
      reproducibilityHash,
      operator: operator || 'Lead On-Call SRE',
      generatedAt: new Date().toISOString(),
    });

    const filename = `shift-handover-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF Export failure:', err);
    res.status(500).json({ error: `Failed to export PDF: ${err.message}` });
  }
});

// Single-File DOCX Export
app.post('/api/shift/export/docx', async (req: Request, res: Response) => {
  try {
    const { shiftWindow, items, reproducibilityHash, operator } = req.body;
    if (!shiftWindow || !items || !reproducibilityHash) {
      return res.status(400).json({ error: 'Missing required export payload fields' });
    }

    const docxBuffer = await generateDOCXBuffer({
      shiftWindow,
      items,
      reproducibilityHash,
      operator: operator || 'Lead On-Call SRE',
      generatedAt: new Date().toISOString(),
    });

    const filename = `shift-handover-${new Date().toISOString().slice(0, 10)}.docx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);
    res.send(docxBuffer);
  } catch (err: any) {
    console.error('DOCX Export failure:', err);
    res.status(500).json({ error: `Failed to export DOCX: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`[Shift Handover Service] Running on port ${PORT}`);
  console.log(`Ready to process shift windows.`);
});
