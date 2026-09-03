async function runE2EVerification() {
  console.log('=== STARTING END-TO-END SYSTEM VERIFICATION ===\n');

  const BASE_URL = 'http://localhost:4000';

  // 1. Healthcheck
  console.log('[Test 1] Healthcheck API');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('Healthcheck status:', healthData);
  if (healthData.status !== 'ok') throw new Error('Healthcheck failed');

  // 2. Presets API
  console.log('\n[Test 2] Presets Metadata API');
  const presetsRes = await fetch(`${BASE_URL}/api/shift/presets`);
  const presetsData = await presetsRes.json();
  console.log(`Loaded ${presetsData.presets.length} presets:`, presetsData.presets.map((p: any) => p.id));

  // 3. Live Sources Status API
  console.log('\n[Test 3] Live Sources Health Status API');
  const sourcesRes = await fetch(`${BASE_URL}/api/sources/status`);
  const sourcesData = await sourcesRes.json();
  console.log('Sources health:', Object.keys(sourcesData.sources).map(k => `${k}: ${sourcesData.sources[k].status} (${sourcesData.sources[k].latency_ms}ms)`));

  // 4. Scenario: Busy Shift
  console.log('\n[Test 4] Scenario: Busy Shift Generation');
  const busyPreset = presetsData.presets.find((p: any) => p.id === 'busy');
  const busyGenRes = await fetch(`${BASE_URL}/api/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: 'busy',
      shiftWindow: busyPreset.defaultWindow,
      enabledSources: ['ticketing', 'incident', 'chat'],
    }),
  });
  const busyNote = await busyGenRes.json();
  console.log(`✓ Ingested: ${busyNote.stats.total_raw_events}, In-window: ${busyNote.stats.events_in_window}, Collapsed: ${busyNote.stats.deduplicated_items}`);
  console.log('Section counts:', busyNote.stats.sections_count);
  console.log(`Reproducibility SHA-256: ${busyNote.reproducibility_hash}`);
  if (busyNote.items.length === 0) throw new Error('Busy shift produced 0 items');

  // 5. Reproducibility Test: Run identical busy shift second time
  console.log('\n[Test 5] Reproducibility Idempotency Verification (2nd run)');
  const busyGenRes2 = await fetch(`${BASE_URL}/api/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: 'busy',
      shiftWindow: busyPreset.defaultWindow,
      enabledSources: ['ticketing', 'incident', 'chat'],
    }),
  });
  const busyNote2 = await busyGenRes2.json();
  console.log(`Run 1 Hash: ${busyNote.reproducibility_hash}`);
  console.log(`Run 2 Hash: ${busyNote2.reproducibility_hash}`);
  if (busyNote.reproducibility_hash !== busyNote2.reproducibility_hash) {
    throw new Error('FAILED: Hashes do not match!');
  }
  console.log('✓ IDENTICAL REPRODUCIBILITY CONFIRMED (100% Match)');

  // 6. Scenario: Quiet Shift
  console.log('\n[Test 6] Scenario: Quiet Shift ("Nothing to report" state)');
  const quietPreset = presetsData.presets.find((p: any) => p.id === 'quiet');
  const quietGenRes = await fetch(`${BASE_URL}/api/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: 'quiet',
      shiftWindow: quietPreset.defaultWindow,
      enabledSources: ['ticketing', 'incident', 'chat'],
    }),
  });
  const quietNote = await quietGenRes.json();
  console.log('Quiet shift quiet sections:', quietNote.stats.quiet_sections);
  if (!quietNote.stats.quiet_sections.includes('Blockers')) throw new Error('Blockers was not quiet in quiet shift');

  // 7. Scenario: Messy Shift (Deduplication Stress Test)
  console.log('\n[Test 7] Scenario: Messy Shift (Deduplication & Progression Collapse)');
  const messyPreset = presetsData.presets.find((p: any) => p.id === 'messy');
  const messyGenRes = await fetch(`${BASE_URL}/api/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: 'messy',
      shiftWindow: messyPreset.defaultWindow,
      enabledSources: ['ticketing', 'incident', 'chat'],
    }),
  });
  const messyNote = await messyGenRes.json();
  console.log(`Raw events: ${messyNote.stats.total_raw_events} -> Collapsed: ${messyNote.stats.deduplicated_items}`);
  const ops5501 = messyNote.items.find((i: any) => i.source === 'ticketing:OPS-5501');
  console.log('Collapsed item for OPS-5501:', ops5501?.item);
  console.log('OPS-5501 progression:', ops5501?.progression);
  if (!ops5501 || !ops5501.progression) throw new Error('OPS-5501 did not collapse progression properly');

  // 8. Scenario: Hostile Inputs
  console.log('\n[Test 8] Scenario: Hostile Inputs (Unreachable source + malformed timestamp)');
  const hostilePreset = presetsData.presets.find((p: any) => p.id === 'hostile');
  const hostileGenRes = await fetch(`${BASE_URL}/api/shift/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: 'hostile',
      shiftWindow: hostilePreset.defaultWindow,
      enabledSources: ['ticketing', 'incident', 'chat'],
      simulateUnreachableSource: 'chat',
    }),
  });
  const hostileNote = await hostileGenRes.json();
  console.log('Hostile warnings:', hostileNote.warnings);
  console.log('Hostile flagged events:', hostileNote.flagged_events.map((f: any) => f.reason));
  if (hostileNote.flagged_events.length === 0) throw new Error('Malformed timestamp was not isolated');
  if (hostileNote.warnings.length === 0) throw new Error('Unreachable source did not generate warning');

  // 9. PDF Export over HTTP
  console.log('\n[Test 9] PDF Document Exporter HTTP endpoint');
  const pdfRes = await fetch(`${BASE_URL}/api/shift/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shiftWindow: busyNote.shift_window,
      items: busyNote.items,
      reproducibilityHash: busyNote.reproducibility_hash,
      operator: 'Lead On-Call SRE',
    }),
  });
  const pdfBuf = await pdfRes.arrayBuffer();
  console.log(`✓ Exported PDF: ${pdfBuf.byteLength} bytes, Content-Type: ${pdfRes.headers.get('content-type')}`);
  if (pdfBuf.byteLength < 1000) throw new Error('PDF export too small');

  // 10. DOCX Export over HTTP
  console.log('\n[Test 10] DOCX Document Exporter HTTP endpoint');
  const docxRes = await fetch(`${BASE_URL}/api/shift/export/docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shiftWindow: busyNote.shift_window,
      items: busyNote.items,
      reproducibilityHash: busyNote.reproducibility_hash,
      operator: 'Lead On-Call SRE',
    }),
  });
  const docxBuf = await docxRes.arrayBuffer();
  console.log(`✓ Exported DOCX: ${docxBuf.byteLength} bytes, Content-Type: ${docxRes.headers.get('content-type')}`);
  if (docxBuf.byteLength < 1000) throw new Error('DOCX export too small');

  console.log('\n=============================================');
  console.log('✓ ALL 10 END-TO-END PIPELINE TESTS PASSED!');
  console.log('=============================================\n');
}

runE2EVerification().catch((err) => {
  console.error('E2E Verification failed:', err);
  process.exit(1);
});
