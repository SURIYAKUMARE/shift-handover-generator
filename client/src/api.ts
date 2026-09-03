import { GenerationResult, PresetScenario, SourceHealth, ShiftWindow, GeneratedNoteItem, Event, CarriedForwardRecord } from './types';

const API_BASE = '/api';

export async function fetchPresets(): Promise<PresetScenario[]> {
  const res = await fetch(`${API_BASE}/shift/presets`);
  if (!res.ok) throw new Error('Failed to fetch shift presets');
  const data = await res.json();
  return data.presets;
}

export async function fetchSourcesStatus(): Promise<Record<string, SourceHealth>> {
  const res = await fetch(`${API_BASE}/sources/status`);
  if (!res.ok) throw new Error('Failed to fetch sources status');
  const data = await res.json();
  return data.sources;
}

export async function fetchCarriedOverItems(shiftStart?: string): Promise<{
  shift_start: string;
  count: number;
  items: CarriedForwardRecord[];
}> {
  const url = shiftStart
    ? `${API_BASE}/shift/carried-over?shift_start=${encodeURIComponent(shiftStart)}`
    : `${API_BASE}/shift/carried-over`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch carried-over items');
  return res.json();
}

export async function generateHandover(payload: {
  scenario?: string;
  shiftWindow: ShiftWindow;
  enabledSources: string[];
  simulateUnreachableSource?: string;
  customEvents?: Event[];
}): Promise<GenerationResult> {
  const res = await fetch(`${API_BASE}/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Generation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function downloadPDFExport(payload: {
  shiftWindow: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibilityHash: string;
  operator?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/shift/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to download PDF');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shift-handover-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadDOCXExport(payload: {
  shiftWindow: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibilityHash: string;
  operator?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/shift/export/docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to download DOCX');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shift-handover-${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadJSONComplianceManifest(payload: {
  shiftWindow: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibilityHash: string;
  operator?: string;
  stats?: any;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/shift/export/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to download JSON compliance manifest');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shift-compliance-manifest-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
