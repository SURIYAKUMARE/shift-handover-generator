# Shift Handover Note Generator (Premium UI/UX)

A production-quality NOC control-room web application that ingests real, time-windowed activity across ticketing (Jira/Zendesk), incidents (PagerDuty/OpsGenie), and chat war-rooms (Slack/Teams), normalizes timestamps, deduplicates and collapses multi-event progressions, and generates a structured, source-grounded handover note exportable as a single PDF or DOCX.

---

## 1. Core Architectural Pipeline

```
[ Shift Window Trigger ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  fetch-activity                                         │
│  • Concurrently polls connected telemetry adapters     │
│  • Enforces strict interval: [shift_start, shift_end)  │
│  • Normalizes timestamps to UTC ISO-8601               │
│  • Isolates malformed timestamps into audit registry   │
│  • Catches unreachable sources gracefully              │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  generator                                             │
│  • Groups telemetry by (source, record_id)             │
│  • Collapses multiple updates into final state         │
│  • Formulates progression trace (e.g. open → escalated)│
│  • Evaluates deterministic section assignment rules    │
│  • Deterministically sorts items                       │
│  • Computes SHA-256 reproducibility fingerprint        │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  publisher (Single-File Exporter)                      │
│  • Executive PDF (via pdfkit) with NOC color accents   │
│  • Structured DOCX (via docx) with metadata & tables   │
│  • Preserves exact source citations & timestamps       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Non-Negotiable Guarantees

### 1. Grounding & 2-Click Traceability Guarantee
- **Zero Fabricated Content**: No hallucinated text, generic filler, or free-form prose.
- **Every Line Cites its Source**: Formatted as `[system_name:record_id]` with timestamp (e.g. `ticketing:OPS-4821`).
- **2-Click Drill-down Drawer**: Clicking any source badge in the UI immediately opens a slide-in side drawer displaying:
  - The exact raw telemetry event(s) collapsed into that note item
  - Progression timeline showing each state change, author, and timestamp
  - Full syntax-highlighted raw JSON payload for inspection and verification

### 2. Mandatory Deduplication & Progression Collapse
- Telemetry events are strictly grouped by `(source, record_id)`.
- Updates are sorted chronologically.
- If a ticket was updated multiple times in the shift (e.g. `triaging` → `open` → `escalated` → `in_progress`), the engine collapses them into a single line reflecting the final state while summarizing progression:
  ```
  OPS-5501 — User registration 500: Auth-v2.16 rolled back; error rate dropping below 0.1% [Progression: triaging → open → escalated → in_progress]
  ```
- Retains all raw telemetry events in the item payload for audit verification.

### 3. Four Fixed Sections (Deterministic Assignment Rules)
Items are classified via deterministic, documented operational logic (never vibes):

| Section | Assignment Rule | Styling / Behavior |
| :--- | :--- | :--- |
| **Blockers / Escalations** | Status is `blocked` or `escalated`; OR severity is `critical` / `P1`; OR summary indicates blocked on external dependencies / awaiting on-call. | Amber badge (`#F59E0B`), high visual priority. |
| **In Progress** | Active status (`open`, `investigating`, `triaging`, `in_progress`, `active`, `pending`) without an unmitigated blocker. | Blue badge (`#3B82F6`), mid visual priority. |
| **Completed** | Final status in window is `resolved`, `closed`, `completed`, `fixed`, or `mitigated`. If an issue was escalated earlier in the window but subsequently resolved, it belongs here. | Emerald badge (`#10B981`), calm confirmation. |
| **Watch-list** | Status is `monitoring`, `watch`, `provisional`, `degraded`, or explicitly flagged for post-change soak observation. | Purple badge (`#8B5CF6`), observation priority. |

*Empty Sections*: When a section has 0 matching events, it renders an explicit, calm **"Nothing to report (confirmed quiet within shift window)"** banner. It is never omitted and never styled as an error.

### 4. Reproducibility Guarantee (Idempotency)
- Notes are sorted deterministically by `(section_order, timestamp DESC, record_id)`.
- A canonical SHA-256 checksum is computed over the normalized items.
- Running the generator on the exact same shift window produces an identical item count and identical SHA-256 fingerprint (`Verified 100% Match`).

### 5. Resilient Hostile-Input Handling
- **Unreachable / Timing-Out Source**: If an upstream adapter fails (e.g. Slack API 503 or network timeout), the adapter logs an inline warning, skips the source gracefully, and proceeds with healthy sources without crashing.
- **Malformed Timestamps**: Corrupted timestamp strings are safely intercepted and placed in a dedicated *"Needs Review / Flagged Telemetry"* audit strip rather than silently dropped or throwing exceptions.
- **Zero-Event Shift**: Calm "Quiet shift — nothing to report across all sources" presentation.
- **Single-File Export Failure**: Fails loudly with an explicit error dialog if export fails.

---

## 3. Test Scenarios Built-In

The UI includes one-click scenario chips for instant verification:

1. **Busy Shift (High-Severity Multi-Source)**:
   - 13 raw events across Ticketing, P1 Incidents, and Slack War-Rooms.
   - Stresses density across all four handover categories.
2. **Quiet Shift (Routine Maintenance)**:
   - 2 minor resolved tasks.
   - Demonstrates serene "Nothing to report" state across empty sections.
3. **Messy Shift (Deduplication Stress Test)**:
   - Multiple out-of-order updates to `OPS-5501` and `OPS-5502`.
   - Ticket `INC-7701` opened, mitigated, and resolved in the same shift.
   - Verifies progression collapse and boundary filtering.
4. **Hostile Inputs (Unreachable Source & Malformed Event)**:
   - Simulates Slack API 503 outage and `OPS-MALFORMED` corrupted timestamp.
   - Confirms graceful degradation and audit banner isolation.
5. **Zero-Event Shift**:
   - Confirms completely quiet shift behavior.
6. **Custom Shift Window**:
   - User defines arbitrary start/end datetimes with multi-timezone support (IST, UTC, EST, PST, BST, SGT).

---

## 4. Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Vite.
  - NOC Control-Room Dark Mode default (`#090D16`), with Light Mode toggle.
  - JetBrains Mono / monospace typography for record IDs, timestamps, and SHA-256 hashes.
- **Backend**: Node.js 24, Express, TypeScript, Vitest.
  - Modular pipeline architecture: `pipeline/fetcher/`, `pipeline/generator/`, `pipeline/publisher/`.
- **Publishers**:
  - `pdfkit`: Produces a single-file executive PDF with header, metadata box, color-coded section cards, citations, and page numbering.
  - `docx`: Produces a single-file Microsoft Word document mirroring the visual structure.

---

## 5. Getting Started & Verification

### Running the App
```bash
# Start backend server (port 4000)
cd server
npm run dev

# Start frontend dashboard (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Automated Test Suite
```bash
# Run unit & pipeline tests
cd server
npm test

# Run end-to-end integration verification (tests all 10 API flows)
npx tsx test/e2e_verify.ts
```
