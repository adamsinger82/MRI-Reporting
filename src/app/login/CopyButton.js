'use client';
// CopyButton.js — Col 2 report-ready status indicator.
//
// The actual clipboard copy now happens automatically the instant a report
// finishes generating (see clipboardUtils.js -> autoCopyReport, called from
// page.js's generateReport()/generateRheumReport()). This component no
// longer copies anything itself — it just confirms the report is ready.
//
// formatForPSOne stays exported here because clipboardUtils.js imports it
// to build the auto-copied text (kept in this file to avoid duplicating
// the PS One formatting rules in two places).
//
// USAGE IN page.js (unchanged):
//   <CopyButton generatedReport={generatedReport} dm={dm} />

// PS One: clean structured text
// - Section headers stay in ALL CAPS with colon
// - Subheadings stay as "Structure: finding"
// - Strips any residual markdown
// - Adds standard PS One line spacing
export function formatForPSOne(reportText) {
  if (!reportText) return '';

  return reportText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):/gm, '\n$1:')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function formatPlainText(reportText) {
  if (!reportText) return '';

  return reportText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function CopyButton({ generatedReport, dm }) {
  if (!generatedReport?.trim()) return null;

  return (
    <p style={{
      fontSize: 13,
      fontWeight: 700,
      color: dm ? '#4ade80' : '#16a34a',
      margin: 0,
      textAlign: 'center',
      padding: '10px 0',
      letterSpacing: '0.01em',
    }}>
      ✓ Ready to paste directly into your reporting software
    </p>
  );
}
