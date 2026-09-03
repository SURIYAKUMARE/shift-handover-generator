import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ScenarioBar } from './components/ScenarioBar';
import { ShiftSetup } from './components/ShiftSetup';
import { ActivityHistogram } from './components/ActivityHistogram';
import { LiveGenerationState } from './components/LiveGenerationState';
import { NoteReviewScreen } from './components/NoteReviewScreen';
import { SourceDrillDownDrawer } from './components/SourceDrillDownDrawer';
import { ExportBar } from './components/ExportBar';
import { AuditBanner } from './components/AuditBanner';
import { RelayTransferStrip } from './components/RelayTransferStrip';
import { playChimeSuccess, playTactileBlip } from './utils/audio';
import { SignOffModal } from './components/SignOffModal';
import { CustomEventModal } from './components/CustomEventModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import {
  ShiftWindow,
  PresetScenario,
  SourceHealth,
  GenerationResult,
  GeneratedNoteItem,
  GenerationStageLog,
  Event as TelemetryEvent,
  CarriedForwardRecord,
} from './types';
import {
  fetchPresets,
  fetchSourcesStatus,
  fetchCarriedOverItems,
  generateHandover,
  downloadPDFExport,
  downloadDOCXExport,
  downloadJSONComplianceManifest,
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

  // User-injected custom events
  const [customEvents, setCustomEvents] = useState<TelemetryEvent[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [previousHash, setPreviousHash] = useState<string | undefined>(undefined);
  const [stageLogs, setStageLogs] = useState<GenerationStageLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected hour filter from ActivityHistogram
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Drilldown Drawer State
  const [selectedItem, setSelectedItem] = useState<GeneratedNoteItem | null>(null);

  // Two-party Sign-off state
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [signedOffData, setSignedOffData] = useState<{
    incomingEngineer: string;
    outgoingEngineer: string;
    timestamp: string;
    notes: string;
  } | undefined>(undefined);

  // Custom Event Modal & Command Palette Modal
  const [isCustomEventOpen, setIsCustomEventOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  // Pre-generation carried-over items state
  const [carriedOverPreview, setCarriedOverPreview] = useState<CarriedForwardRecord[]>([]);

  const outgoingOperator = 'Suriya K. (Lead SRE)';

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

  // Fetch carried-over preview whenever shiftWindow.start changes
  useEffect(() => {
    async function loadCarriedOver() {
      try {
        const res = await fetchCarriedOverItems(shiftWindow.start);
        setCarriedOverPreview(res.items);
      } catch (err) {
        console.warn('Could not load carried over preview:', err);
      }
    }
    loadCarriedOver();
  }, [shiftWindow.start]);

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
    async (
      scenarioToUse?: string,
      windowToUse?: ShiftWindow,
      unreachableOverride?: string,
      extraEvents?: TelemetryEvent[]
    ) => {
      playTactileBlip();
      setIsGenerating(true);
      setErrorMsg(null);

      // Save previous hash for visual reproducibility match
      if (generationResult?.reproducibility_hash) {
        setPreviousHash(generationResult.reproducibility_hash);
      }

      const activeScenario = scenarioToUse || selectedScenario;
      const activeWindow = windowToUse || shiftWindow;
      const activeUnreachable =
        unreachableOverride !== undefined ? unreachableOverride : simulateUnreachable;
      const activeCustomEvents = extraEvents !== undefined ? extraEvents : customEvents;

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
          customEvents: activeCustomEvents,
        });

        setGenerationResult(result);
        setStageLogs(result.stage_logs);
        setSourcesHealth(result.sources_status);
        playChimeSuccess();
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
    [selectedScenario, shiftWindow, enabledSources, simulateUnreachable, customEvents, generationResult]
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

  // Add custom injected event
  const handleAddCustomEvent = (newEvent: TelemetryEvent) => {
    const updated = [...customEvents, newEvent];
    setCustomEvents(updated);
    handleGenerate(undefined, undefined, undefined, updated);
  };

  // Single-File Export Handlers
  const handleExportPDF = async () => {
    if (!generationResult) return;
    await downloadPDFExport({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator: outgoingOperator,
    });
  };

  const handleExportDOCX = async () => {
    if (!generationResult) return;
    await downloadDOCXExport({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator: outgoingOperator,
    });
  };

  const handleExportJSON = async () => {
    if (!generationResult) return;
    await downloadJSONComplianceManifest({
      shiftWindow: generationResult.shift_window,
      items: generationResult.items,
      reproducibilityHash: generationResult.reproducibility_hash,
      operator: outgoingOperator,
      stats: generationResult.stats,
    });
  };

  const handleConfirmSignOff = (incomingEngineer: string, notes: string) => {
    playChimeSuccess();
    setSignedOffData({
      incomingEngineer,
      outgoingEngineer: outgoingOperator,
      timestamp: new Date().toLocaleTimeString(),
      notes,
    });
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside inputs or textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'g' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleGenerate();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExportPDF();
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleExportDOCX();
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsCustomEventOpen(true);
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSignOffModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  // Hourly Filtered Items
  const displayedItems = React.useMemo(() => {
    if (!generationResult) return [];
    if (!selectedHour) return generationResult.items;
    return generationResult.items.filter((item) => item.timestamp.slice(11, 13) === selectedHour);
  }, [generationResult, selectedHour]);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F8FAFC] flex flex-col font-sans">
      {/* Shift Watch Log Header (Relay baton framing) */}
      <Header
        shiftWindow={shiftWindow}
        isGenerating={isGenerating}
        onGenerate={() => handleGenerate()}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onOpenCustomEvent={() => setIsCustomEventOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        reproducibilityHash={generationResult?.reproducibility_hash}
        previousHash={previousHash}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        itemCount={generationResult?.items.length || 0}
      />

      {/* Main Ledger Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 pb-24">
        {/* Shift Relay Baton Hero Strip */}
        <RelayTransferStrip
          shiftWindow={shiftWindow}
          outgoingLead={outgoingOperator}
          incomingLead={signedOffData?.incomingEngineer}
          isSignedOff={!!signedOffData}
          onOpenSignOff={() => setIsSignOffModalOpen(true)}
          itemsCount={generationResult?.items.length || 0}
          blockersCount={generationResult?.items.filter((i) => i.section === 'Blockers').length || 0}
          reproducibilityHash={generationResult?.reproducibility_hash}
        />

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
          carriedOverItems={carriedOverPreview}
        />

        {/* Visual Hourly Activity Histogram */}
        {generationResult && generationResult.items.length > 0 && (
          <ActivityHistogram
            items={generationResult.items}
            shiftWindow={generationResult.shift_window}
            selectedHour={selectedHour}
            onSelectHour={setSelectedHour}
          />
        )}

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
          <div className="p-3.5 mb-5 rounded-lg bg-[#12171F] border border-[#EF4444]/50 text-[#F8FAFC] text-xs font-mono shadow-console">
            <strong className="text-[#EF4444]">Ingestion Failure:</strong> {errorMsg}
          </div>
        )}

        {/* Operational Note Review Ledger */}
        {generationResult && (
          <NoteReviewScreen
            items={displayedItems}
            shiftWindow={generationResult.shift_window}
            onSelectSource={(item) => setSelectedItem(item)}
            reproducibilityHash={generationResult.reproducibility_hash}
            onOpenSignOff={() => setIsSignOffModalOpen(true)}
            isSignedOff={!!signedOffData}
            signedOffBy={signedOffData?.incomingEngineer}
          />
        )}
      </main>

      {/* Evidence Docket Drawer */}
      <SourceDrillDownDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Two-Party Handover Sign-off Modal */}
      {generationResult && (
        <SignOffModal
          isOpen={isSignOffModalOpen}
          onClose={() => setIsSignOffModalOpen(false)}
          shiftWindow={generationResult.shift_window}
          blockersCount={generationResult.items.filter((i) => i.section === 'Blockers').length}
          totalItemsCount={generationResult.items.length}
          reproducibilityHash={generationResult.reproducibility_hash}
          onConfirmSignOff={handleConfirmSignOff}
          isSignedOff={!!signedOffData}
          signedOffData={signedOffData}
        />
      )}

      {/* Custom Telemetry Event Injector Modal */}
      <CustomEventModal
        isOpen={isCustomEventOpen}
        onClose={() => setIsCustomEventOpen(false)}
        shiftWindow={shiftWindow}
        onAddEvent={handleAddCustomEvent}
      />

      {/* Keyboard Shortcuts Command Palette */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Sticky Handoff Bar */}
      {generationResult && (
        <ExportBar
          onExportPDF={handleExportPDF}
          onExportDOCX={handleExportDOCX}
          onExportJSON={handleExportJSON}
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
