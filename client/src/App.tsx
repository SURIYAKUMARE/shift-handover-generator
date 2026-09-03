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
  // Theme state: dark mode default
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

  // Toggle dark/light class on document
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
        console.error('Initial setup error:', err);
      }
    }
    init();
  }, []);

  const handleRefreshHealth = async () => {
    try {
      const health = await fetchSourcesStatus();
      setSourcesHealth(health);
    } catch (err: any) {
      console.error('Ping sources failed:', err);
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

      // Simulated local stage animation
      setStageLogs([
        {
          id: 'stage-init',
          stage: 'Pipeline Initialized',
          status: 'running',
          message: `Ingesting sources for shift interval ${activeWindow.start} → ${activeWindow.end} (${activeWindow.timezone})…`,
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
        setErrorMsg(err.message || 'Failed to generate shift handover note');
        setStageLogs((prev) => [
          ...prev,
          {
            id: 'err-terminal',
            stage: 'Generation Pipeline',
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

  // Initial auto-generation on first render once presets ready
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

  // Single-File PDF Export
  const handleExportPDF = async () => {
    if (!generationResult) return;
    await downloadPDFExport({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator,
    });
  };

  // Single-File DOCX Export
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
    <div className="min-h-screen bg-noc-bg text-noc-text flex flex-col font-sans transition-colors duration-200">
      {/* NOC Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isGenerating={isGenerating}
        operator={operator}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* Scenario Switcher Bar */}
        <ScenarioBar
          presets={presets}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          disabled={isGenerating}
        />

        {/* Shift Window Configuration */}
        <ShiftSetup
          shiftWindow={shiftWindow}
          setShiftWindow={setShiftWindow}
          sourcesHealth={sourcesHealth}
          enabledSources={enabledSources}
          setEnabledSources={setEnabledSources}
          simulateUnreachable={simulateUnreachable}
          setSimulateUnreachable={setSimulateUnreachable}
          onGenerate={() => handleGenerate()}
          isGenerating={isGenerating}
          onRefreshHealth={handleRefreshHealth}
        />

        {/* Pipeline Execution Trace */}
        <LiveGenerationState
          stageLogs={stageLogs}
          isGenerating={isGenerating}
          stats={generationResult?.stats}
        />

        {/* Audit & Hostile Input Banners */}
        {generationResult && (
          <AuditBanner
            warnings={generationResult.warnings}
            flaggedEvents={generationResult.flagged_events}
            isQuietShift={generationResult.stats.is_quiet_shift}
          />
        )}

        {/* Error notification if pipeline fails */}
        {errorMsg && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
            <strong>CRITICAL FAILURE:</strong> {errorMsg}
          </div>
        )}

        {/* Structured Note Review Screen */}
        {generationResult && (
          <NoteReviewScreen
            items={generationResult.items}
            shiftWindow={generationResult.shift_window}
            onSelectSource={(item) => setSelectedItem(item)}
            reproducibilityHash={generationResult.reproducibility_hash}
          />
        )}
      </main>

      {/* Source Drill-Down Drawer (2-click verification) */}
      <SourceDrillDownDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Sticky Export & Reproducibility Bar */}
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
