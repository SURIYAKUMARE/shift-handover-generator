import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ScenarioBar } from './components/ScenarioBar';
import { ShiftSetup } from './components/ShiftSetup';
import { LiveGenerationState } from './components/LiveGenerationState';
import { NoteReviewScreen } from './components/NoteReviewScreen';
import { SourceDrillDownDrawer } from './components/SourceDrillDownDrawer';
import { ExportBar } from './components/ExportBar';
import { AuditBanner } from './components/AuditBanner';
import {
  ShiftWindow,
  PresetScenario,
  SourceHealth,
  GenerationResult,
  GeneratedNoteItem,
  GenerationStageLog,
} from './types';
import {
  fetchPresets,
  fetchSourcesStatus,
  generateHandover,
  downloadPDFExport,
  downloadDOCXExport,
} from './api';

export const App: React.FC = () => {
  // Low-strain console dark mode default
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Scenarios and Presets
  const [presets, setPresets] = useState<PresetScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('busy');

  // Shift Window Configuration
  const [shiftWindow, setShiftWindow] = useState<ShiftWindow>({
    start: '2026-09-03T16:00:00+05:30',
    end: '2026-09-04T00:00:00+05:30',
    timezone: 'Asia/Kolkata',
  });

  // Sources
  const [enabledSources, setEnabledSources] = useState<string[]>([
    'ticketing',
    'incident',
    'chat',
  ]);
  const [sourcesHealth, setSourcesHealth] = useState<Record<string, SourceHealth>>({});
  const [simulateUnreachable, setSimulateUnreachable] = useState<string>('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [previousHash, setPreviousHash] = useState<string | undefined>(undefined);
  const [stageLogs, setStageLogs] = useState<GenerationStageLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drilldown Drawer State
  const [selectedItem, setSelectedItem] = useState<GeneratedNoteItem | null>(null);

  const operator = 'Lead On-Call SRE';

  // Toggle dark/light classes on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Load Presets & Initial Health on mount
  useEffect(() => {
    async function init() {
      try {
        const [loadedPresets, health] = await Promise.all([
          fetchPresets(),
          fetchSourcesStatus(),
        ]);
        setPresets(loadedPresets);
        setSourcesHealth(health);

        const busyPreset = loadedPresets.find((p) => p.id === 'busy');
        if (busyPreset) {
          setShiftWindow(busyPreset.defaultWindow);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  const handleRefreshHealth = async () => {
    try {
      const health = await fetchSourcesStatus();
      setSourcesHealth(health);
    } catch (err: any) {
      console.error('Ping feeds failed:', err);
    }
  };

  // Generation Handler
  const handleGenerate = useCallback(
    async (scenarioToUse?: string, windowToUse?: ShiftWindow, unreachableOverride?: string) => {
      setIsGenerating(true);
      setErrorMsg(null);

      // Track previous hash for visual reproducibility match
      if (generationResult?.reproducibility_hash) {
        setPreviousHash(generationResult.reproducibility_hash);
      }

      const activeScenario = scenarioToUse || selectedScenario;
      const activeWindow = windowToUse || shiftWindow;
      const activeUnreachable =
        unreachableOverride !== undefined ? unreachableOverride : simulateUnreachable;

      setStageLogs([
        {
          id: 'stage-init',
          stage: 'Ingesting Telemetry',
          status: 'running',
          message: `Ingesting telemetry feeds for interval ${activeWindow.start} to ${activeWindow.end} (${activeWindow.timezone})...`,
          timestamp: new Date().toISOString(),
        },
      ]);

      try {
        const result = await generateHandover({
          scenario: activeScenario === 'custom' ? 'busy' : activeScenario,
          shiftWindow: activeWindow,
          enabledSources,
          simulateUnreachableSource: activeUnreachable || undefined,
        });

        setGenerationResult(result);
        setStageLogs(result.stage_logs);
        setSourcesHealth(result.sources_status);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to compile shift handover note');
        setStageLogs((prev) => [
          ...prev,
          {
            id: 'err-terminal',
            stage: 'Compilation Halt',
            status: 'warning',
            message: `Pipeline exception: ${err.message}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedScenario, shiftWindow, enabledSources, simulateUnreachable, generationResult]
  );

  // Initial auto-compilation on first load once presets ready
  useEffect(() => {
    if (presets.length > 0 && !generationResult && !isGenerating) {
      handleGenerate('busy');
    }
  }, [presets, generationResult, isGenerating, handleGenerate]);

  // Scenario Selection Handler
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    if (scenarioId === 'custom') return;

    const preset = presets.find((p) => p.id === scenarioId);
    if (preset) {
      setShiftWindow(preset.defaultWindow);
      const sim = preset.simulatedUnreachable || '';
      setSimulateUnreachable(sim);
      handleGenerate(scenarioId, preset.defaultWindow, sim);
    }
  };

  // Single-File Export Handlers
  const handleExportPDF = async () => {
    if (!generationResult) return;
    await downloadPDFExport({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator,
    });
  };

  const handleExportDOCX = async () => {
    if (!generationResult) return;
    await downloadDOCXExport({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator,
    });
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans">
      {/* Shift Watch Log Header (Relay baton framing) */}
      <Header
        shiftWindow={shiftWindow}
        isGenerating={isGenerating}
        onGenerate={() => handleGenerate()}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        reproducibilityHash={generationResult?.reproducibility_hash}
        previousHash={previousHash}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        itemCount={generationResult?.items.length || 0}
      />

      {/* Main Ledger Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 pb-24">
        {/* Test Scenarios Presets */}
        <ScenarioBar
          presets={presets}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          disabled={isGenerating}
        />

        {/* Operating Window & Feed Configuration */}
        <ShiftSetup
          shiftWindow={shiftWindow}
          setShiftWindow={setShiftWindow}
          sourcesHealth={sourcesHealth}
          enabledSources={enabledSources}
          setEnabledSources={setEnabledSources}
          simulateUnreachable={simulateUnreachable}
          setSimulateUnreachable={setSimulateUnreachable}
          onRefreshHealth={handleRefreshHealth}
        />

        {/* Vertical Compilation Stepper Trace */}
        <LiveGenerationState
          stageLogs={stageLogs}
          isGenerating={isGenerating}
          stats={generationResult?.stats}
        />

        {/* Telemetry Ingestion Notice Banner */}
        {generationResult && (
          <AuditBanner
            warnings={generationResult.warnings}
            flaggedEvents={generationResult.flagged_events}
            isQuietShift={generationResult.stats.is_quiet_shift}
          />
        )}

        {/* Critical Failure Notice */}
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded bg-[#161B22] border border-[#D29922]/50 text-[#F0F6FC] text-xs font-mono">
            <strong className="text-[#D29922]">Ingestion Failure:</strong> {errorMsg}
          </div>
        )}

        {/* Operational Note Review Ledger */}
        {generationResult && (
          <NoteReviewScreen
            items={generationResult.items}
            shiftWindow={generationResult.shift_window}
            onSelectSource={(item) => setSelectedItem(item)}
            reproducibilityHash={generationResult.reproducibility_hash}
          />
        )}
      </main>

      {/* Evidence Docket Drawer */}
      <SourceDrillDownDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Sticky Handoff Bar */}
      {generationResult && (
        <ExportBar
          onExportPDF={handleExportPDF}
          onExportDOCX={handleExportDOCX}
          onRegenerate={() => handleGenerate()}
          reproducibilityHash={generationResult.reproducibility_hash}
          previousHash={previousHash}
          generatedAt={generationResult.generated_at}
          isGenerating={isGenerating}
          itemCount={generationResult.items.length}
        />
      )}
    </div>
  );
};

export default App;
